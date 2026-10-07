#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_documentos.py — indexa TODOS os PDF de `site/docs/` para
`site/data/documentos.json`.

Princípio: os metadados são DERIVADOS APENAS DO NOME DO FICHEIRO.
Sem OCR, sem leitura do conteúdo, sem rede. Se o nome não diz, o campo
fica `null` — é preferível um `null` honesto a um palpite inventado.

Determinístico e reexecutável: a ordem de saída é a ordem alfabética do
sistema de ficheiros e nada depende de data/hora.

Uso:
    python3 tools/build_documentos.py
    python3 tools/build_documentos.py --docs site/docs --saida site/data/documentos.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from typing import Any

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_DOCS_POR_DEFECTO = os.path.join(RAIZ, "site", "docs")
SAIDA_POR_DEFECTO = os.path.join(RAIZ, "site", "data", "documentos.json")

# ─────────────────────────────────────────────────────────────────────────────
# Listas permitidas (o validador usa as mesmas — mantê-las em sincronia)
# ─────────────────────────────────────────────────────────────────────────────

TIPOS_PERMITIDOS = [
    "Circular", "Ordem de Serviço", "Comunicado", "Estatuto", "Regulamento",
    "Decreto", "Lei", "Boletim", "Acta", "Convocatória", "Relatório", "Outro",
]

EMISSORES_PERMITIDOS = ["CDA", "AT", "DGA", "MTC", "Outro", None]

ANO_MIN = 1990
ANO_MAX = 2030

# Siglas que o nome do ficheiro usa para identificar o emissor.
# A forma "canónica" é a primeira da lista de cada grupo.
SIGLAS_EMISSOR = {
    "cda": "CDA",
    "at": "AT",
    "dga": "DGA",
    "gd": "DGA", "gdg": "DGA", "gda": "DGA", "gdc": "DGA",
    "dag": "DGA", "gdga": "DGA", "gdg": "DGA",
    "mtci": "MTC", "mtc": "MTC",
}

# Ordem de classificação: o primeiro padrão que casa ganha. Por isso
# "circular-...-taxa-de-servico..." é Circular e não Ordem de Serviço.
REGRAS_TIPO: list[tuple[str, str]] = [
    (r"circul?ar|circula|ciircular|circuar", "Circular"),
    (r"ordem[- ]de[- ]servi", "Ordem de Serviço"),
    (r"(^|[- ])os[- ]n[- ]", "Ordem de Serviço"),
    (r"comunicado", "Comunicado"),
    (r"estatuto", "Estatuto"),
    (r"regulamento", "Regulamento"),
    (r"decreto", "Decreto"),
    (r"ley|lei[- ]n[- ]|^lei[- ]", "Lei"),
    (r"diploma[- ]ministerial", "Outro"),
    (r"boletim", "Boletim"),
    (r"revista[- ]despachante", "Boletim"),
    (r"o[- ]despachante[- ]edicao", "Boletim"),
    (r"acta|ata[- ]d", "Acta"),
    (r"convocatoria", "Convocatória"),
    (r"relatorio", "Relatório"),
]

# Palavras que ficam em minúscula dentro de um título em pt-MZ.
MINUSCULAS = {
    "de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas",
    "para", "por", "com", "a", "o", "as", "os", "um", "uma", "ao", "à",
    "sobre", "entre", "durante", "nao", "sao",
}

# Siglas que se mantêm em maiúsculas num título.
SIGLAS_TITULO = {
    "cda", "at", "dga", "mtci", "mtc", "sadc", "cplp", "idai", "gd", "gdg",
    "gda", "gdc", "dag", "od", "acess", "ii", "iii", "iv", "ficha",
}


def log(msg: str) -> None:
    print("[build_documentos] " + msg, file=sys.stderr)


# ─────────────────────────────────────────────────────────────────────────────
# Classificação por tipo
# ─────────────────────────────────────────────────────────────────────────────

def classificar_tipo(slug: str) -> str:
    for padrao, tipo in REGRAS_TIPO:
        if re.search(padrao, slug):
            return tipo
    return "Outro"


# ─────────────────────────────────────────────────────────────────────────────
# Número, ano e emissor
# ─────────────────────────────────────────────────────────────────────────────

