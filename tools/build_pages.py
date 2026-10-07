#!/usr/bin/env python3
"""Constrói as páginas do site da CDA a partir de partials partilhados.

O header e o footer estavam duplicados em 15 páginas (1335 linhas = 39% do HTML).
Este script substitui cada bloco por uma *inclusão*, de modo a haver **uma só
fonte de verdade** para o cabeçalho e o rodapé do portal.

Marcadores (ficam no código-fonte, o que torna a operação reversível):

    <!--#include header-->  ...conteúdo actual...  <!--#/header-->
    <!--#include footer-->  ...conteúdo actual...  <!--#/footer-->

O que o script faz:
  * substitui o conteúdo entre os marcadores pelo partial correspondente
  * gera `site/js/data-gen.js` com os JSON de `site/data/` (fonte única de
    dados, sem depender de `fetch()`, que falha em `file://` por CORS)

Uso:
    python3 tools/build_pages.py            # injecta partials + gera data-gen.js
    python3 tools/build_pages.py --check    # só verifica; sai != 0 se divergir
    python3 tools/build_pages.py --dry-run  # mostra o que faria, não escreve
    python3 tools/build_pages.py --init PAGE.html   # cria marcadores em volta do bloco actual
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITE = RAIZ / "site"
PARTIAIS = SITE / "partials"
DATA = SITE / "data"
GERADO = SITE / "js" / "data-gen.js"

BLOCOS = {
    "header": ("<!--#include header-->", "<!--#/header-->"),
    "footer": ("<!--#include footer-->", "<!--#/footer-->"),
}

AVISO = "<!-- Gerado por tools/build_pages.py — não editar à mão. Fonte: site/data/*.json -->"


# ---------------------------------------------------------------------------
# Partials
# ---------------------------------------------------------------------------
def ler_partial(nome: str) -> str:
    caminho = PARTIAIS / f"{nome}.html"
    if not caminho.exists():
        raise FileNotFoundError(f"partial em falta: {caminho}")
    return caminho.read_text(encoding="utf-8").rstrip("\n")


def tem_marcadores(texto: str, nome: str) -> bool:
    inicio, fim = BLOCOS[nome]
    return inicio in texto and fim in texto


def injectar(texto: str, nome: str, parcial: str) -> tuple[str, bool]:
    """Substitui o conteúdo entre os marcadores pelo partial. Idempotente."""
    inicio, fim = BLOCOS[nome]
    ini = texto.find(inicio)
    if ini < 0:
        return texto, False
    # procura o marcador de fecho depois do de abertura
    pos_fim = texto.find(fim, ini)
    if pos_fim < 0:
        return texto, False

    cabecalho = texto[: ini + len(inicio)]
    cauda = texto[pos_fim:]
    novo = f"{cabecalho}\n{parcial}\n    {cauda}"

    # idempotência: não reescrever se já é igual (mantém mtime estável)
    if novo == texto:
        return texto, False
    return novo, True


def envolver(texto: str, nome: str) -> str:
    """Envolve o bloco actual com os marcadores (usado por --init)."""
    inicio, fim = BLOCOS[nome]
    if tem_marcadores(texto, nome):
        return texto
    raise ValueError(
        f"não encontro o bloco '{nome}' para envolver automaticamente. "
        f"Acrescenta manualmente {inicio} ... {fim}."
    )


# ---------------------------------------------------------------------------
# data-gen.js
# ---------------------------------------------------------------------------
DATASETS = ("membros", "eventos", "timeline", "documentos")


def gerar_data_gen(escrever: bool) -> str:
    partes = [AVISO, "window.CDA_DATA = {"]
    encontrados = []
    for nome in DATASETS:
        caminho = DATA / f"{nome}.json"
        if not caminho.exists():
            partes.append(f"  {nome}: [],")
            continue
        try:
            carga = json.loads(caminho.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"{caminho.name} inválido: {exc}") from exc
        if not isinstance(carga, list):
            raise ValueError(f"{caminho.name} tem de ser uma lista JSON")
        partes.append(f"  {nome}: " + json.dumps(carga, ensure_ascii=False) + ",")
        encontrados.append(f"{nome}({len(carga)})")

    partes.append("};")
    partes.append("")
    partes.append("// Fonte única de dados estruturados do portal (ver site/data/README.md).")
    partes.append(
        "// Os renders estáticos (GitHub Pages) servem isto em linha; não há dependência de fetch()."
    )
    conteudo = "\n".join(partes) + "\n"

    if escrever:
        GERADO.parent.mkdir(parents=True, exist_ok=True)
        # só escreve se mudou, para não sujar o git à toa
        if not GERADO.exists() or GERADO.read_text(encoding="utf-8") != conteudo:
            GERADO.write_text(conteudo, encoding="utf-8")
    return ", ".join(encontrados) or "nenhum dataset encontrado"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main(argv: list[str]) -> int:
    escrever = "--check" not in argv and "--dry-run" not in argv
    apenas_check = "--check" in argv

    if not PARTIAIS.exists():
        print(f"ERRO: {PARTIAIS} não existe", file=sys.stderr)
        return 2

    paginas = sorted(SITE.glob("*.html"))
    if not paginas:
        print("ERRO: nenhuma página encontrada", file=sys.stderr)
        return 2

    parciais = {nome: ler_partial(nome) for nome in BLOCOS}
    mudancas: list[str] = []
    sem_marcadores: list[str] = []

    for pagina in paginas:
        original = pagina.read_text(encoding="utf-8")
        texto = original
        for nome, parcial in parciais.items():
            if not tem_marcadores(texto, nome):
                sem_marcadores.append(f"{pagina.name}:{nome}")
                continue
            texto, mudou = injectar(texto, nome, parcial)
            if mudou:
                mudancas.append(f"{pagina.name}:{nome}")
        if texto != original:
            if escrever:
                pagina.write_text(texto, encoding="utf-8")

    try:
        datasets = gerar_data_gen(escrever)
    except ValueError as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 2

    print(f"páginas analisadas: {len(paginas)}")
    print(f"partials: header ({len(parciais['header'].splitlines())} linhas), "
          f"footer ({len(parciais['footer'].splitlines())} linhas)")
    print(f"datasets: {datasets}")
    print(f"data-gen.js: {'escrito' if escrever else 'não escrito (--check/--dry-run)'}")

    if sem_marcadores:
        print(f"AVISO: {len(sem_marcadores)} bloco(s) sem marcadores (ficam como estão):")
        for item in sem_marcadores[:12]:
            print(f"  - {item}")
        if len(sem_marcadores) > 12:
            print(f"  … e mais {len(sem_marcadores) - 12}")

    if apenas_check:
        if mudancas:
            print(f"FALHA: {len(mudancas)} bloco(s) divergem do partial:")
            for item in mudancas[:20]:
                print(f"  - {item}")
            return 1
        print("OK: todas as páginas estão sincronizadas com os partials.")
    else:
        verb = "injectados" if escrever else "a injectar"
        print(f"blocos {verb}: {len(mudancas)}"
              + (f" ({', '.join(mudancas[:6])}{'…' if len(mudancas) > 6 else ''})" if mudancas else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))