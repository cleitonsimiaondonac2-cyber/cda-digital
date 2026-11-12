#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validador dos datasets publicados em `site/data/`.

Regras de bolso (porquê cada check existe):

  * Os JSON **não** se escrevem à mão — são gerados por `build_datasets.py`
    (membros/eventos/timeline) e `build_documentos.py` (documentos). Este
    script é a rede de segurança que garante que a geração não regrediu.
  * Um check que rebenta com excepção é um check inútil: uma excepção deve
    contar como FAIL, com o nome do check e a excepção em causa, nunca
    derrubar o validador inteiro. (É exactamente o defeito que fazia
    `tools/verify_contrast.py --selftest` rebentar com `KeyError`.)
  * O `--selftest` tem de passar por *todos* os checks, com uma fixture que
    satisfaz integralmente o esquema, para provar que o validador detecta
    defeitos e não apenas que não levanta.

Uso:
    python3 tools/verify_datasets.py              # valida site/data/
    python3 tools/verify_datasets.py --selftest   # prova que detecta defeitos
    python3 tools/verify_datasets.py --dir X      # valida outrodirectório

Código de saída: 0 se tudo passar, 1 se falhar qualquer check, 2 se o
validador não conseguir sequer correr (ex.: datasets ausentes).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import tempfile
import traceback
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# Constantes do esquema
# ─────────────────────────────────────────────────────────────────────────────

RAIZ = Path(__file__).resolve().parent.parent
DIR_DADOS = RAIZ / "site" / "data"
DIR_DOCS = RAIZ / "site" / "docs"

# Contagens que a auditoria fixa como verdade (defeito D17).
TOTAL_MEMBROS = 218
TOTAL_EVENTOS = 38

# As colunas do CSV que contêm PII e que NUNCA podem ser publicadas.
# Derivado do cabeçalho real de `CDA_membros.csv`.
COLUNAS_PII_PROIBIDAS = {
    "cod_cedula", "codcedula", "cedula", "bi", "bi_cic", "bic",
    "nuit", "endereco", "morada", "endereco_residencial",
    "tel_movel", "telemovel", "tlf_movel", "telefone", "telefone_pessoal",
    "tel_fixo", "tlf_fixo", "fax", "email", "e_mail", "mail", "nascimento",
    "data_nascimento",
}

CHAVES_MEMBROS = {"nome", "nCarta", "empresa", "situacao", "provincia",
                  "delegacao", "activo"}
CHAVES_EVENTOS = {"data", "ano", "dataTxt", "tipo", "tipoLabel", "titulo",
                  "fonte", "local"}
CHAVES_TIMELINE = {"ano", "data", "titulo", "descricao", "categoria"}
CHAVES_DOCUMENTOS = {"ficheiro", "titulo", "tipo", "numero", "ano",
                     "emissor", "tituloOriginal"}

TIPOS_DOCUMENTO = {
    "Circular", "Ordem de Serviço", "Comunicado", "Estatuto", "Regulamento",
    "Decreto", "Lei", "Boletim", "Ata", "Convocatória", "Acta", "Relatório",
    "Outro",
}
CATEGORIAS_TIMELINE = {"legal", "organizacional", "actividade", "digital"}

# Padrões de PII nos valores de texto.
RE_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]{2,}")
RE_TEL_MZ = re.compile(r"(?:\+258|00258)[\s-]?(?:8[2-79])[\s-]?\d{3}[\s-]?\d{3}")
RE_TEL_BRUTO = re.compile(r"\b8[2-79]\d{6}\b")


# ─────────────────────────────────────────────────────────────────────────────
# Infraestrutura de checks
# ─────────────────────────────────────────────────────────────────────────────

class Falha(Exception):
    """Um check falhou. A mensagem é o que se mostra ao utilizador."""


def ok(mensagem: str = "") -> None:
    print(f"  PASS  {mensagem}")


def ko(mensagem: str) -> None:
    print(f"  FAIL  {mensagem}")


def exigir(condicao: bool, mensagem: str) -> None:
    if not condicao:
        raise Falha(mensagem)


def carregar(diretorio: Path, nome: str) -> list:
    """Carrega um dataset; levanta Falha com mensagem clara se algo falhar."""
    caminho = diretorio / nome
    exigir(caminho.is_file(), f"ficheiro ausente: {caminho}")
    try:
        bruto = caminho.read_text(encoding="utf-8")
    except OSError as erro:
        raise Falha(f"não foi possível ler {caminho}: {erro}") from erro
    try:
        dados = json.loads(bruto)
    except json.JSONDecodeError as erro:
        raise Falha(f"JSON inválido em {caminho}: {erro}") from erro
    exigir(isinstance(dados, list), f"{nome}: esperado array JSON, veio "
                                    f"{type(dados).__name__}")
    exigir(len(dados) > 0, f"{nome}: lista vazia")
    return dados