# "n-005", "n-01", "no-21", "numero-10", "n-1" — o token do número é lido
# token a token na função de extracção (não por regex global), para não
# confundir o número com dígitos espalhados pelo resto do nome.
TOKEN_NUMERO = re.compile(r"(?:n[oº]?|numero|num)(\d{1,3})")

# Ano de 2 dígitos numa posição claramente de ano: final do nome, logo
# depois de uma sigla de entidade. Ex.: "...-cda-14", "...-dga-16"
RE_ANO2 = re.compile(r"(?:cda|dga|at|gdg|gdga|gdc|gda|gd|dag|mtci|mtc)-(\d{2})$")

RE_ANO2_VALIDO = re.compile(r"^(0\d|[12]\d|30)$")


def extrair_numero_ano_emissor(
    slug: str,
) -> tuple[str | None, int | None, str | None, str, list[str]]:
    """
    Devolve (numero, ano, emissor, resto_descritivo, ano_fraco_encontrado).

    Política (aplicada sem excepções, para não inventar):
      * Percorre-se o slug token a token (tokens = partes separadas por `-`).
      * Depois do token do número, consomem-se tokens que sejam SIGLAS PURAS
        de entidade ou NÚMEROS PUROS de 1 a 4 dígitos.
      * Assim que aparece um token que não é uma coisa nem outra, pára. Tudo o
        que sobrar vai para `resto` (a parte descritiva do título).
      * Um token colado como `dga415` conta como DGA + série 415. Um token
        colado como `atdggdg6212021` não conta para nada — é lixo de origem.
      * `ano` só entra em `numero` quando veio de 4 dígitos.
    """
    tokens = slug.split("-")
    ano = None
    ano_fraco = None

    # ---- 1. número -------------------------------------------------------
    # Atenção: o hífen é também o separador de tokens, por isso `n-005`
    # aparece como dois tokens ("n" e "005"). Temos de aceitar as duas formas.
    idx_num = None          # índice do token que contém os dígitos
    idx_prefixo = None      # índice do token "n"/"no"/"numero" (se for separado)
    num_txt = None
    for k, t in enumerate(tokens):
        if t in ("n", "no", "nº", "num", "numero") and k + 1 < len(tokens):
            if re.fullmatch(r"\d{1,3}", tokens[k + 1]):
                idx_num, idx_prefixo, num_txt = k + 1, k, tokens[k + 1]
                break
        m = TOKEN_NUMERO.fullmatch(t)
        if m:
            idx_num, idx_prefixo, num_txt = k, None, m.group(1)
            break

    # ---- 2. cauda de referência ------------------------------------------
    entidades: list[str] = []
    canonicas_vistas: set[str] = set()
    serie = None
    i = (idx_num + 1) if idx_num is not None else 0

    while i < len(tokens):
        t = tokens[i]
        # Sigla pura, ou sigla colada com dígitos: `dga`, `atdga`, `dga415`
        m_ent = re.fullmatch(r"(at|dga|gdg|gdga|gdc|gda|gd|dag|mtci|mtc|cda)(\d{1,4})?", t)
        if m_ent:
            canonica = SIGLAS_EMISSOR.get(m_ent.group(1))
            if canonica is None:
                break                      # `ga` isolada não é emissor
            if canonica != "Outro" and canonica not in canonicas_vistas:
                canonicas_vistas.add(canonica)
                entidades.append(canonica)
            if m_ent.group(2):
                # série colada. Só 4 dígitos plausíveis podem ser ano.
                if len(m_ent.group(2)) == 4 and ANO_MIN <= int(m_ent.group(2)) <= ANO_MAX:
                    ano = int(m_ent.group(2))
                elif serie is None:
                    serie = m_ent.group(2)
            i += 1
            continue
        # Número puro de 1 a 4 dígitos
        if re.fullmatch(r"\d{1,4}", t):
            if len(t) == 4 and ANO_MIN <= int(t) <= ANO_MAX:
                ano = int(t)
            elif serie is None:
                serie = t
            i += 1
            continue
        break

    resto_tokens = list(tokens)
    # Apaga os tokens consumidos: o do número e a cauda de referência.
    apagados = set()
    if idx_num is not None:
        apagados.add(idx_num)
        if idx_prefixo is not None:
            apagados.add(idx_prefixo)
        apagados.update(range(idx_num + 1, i))
    # O ano pode repetir-se noutro sítio do nome (ex.: no fim).
    if ano is not None:
        for j, t in enumerate(resto_tokens):
            if j not in apagados and re.fullmatch(r"\d{4}", t) and int(t) == ano:
                apagados.add(j)
                break

    # ---- 3. ano de 2 dígitos (só se não houver de 4) ----------------------
    if ano is None:
        m2 = RE_ANO2.search(slug)
        if m2 and RE_ANO2_VALIDO.match(m2.group(1)):
            # BUG anterior: `int("14")` devolvia 14 em vez de 2014.
            ano = 2000 + int(m2.group(1))
            ano_fraco = m2.group(1)
            for j, t in enumerate(resto_tokens):
                if re.fullmatch(r".*?\d{2}", t):
                    apagados.add(j)
                    break

    resto = " ".join(t for j, t in enumerate(resto_tokens) if j not in apagados)
    resto = re.sub(r"\s+", " ", resto).strip()

    # ---- 4. limpar o resto ---------------------------------------------
    # (a) Tira da `resto` as siglas de entidade que sobraram.
    #     Ex.: "convocatoria-5-assembleia-geral-extraordinaria-da-cda" -> a
    #     sigla "cda" já vai no `emissor`, não repete no título.
    # (b) Tira a palavra do tipo no início: `circular-n-005-cda-2014` deixa
    #     resto "circular", que repetiria o `tipo` no título.
    # (c) Tira qualificadores de género que só fazem sentido com o tipo
    #     ("ordem de serviço", "regulamento interno", "boletim informativo").
    PALAVRAS_TIPO = (
        r"circul?ar|circula|ciircular|circuar|ordem|os|comunicado|acta|ata"
        r"|convocatoria|convocatória|relatorio|relatório|estatuto|regulamento"
        r"|decreto|lei|boletim|revista|diploma"
    )
    QUALIFICADORES = (
        r"de\s+servi[çc]?o|servi[çc]?o|interno|informativo|ministerial"
        r"|nacional|aduan[ée]iro"
    )

    def limpar_inicio(texto: str) -> str:
        t = texto
        anterior = None
        while t != anterior:
            anterior = t
            t = re.sub(r"^(?:%s)\b\s*" % PALAVRAS_TIPO, "", t, count=1, flags=re.IGNORECASE)
            t = re.sub(r"^(?:%s)\b\s*" % QUALIFICADORES, "", t, count=1, flags=re.IGNORECASE)
            t = re.sub(r"^(?:numero|num|n[oº]?|ficha|da|do|de|dos|das|a|o|em|no|na)\b\s*",
                       "", t, count=1, flags=re.IGNORECASE)
        return t.strip(" -")

    # (a) siglas de entidade que sobraram no descritivo (já estão no `emissor`)
    apagados.update(
        j for j, t in enumerate(resto_tokens)
        if j not in apagados and t in SIGLAS_EMISSOR
    )

    resto = " ".join(t for j, t in enumerate(resto_tokens) if j not in apagados)
    resto = re.sub(r"\s+", " ", resto).strip()
    resto = limpar_inicio(resto)

    # Conectores que ficaram pendurados (ex.: o "da" de "da CDA")
    anterior = None
    while resto != anterior:
        anterior = resto
        resto = re.sub(r"^(?:da|do|de|dos|das|em|no|na|para|a|o)\s+", "", resto).strip()
        resto = re.sub(r"\s+(?:da|do|de|dos|das|em|no|na|para|a|o)$", "", resto).strip()

    # ---- 5. número canónico ---------------------------------------------
    numero = None
    if num_txt:
        partes = [num_txt] + entidades
        if serie:
            partes.append(serie)
        if ano is not None and ano_fraco is None:
            partes.append(str(ano))
        numero = "/".join(partes)

    return numero, ano, None, resto, [ano_fraco] if ano_fraco else []


