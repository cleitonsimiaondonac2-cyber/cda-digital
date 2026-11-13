#!/usr/bin/env python3
"""Cria ou promove uma conta de administrador da CDA.

Uso recomendado (a senha não fica no histórico nem em ficheiros):
    ./ia/venv/bin/python -m ia.criar_admin --email admin@cda-mz.org

A senha é pedida no terminal. Para automação local, `--senha-stdin` lê uma
única linha do stdin.
"""
import argparse
import getpass
import sys

from .auth import gerar_hash_senha
from .db import Membro, criar_tabelas, sessao


def main() -> int:
    parser = argparse.ArgumentParser(description="Criar/promover administrador CDA")
    parser.add_argument("--email", default="admin@cda-mz.org")
    parser.add_argument("--nome", default="Administrador CDA")
    parser.add_argument("--senha-stdin", action="store_true",
                        help="lê a senha de uma linha do stdin (automação)")
    args = parser.parse_args()

    if args.senha_stdin:
        senha = sys.stdin.readline().rstrip("\n")
    else:
        senha = getpass.getpass("Senha do administrador: ")
        confirmar = getpass.getpass("Repetir senha: ")
        if senha != confirmar:
            print("As senhas não coincidem.", file=sys.stderr)
            return 1
    if len(senha) < 8:
        print("A senha deve ter pelo menos 8 caracteres.", file=sys.stderr)
        return 1

    criar_tabelas()
    email = args.email.lower().strip()
    with sessao() as s:
        m = s.query(Membro).filter(Membro.email == email).first()
        if m:
            m.nome = args.nome.strip() or m.nome
            m.hash_senha = gerar_hash_senha(senha)
            m.is_admin = True
            m.ativo = True
            acao = "actualizado"
        else:
            s.add(Membro(nome=args.nome.strip(), email=email,
                         hash_senha=gerar_hash_senha(senha),
                         is_admin=True, ativo=True))
            acao = "criado"
        s.commit()
    print(f"Administrador {acao}: {email}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