# ─────────────────────────────────────────────────────────────────────────────
# Checks individuais
# ─────────────────────────────────────────────────────────────────────────────

def check_membros(dados: list, diretorio: Path) -> None:
    exigir(len(dados) == TOTAL_MEMBROS,
           f"esperados {TOTAL_MEMBROS} membros (D17: o cabeçalho 'Actualização "
           f"de Endereço' não é uma pessoa), vieram {len(dados)}")
    ok(f"membros.json: {len(dados)} registos (esperado {TOTAL_MEMBROS})")

    # Nenhum registo degenerado sobreviveu.
    degenerados = [r.get("nome") for r in dados
                   if not str(r.get("nome") or "").strip()
                   or not str(r.get("nCarta") or "").strip()]
    exigir(not degenerados,
           f"registos sem nome ou sem nCarta (linhas junk): {degenerados[:5]}")

    # Todas as chaves exigidas existem em todos os registos.
    for indice, registo in enumerate(dados):
        em_falta = CHAVES_MEMBROS - set(registo)
        exigir(not em_falta,
               f"membros[{indice}] sem chaves {sorted(em_falta)}")
    ok(f"membros.json: todos os {len(dados)} registos têm as chaves exigidas")

    # --- PRIVACIDADE -------------------------------------------------------
    # (1) Nenhuma coluna proibida pode existir como chave.
    for registo in dados:
        proibidas = {k for k in registo if k.lower() in COLUNAS_PII_PROIBIDAS}
        exigir(not proibidas,
               f"membros: chave(s) de PII publicada(s): {sorted(proibidas)}")

    # (2) Nenhum valor de texto pode conter email/telefone.
    for indice, registo in enumerate(dados):
        for chave, valor in registo.items():
            if not isinstance(valor, str):
                continue
            exigir(not RE_EMAIL.search(valor),
                   f"membros[{indice}].{chave} contém um e-mail: {valor!r}")
            exigir(not RE_TEL_MZ.search(valor),
                   f"membros[{indice}].{chave} contém um telefone: {valor!r}")
            exigir(not RE_TEL_BRUTO.search(valor),
                   f"membros[{indice}].{chave} contém um telefone: {valor!r}")

    # (3) O `nCarta` é a carteira profissional (identificador público mantido
    #     por brief); não pode ser confundido com BI. Sanidade: 12 dígitos.
    for indice, registo in enumerate(dados):
        n = str(registo.get("nCarta") or "")
        exigir(n.isdigit() and len(n) == 12,
               f"membros[{indice}].nCarta fora do formato esperado: {n!r}")
    ok(f"membros.json: zero PII (sem e-mails, sem telefones, sem colunas "
       f"proibidas); nCarta validado como carteira de 12 dígitos")


def check_eventos(dados: list, diretorio: Path) -> None:
    exigir(len(dados) == TOTAL_EVENTOS,
           f"esperados {TOTAL_EVENTOS} eventos, vieram {len(dados)}")
    ok(f"eventos.json: {len(dados)} registos (esperado {TOTAL_EVENTOS})")

    for indice, registo in enumerate(dados):
        em_falta = CHAVES_EVENTOS - set(registo)
        exigir(not em_falta,
               f"eventos[{indice}] sem chaves {sorted(em_falta)}")

        # D21: sem `tipoLabel` legível o site mostra o código cru (REU, AGO…).
        rotulo = str(registo.get("tipoLabel") or "").strip()
        exigir(rotulo != "", f"eventos[{indice}] sem `tipoLabel` (D21)")
        exigir(not rotulo.isupper(),
               f"eventos[{indice}].tipoLabel parece código cru, não rótulo: "
               f"{rotulo!r}")

        # `dataTxt` tem de ser legível mesmo quando não há data exacta.
        exigir(str(registo.get("dataTxt") or "").strip() != "",
               f"eventos[{indice}] sem `dataTxt`")

        # `ano`/`data` coerentes quando a data existe.
        data = registo.get("data")
        if data:
            exigir(re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(data)) is not None,
                   f"eventos[{indice}].data não está em ISO: {data!r}")
            exigir(int(str(data)[:4]) == registo.get("ano"),
                   f"eventos[{indice}]: ano {registo.get('ano')} não bate com "
                   f"data {data!r}")
    ok(f"eventos.json: 0 eventos sem `tipoLabel`, 0 sem `dataTxt`, "
       f"ano/data coerentes (D21 resolvido)")