def determinar_emissor(slug: str) -> str | None:
    """
    Emissor deduzido das siglas presentes no NOME (independente da cauda de
    referência, que pode estar truncada). Precedência: CDA > DGA > AT > MTC.
    """
    texto = re.sub(r"[0-9]", " ", slug)
    presente = {t for t in (x.strip() for x in texto.split("-")) if t in SIGLAS_EMISSOR}
    if "cda" in presente:
        return "CDA"
    if presente & {"dga", "gdg", "gdga", "gda", "gdc", "gd", "dag"}:
        return "DGA"
    if "at" in presente:
        return "AT"
    if presente & {"mtci", "mtc"}:
        return "MTC"
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Título legível
# ─────────────────────────────────────────────────────────────────────────────

def titulo_legivel(slug: str) -> str:
    """Transformar um slug em texto legível, sem inventar palavras."""
    palavras = [p for p in re.split(r"[-_]+", slug) if p]
    saida: list[str] = []
    for i, p in enumerate(palavras):
        pl = p.lower()
        if pl in SIGLAS_TITULO:
            saida.append(p.upper())
        elif re.fullmatch(r"\d+", p):
            saida.append(p)
        elif pl in MINUSCULAS and i > 0:
            saida.append(pl)
        else:
            saida.append(p[0].upper() + p[1:])
    return " ".join(saida)


