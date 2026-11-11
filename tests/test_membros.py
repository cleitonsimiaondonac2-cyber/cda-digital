#!/usr/bin/env python3
"""Testes da área de membro e do painel admin (TestClient, BD temporária).

Corre dentro do venv da IA:
    ia/venv/bin/python tests/test_membros.py
"""
import json
import os
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

# BD isolada: tem de ser definida antes de importar ia.db/ia.api.
_tmp = tempfile.NamedTemporaryFile(prefix="cda-test-", suffix=".db", delete=False)
_tmp.close()
os.environ["DATABASE_URL"] = "sqlite:///" + _tmp.name
os.environ["AUTH_SECRET"] = "test-secret-apenas-local"

from fastapi.testclient import TestClient  # noqa: E402
from ia import api  # noqa: E402
from ia.auth import criar_admin  # noqa: E402
from ia.db import criar_tabelas  # noqa: E402

PUBLICOS = json.loads((RAIZ / "site" / "data" / "membros.json").read_text(encoding="utf-8"))
REG = PUBLICOS[0]
ADMIN_EMAIL = "admin@teste.local"
ADMIN_SENHA = "senha-admin-123"
EMAIL_MEMBRO = "membro.teste@example.com"
SENHA_MEMBRO = "senha-membro-123"

falhas = 0


def check(nome, cond, detalhe=""):
    global falhas
    print(("  [OK] " if cond else "  [FALHA] ") + nome + ((" — " + detalhe) if detalhe and not cond else ""))
    if not cond:
        falhas += 1


def main():
    global falhas
    print("==> Área de membro + painel admin")

    with TestClient(api.app) as admin:
        criar_admin(ADMIN_EMAIL, ADMIN_SENHA, "Admin Teste")

        # --- registo inválido ---
        r = admin.post("/api/auth/registar", json={
            "nome": REG["nome"], "carteira": "000000000000",
            "email": "invalido@example.com", "senha": SENHA_MEMBRO})
        check("carteira inexistente → 400", r.status_code == 400, str(r.status_code))

        r = admin.post("/api/auth/registar", json={
            "nome": "Nome Errado", "carteira": REG["nCarta"],
            "email": "invalido@example.com", "senha": SENHA_MEMBRO})
        check("nome que não corresponde → 400", r.status_code == 400, str(r.status_code))

        # --- registo válido (pendente) ---
        r = admin.post("/api/auth/registar", json={
            "nome": REG["nome"], "carteira": REG["nCarta"],
            "email": EMAIL_MEMBRO, "senha": SENHA_MEMBRO,
            "telefone": "+258 84 000 0000", "entidade": REG.get("empresa", "")})
        check("registo válido → 200", r.status_code == 200, r.text[:120])
        check("registo fica pendente", r.status_code == 200 and r.json().get("estado") == "pendente")

        r = admin.post("/api/auth/registar", json={
            "nome": REG["nome"], "carteira": REG["nCarta"],
            "email": "outro@example.com", "senha": SENHA_MEMBRO})
        check("carteira duplicada → 409", r.status_code == 409, str(r.status_code))

        # --- login antes da aprovação ---
        membro = TestClient(api.app)
        r = membro.post("/api/auth/login", json={"email": EMAIL_MEMBRO, "senha": SENHA_MEMBRO})
        check("login pendente → 403", r.status_code == 403, str(r.status_code))

        # --- admin aprova ---
        r = admin.post("/api/auth/login", json={"email": ADMIN_EMAIL, "senha": ADMIN_SENHA})
        check("login admin → 200", r.status_code == 200 and r.json().get("is_admin") is True, r.text[:120])

        r = admin.get("/api/admin/membros")
        membros = r.json().get("membros", []) if r.status_code == 200 else []
        alvo = next((m for m in membros if m["email"] == EMAIL_MEMBRO), None)
        check("admin vê conta pendente", bool(alvo) and alvo.get("ativo") is False)

        r = admin.post(f"/api/admin/membros/{alvo['id']}/aprovar")
        check("admin aprova conta → 200", r.status_code == 200, r.text[:120])

        # --- login por carteira e resumo ---
        r = membro.post("/api/auth/login", json={"email": REG["nCarta"], "senha": SENHA_MEMBRO})
        check("login por carteira → 200", r.status_code == 200, r.text[:120])

        r = membro.get("/api/membro/resumo")
        resumo = r.json() if r.status_code == 200 else {}
        check("resumo → 200", r.status_code == 200, r.text[:120])
        check("resumo traz carteira", resumo.get("membro", {}).get("carteira") == REG["nCarta"])
        check("resumo traz registo público", resumo.get("registo_publico", {}).get("nome") == REG["nome"])
        quotas = resumo.get("quotas", [])
        check("aprovação cria quota do ano", len(quotas) == 1, str(quotas))

        # --- requerimento do membro ---
        r = membro.post("/api/membro/requerimentos",
                        json={"tipo": "Renovação de carteira", "descricao": "Teste"})
        req = r.json().get("requerimento", {}) if r.status_code == 200 else {}
        check("membro cria requerimento → 200", r.status_code == 200, r.text[:120])
        check("requerimento fica em análise", req.get("estado") == "em_analise")

        # --- admin trata quota e requerimento ---
        quota_id = quotas[0]["id"]
        r = admin.post(f"/api/admin/quotas/{quota_id}/pagar")
        check("admin marca quota paga → 200", r.status_code == 200, r.text[:120])

        r = admin.post(f"/api/admin/requerimentos/{req['id']}/estado",
                       json={"estado": "aprovado", "resposta": "Deferido."})
        check("admin aprova requerimento → 200", r.status_code == 200, r.text[:120])

        r = membro.get("/api/membro/resumo")
        final = r.json() if r.status_code == 200 else {}
        check("membro vê quota paga",
              any(q["estado"] == "paga" for q in final.get("quotas", [])))
        check("membro vê requerimento aprovado",
              any(x["estado"] == "aprovado" and x["resposta"] == "Deferido."
                  for x in final.get("requerimentos", [])))

        # --- isolamento: membro não acede ao admin ---
        r = membro.get("/api/admin/membros")
        check("membro não acede ao admin → 401", r.status_code == 401, str(r.status_code))

        membro.post("/api/auth/logout")
        r = membro.get("/api/membro/resumo")
        check("logout invalida a sessão → 401", r.status_code == 401, str(r.status_code))

    print(f"\nResultado: {falhas} falhas")
    return 1 if falhas else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    finally:
        Path(_tmp.name).unlink(missing_ok=True)