def check_timeline(dados: list, diretorio: Path) -> None:
    exigir(12 <= len(dados) <= 25,
           f"esperadas 12–25 entradas na cronologia, vieram {len(dados)}")
    ok(f"timeline.json: {len(dados)} entradas (intervalo 12–25)")

    vistos = set()
    for indice, registo in enumerate(dados):
        em_falta = CHAVES_TIMELINE - set(registo)
        exigir(not em_falta,
               f"timeline[{indice}] sem chaves {sorted(em_falta)}")
        exigir(1960 <= int(registo["ano"]) <= 2030,
               f"timeline[{indice}].ano implausível: {registo['ano']}")
        exigir(registo.get("categoria") in CATEGORIAS_TIMELINE,
               f"timeline[{indice}].categoria inválida: "
               f"{registo.get('categoria')!r}")
        exigir(str(registo.get("titulo") or "").strip() != "",
               f"timeline[{indice}] sem `titulo`")
        exigir(str(registo.get("descricao") or "").strip() != "",
               f"timeline[{indice}] sem `descricao`")

        # Datas parciais vão em `ano` com `data: null` — nunca meio inventada.
        data = registo.get("data")
        if data:
            exigir(re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(data)) is not None,
                   f"timeline[{indice}].data não está em ISO: {data!r}")
            exigir(int(str(data)[:4]) == int(registo["ano"]),
                   f"timeline[{indice}]: ano {registo['ano']} não bate com "
                   f"data {data!r}")

        chave = (registo["ano"], str(registo["titulo"]))
        exigir(chave not in vistos,
               f"timeline: entrada duplicada {chave}")
        vistos.add(chave)

    anos = [int(r["ano"]) for r in dados]
    exigir(anos == sorted(anos),
           "timeline.json não está ordenado cronologicamente")
    ok("timeline.json: ordenado cronologicamente, sem entradas duplicadas, "
       "datas parciais com `data: null`")


def check_documentos(dados: list, diretorio: Path) -> None:
    # 1 entrada por PDF em disco.
    require_dir = RAIZ / "site" / "docs"
    if not require_dir.is_dir():
        raise Falha(f"directório de PDFs ausente: {require_dir}")
    pdfs = {p.name for p in require_dir.iterdir()
            if p.is_file() and p.suffix.lower() == ".pdf"}

    vistos = set()
    for indice, registo in enumerate(dados):
        em_falta = CHAVES_DOCUMENTOS - set(registo)
        exigir(not em_falta,
               f"documentos[{indice}] sem chaves {sorted(em_falta)}")

        ficheiro = registo.get("ficheiro") or ""
        exigir(ficheiro != "", f"documentos[{indice}] sem `ficheiro`")
        exigir(ficheiro not in vistos,
               f"documentos: ficheiro duplicado {ficheiro!r}")
        vistos.add(ficheiro)

        alvo = require_dir / ficheiro
        exigir(alvo.is_file(),
               f"documentos[{indice}]: `{ficheiro}` não existe em site/docs/")
        exigir(ficheiro in pdfs,
               f"documentos[{indice}]: `{ficheiro}` não é um PDF indexado")

        exigir(registo.get("tipo") in TIPOS_DOCUMENTO,
               f"documentos[{indice}].tipo fora da lista permitida: "
               f"{registo.get('tipo')!r}")
        ano = registo.get("ano")
        if ano is not None:
            exigir(1990 <= int(ano) <= 2030,
                   f"documentos[{indice}].ano fora de 1990–2030: {ano!r}")

    orphans = pdfs - vistos
    exigir(not orphans,
           f"{len(orphans)} PDF(s) em site/docs/ sem entrada no índice "
           f"(exemplos: {sorted(orphans)[:3]})")
    ok(f"documentos.json: 1 entrada por cada um dos {len(pdfs)} PDFs em "
       f"disco, todos com `tipo` válido e `ano` plausível")


# ─────────────────────────────────────────────────────────────────────────────
# Corredor dos checks
# ─────────────────────────────────────────────────────────────────────────────

# Ordem estável: (rótulo, função, booleano que diz se precisa de `site/docs`).
CHECKS = [
    ("membros.json  (S3.1.1 — 218 registos, sem PII)",
     "membros.json", check_membros),
    ("eventos.json  (S3.1.2 — 38 eventos, rótulos legíveis)",
     "eventos.json", check_eventos),
    ("timeline.json (S3.1.3 — cronologia institucional)",
     "timeline.json", check_timeline),
    ("documentos.json (S3.1.4 — índice dos 266 PDFs)",
     "documentos.json", check_documentos),
]