def construir_titulo(tipo: str, numero: str | None, resto: str) -> str:
    """
    `Circular 005/CDA/2014 — Operadores certificados ...`

    Quando o número canónico existe, o título começa por ele (é o que o
    leitor procura). A parte descritiva só entra se o nome a trouxer.
    """
    cabeca = tipo if numero is None else "%s %s" % (tipo, numero)
    if resto:
        return "%s — %s" % (cabeca, titulo_legivel(resto))
    return cabeca


# ─────────────────────────────────────────────────────────────────────────────
# Construção do índice
# ─────────────────────────────────────────────────────────────────────────────

def construir_indice(dir_docs: str) -> list[dict[str, Any]]:
    if not os.path.isdir(dir_docs):
        raise SystemExit("directório inexistente: %s" % dir_docs)

    nomes = sorted(
        n for n in os.listdir(dir_docs)
        if n.lower().endswith(".pdf") and os.path.isfile(os.path.join(dir_docs, n))
    )
    log("%d PDF encontrados em %s" % (len(nomes), os.path.relpath(dir_docs, RAIZ)))

    indice: list[dict[str, Any]] = []
    sem_ano: list[str] = []
    sem_numero: list[str] = []
    sem_emissor: list[str] = []

    for nome in nomes:
        slug = nome[:-4]  # tira ".pdf"
        tipo = classificar_tipo(slug)
        numero, ano, _emissor_vazio, resto, _ = extrair_numero_ano_emissor(slug)
        emissor = determinar_emissor(slug)

        indice.append({
            "ficheiro": nome,
            "titulo": construir_titulo(tipo, numero, resto),
            "tipo": tipo,
            "numero": numero,
            "ano": ano,
            "emissor": emissor,
            "tituloOriginal": nome,
        })

        if ano is None:
            sem_ano.append(nome)
        if numero is None:
            sem_numero.append(nome)
        if emissor is None:
            sem_emissor.append(nome)

    # Auditoria: o que não foi possível extrair com confiança.
    log("ano não extraído:    %d" % len(sem_ano))
    for n in sem_ano:
        log("    - %s" % n)
    log("numero não extraído: %d" % len(sem_numero))
    for n in sem_numero[:15]:
        log("    - %s" % n)
    if len(sem_numero) > 15:
        log("    … (+%d)" % (len(sem_numero) - 15))
    log("emissor não extraído: %d" % len(sem_emissor))

    contagem: dict[str, int] = {}
    for r in indice:
        contagem[r["tipo"]] = contagem.get(r["tipo"], 0) + 1
    log("distribuição por tipo:")
    for t, c in sorted(contagem.items(), key=lambda kv: (-kv[1], kv[0])):
        log("    %-18s %3d" % (t, c))

    return indice


def main() -> int:
    ap = argparse.ArgumentParser(description="Indexa os PDF de site/docs")
    ap.add_argument("--docs", default=DIR_DOCS_POR_DEFECTO)
    ap.add_argument("--saida", default=SAIDA_POR_DEFECTO)
    args = ap.parse_args()

    indice = construir_indice(os.path.abspath(args.docs))

    os.makedirs(os.path.dirname(os.path.abspath(args.saida)), exist_ok=True)
    with open(args.saida, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(indice, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    log("escrito %s (%d registos, %d bytes)"
        % (os.path.relpath(os.path.abspath(args.saida), RAIZ),
           len(indice), os.path.getsize(args.saida)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())