def correr_todos(diretorio: Path, verboso: bool = True) -> list[bool]:
    """Corre todos os checks. Devolve a lista de resultados (True = passou).

    Nenhum check pode derrubar o corrida: qualquer excepção — até uma
    `KeyError` vinda de uma fixture incompleta — é apanhada e contada como
    FAIL. É a lição do `--selftest` de `verify_contrast.py`.
    """
    resultados: list[bool] = []
    if verboso:
        print(f"\nA validar datasets em: {diretorio}\n" + "-" * 66)

    for rotulo, nome, funcao in CHECKS:
        try:
            dados = carregar(diretorio, nome)
            funcao(dados, diretorio)
            resultados.append(True)
            if verboso:
                ok(rotulo)
        except Falha as falha:
            resultados.append(False)
            if verboso:
                ko(f"{rotulo}\n          └─ {falha}")
        except Exception as erro:  # noqa: BLE001 - é o ponto do exercício
            resultados.append(False)
            if verboso:
                ko(f"{rotulo}\n          └─ EXCEPÇÃO NÃO TRATADA "
                   f"{type(erro).__name__}: {erro}")
                if os.environ.get("VERIFY_DATASETS_TRACEBACK"):
                    traceback.print_exc()
    return resultados


# ─────────────────────────────────────────────────────────────────────────────
# --selftest: provar que o validador DETECTA defeitos
# ─────────────────────────────────────────────────────────────────────────────

def _fixture_completa(destino: Path) -> None:
    """Escrebe um dataset sintético que satisfaz *integralmente* o esquema.

    É deliberadamente Completo: a fixture que acompanha o `--selftest` de
    `verify_contrast.py` não definia as variáveis todas e o self-test rebentava
    com `KeyError`. Aqui cada registo tem todas as chaves, pelo que qualquer
    falha observada é uma falha de *dados*, nunca uma excepção.
    """
    destino.mkdir(parents=True, exist_ok=True)

    membros = [{
        "nome": f"Pessoa Teste {i}",
        "nCarta": f"{i:012d}",
        "empresa": "Empresa Teste, Lda",
        "situacao": "Independente",
        "provincia": "Maputo",
        "delegacao": "Sul",
        "activo": True,
    } for i in range(1, TOTAL_MEMBROS + 1)]
    (destino / "membros.json").write_text(
        json.dumps(membros, ensure_ascii=False, indent=2), encoding="utf-8")

    eventos = [{
        "data": "2020-01-01", "ano": 2020, "dataTxt": "01-01-2020",
        "tipo": "REU", "tipoLabel": "Reunião",
        "titulo": f"Reunião {i}", "fonte": "x.pdf", "local": None,
    } for i in range(TOTAL_EVENTOS)]
    (destino / "eventos.json").write_text(
        json.dumps(eventos, ensure_ascii=False, indent=2), encoding="utf-8")

    timeline = [{
        "ano": 2000 + i, "data": None,
        "titulo": f"Marco {i}", "descricao": "descrição",
        "categoria": "organizacional",
    } for i in range(12)]
    (destino / "timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False, indent=2), encoding="utf-8")

    documentos = [{
        "ficheiro": p.name, "titulo": "Título", "tipo": "Circular",
        "numero": None, "ano": 2015, "emissor": "CDA",
        "tituloOriginal": p.name,
    } for p in sorted((RAIZ / "site" / "docs").glob("*.pdf"))]
    (destino / "documentos.json").write_text(
        json.dumps(documentos, ensure_ascii=False, indent=2), encoding="utf-8")


def selftest() -> int:
    print("Auto-teste do validador de datasets")
    print("=" * 66)
    problemas: list[str] = []

    temporario = Path(tempfile.mkdtemp(prefix="verify_datasets_selftest_"))
    try:
        # ── 1. Uma fixture completa tem de PASSAR todos os checks ──────────
        boa = temporario / "bom"
        _fixture_completa(boa)
        resultados = correr_todos(boa, verboso=False)
        if all(resultados):
            ok("fixture completa passa nos 4 checks (nenhuma excepção)")
        else:
            idx = [CHECKS[i][1] for i, r in enumerate(resultados) if not r]
            ko(f"fixture completa falhou em: {idx}")
            problemas.append("fixture completa não passa")

        # ── 2. Cada defeito injectado tem de ser DETECTADO ──────────────────
        # (dataset, mutação, check esperado a falhar)
        cenarios: list[tuple[str, str, Path]] = [
            ("membros com linha junk (D17)",
             "membros.json", boa),
            ("evento sem tipoLabel (D21)",
             "eventos.json", boa),
            ("número de eventos errado",
             "eventos.json", boa),
            ("e-mail de associado publicado (D20)",
             "membros.json", boa),
            ("cronologia fora de ordem",
             "timeline.json", boa),
            ("PDF em disco sem entrada no índice",
             "documentos.json", boa),
            ("tipo de documento inválido",
             "documentos.json", boa),
            ("JSON corrompido",
             "eventos.json", boa),
        ]

        for descricao, nome, base in cenarios:
            alvo = temporario / f"caso_{len(problemas)}_{abs(hash(descricao))}"
            shutil.copytree(base, alvo)
            caminho = alvo / nome

            if descricao.startswith("membros com linha junk"):
                dados = json.loads(caminho.read_text(encoding="utf-8"))
                dados.append({"nome": "Actualização de Endereço", "nCarta": "",
                              "empresa": None, "situacao": None,
                              "provincia": None, "delegacao": None,
                              "activo": False})
                caminho.write_text(json.dumps(dados, ensure_ascii=False,
                                             indent=2), encoding="utf-8")
                indice_esperado = 0
            elif descricao.startswith("evento sem tipoLabel"):
                dados = json.loads(caminho.read_text(encoding="utf-8"))
                dados[3]["tipoLabel"] = ""
                caminho.write_text(json.dumps(dados, ensure_ascii=False,
                                             indent=2), encoding="utf-8")
                indice_esperado = 1
            elif descricao.startswith("número de eventos"):
                dados = json.loads(caminho.read_text(encoding="utf-8"))
                caminho.write_text(json.dumps(dados[:-1], ensure_ascii=False,
                                             indent=2), encoding="utf-8")
                indice_esperado = 1
            elif descricao.startswith("e-mail"):
                dados = json.loads(caminho.read_text(encoding="utf-8"))
                dados[0]["email"] = "pessoa@exemplo.co.mz"
                caminho.write_text(json.dumps(dados, ensure_ascii=False,
                                             indent=2), encoding="utf-8")
                indice_esperado = 0
            elif descricao.startswith("cronologia fora de ordem"):
                dados = json.loads(caminho.read_text(encoding="utf-8"))
                dados[0], dados[-1] = dados[-1], dados[0]
                caminho.write_text(json.dumps(dados, ensure_ascii=False,
                                             indent=2), encoding="utf-8")
                indice_esperado = 2
            elif descricao.startswith("PDF em disco"):
                documentos = json.loads(caminho.read_text(encoding="utf-8"))
                caminho.write_text(json.dumps(documentos[:-1],
                                             ensure_ascii=False, indent=2),
                                   encoding="utf-8")
                indice_esperado = 3
            elif descricao.startswith("tipo de documento"):
                documentos = json.loads(caminho.read_text(encoding="utf-8"))
                documentos[2]["tipo"] = "Tipo Inventado"
                caminho.write_text(json.dumps(documentos, ensure_ascii=False,
                                             indent=2), encoding="utf-8")
                indice_esperado = 3
            else:  # JSON corrompido
                caminho.write_text("{ isto não é JSON", encoding="utf-8")
                indice_esperado = 1

            resultados = correr_todos(alvo, verboso=False)
            if resultados[indice_esperado]:
                ko(f"NÃO DETECTA: {descricao}")
                problemas.append(descricao)
            else:
                ok(f"detecta: {descricao}")

    finally:
        shutil.rmtree(temporario, ignore_errors=True)

    print("-" * 66)
    if problemas:
        ko(f"auto-teste FALHOU ({len(problemas)} problema(s))")
        return 1
    ok("auto-teste PASSOU — o validador detecta defeitos e não rebenta")
    return 0


# ─────────────────────────────────────────────────────────────────────────────
# main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> int:
    analisador = argparse.ArgumentParser(
        description="Valida os datasets publicados em site/data/.")
    analisador.add_argument("--dir", default=str(DIR_DADOS),
                            help="directório com os JSON (default: site/data)")
    analisador.add_argument("--selftest", action="store_true",
                            help="prova que o validador detecta defeitos")
    args = analisador.parse_args()

    if args.selftest:
        return selftest()

    diretorio = Path(args.dir).resolve()
    resultados = correr_todos(diretorio)

    total = len(resultados)
    passaram = sum(1 for r in resultados if r)
    print("-" * 66)
    if passaram == total:
        print(f"RESULTADO: PASS  ({passaram}/{total} checks)")
        return 0
    print(f"RESULTADO: FAIL  ({passaram}/{total} checks passaram, "
          f"{total - passaram} falharam)")
    return 1


if __name__ == "__main__":
    sys.exit(main())