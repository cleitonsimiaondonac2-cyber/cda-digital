#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_datasets.py — construtor dos datasets JSON do site da CDA.

Escopo: site/data/membros.json, site/data/eventos.json, site/data/timeline.json

Princípios (não negociáveis):
  * Nada é inventado. Cada campo ou vem da fonte ou fica `null`.
  * Determinístico e reexecutável: correr duas vezes dá byte-idêntico.
  * Privacidade: de `CDA_membros.csv` só são publicados campos que são
    identificadores profissionais públicos. Moradas, e-mails, telefones,
    BIs, NUITs e datas de nascimento NUNCA entram no JSON.
  * Sem OCR, sem rede, sem dependências externas (só stdlib).

Uso:
    python3 tools/build_datasets.py
    python3 tools/build_datasets.py --fontes "caminho/para/levantar"
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import unicodedata
from typing import Any

# ─────────────────────────────────────────────────────────────────────────────
# Constantes
# ─────────────────────────────────────────────────────────────────────────────

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_DATA = os.path.join(RAIZ, "site", "data")

# O `~` do utilizador que corre o script nem sempre é a casa do dono do
# projecto (aqui `~` = /root mas as fontes vivem em /home/cleiton). Por isso
# testamos candidatos por ordem em vez de confiar só no `~`.
CANDIDATOS_FONTES = [
    os.path.expanduser("~/Área de Trabalho/Site CDA - Levantamento"),
    "/home/cleiton/Área de Trabalho/Site CDA - Levantamento",
    os.path.join(RAIZ, "levantamento"),
]

CSV_MEMBROS = "CDA_membros.csv"
MD_EVENTOS = "CDA_eventos.md"
MD_INSTITUCIONAL = "CDA_institucional.md"
MD_MASTER = "CDA_RELATORIO_MASTER_SITE.md"

# Número de pessoas que a auditoria (D17) espera depois de remover a
# linha junk do CSV. É conferido em runtime, não assumido.
TOTAL_MEMBROS_ESPERADO = 218

# O cabeçalho de secção de folha Excel que o CSV traz colado no fim
# (D17). Não é uma pessoa.
NOMES_JUNK = {"Actualizaçao de Endereço", "Atualização de Endereço"}

# Colunas do CSV deliberadamente NÃO publicadas (PII / dados fiscais).
COLUNAS_SENSIVEIS = (
    "Cod_Cedula",   # número de cédula — documento de identificação
    "NUIT",         # número fiscal da empresa/pessoa
    "Endereco",     # morada residencial
    "Tel_Movel",    # telemóvel pessoal
    "Tel_Fixo",     # telefone fixo
    "Fax",          # fax
    "Email",        # e-mail pessoal
)

# Mapa de código cru -> rótulo legível em pt-MZ (D21).
# O `dataTxt`/rótulo só descreve o que a fonte diz; nada é interpretive.
MAPA_TIPO = {
    "AGO":          "Assembleia Geral Ordinária",
    "AGE":          "Assembleia Geral Extraordinária",
    "AG":           "Assembleia Geral",
    "SES":          "Sessão Extraordinária",
    "REU":          "Reunião",
    "WORK":         "Workshop",
    "WORK/REU":     "Reunião / Workshop",
    "COM":          "Comemorativo",
    "ELE":          "Eleições",
    "INSTITUCIONAL": "Institucional",
}

# Ordem canónica dos eventos por tipo (para agrupar na UI mais tarde).
ORDEM_TIPO = {
    "AGO": 0, "AGE": 1, "AG": 2, "SES": 3, "WORK/REU": 4,
    "WORK": 5, "REU": 6, "ELE": 7, "COM": 8, "INSTITUCIONAL": 9,
}

CATEGORIAS_CRONOLOGIA = ("legal", "organizacional", "actividade", "digital")

MESES_PT = {
    "janeiro": 1, "fevereiro": 2, "março": 3, "marco": 3, "abril": 4,
    "maio": 5, "junho": 6, "julho": 7, "agosto": 8, "setembro": 9,
    "outubro": 10, "novembro": 11, "dezembro": 12,
    "jan": 1, "fev": 2, "abr": 4, "mai": 5, "jun": 6, "jul": 7,
    "ago": 8, "set": 9, "out": 10, "nov": 11, "dez": 12,
}


# ─────────────────────────────────────────────────────────────────────────────
# Utilitários
# ─────────────────────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    print("[build_datasets] " + msg, file=sys.stderr)


def limpar(texto: Any) -> str | None:
    """Normaliza espaços e devolve None para cadeias vazias."""
    if texto is None:
        return None
    s = re.sub(r"\s+", " ", str(texto)).strip()
    return s or None


def remover_markdown(texto: str) -> str:
    """Tira a marcação Markdown deixada nas células da tabela da fonte."""
    s = texto
    s = s.replace("**", "")           # negrito
    s = re.sub(r"`([^`]*)`", r"\1", s)  # código
    s = re.sub(r"\*([^*]+)\*", r"\1", s)  # itálico
    s = re.sub(r"\s+", " ", s).strip()
    return s


def sem_acento(texto: str) -> str:
    return (
        unicodedata.normalize("NFKD", texto)
        .encode("ascii", "ignore")
        .decode("ascii")
    )


def escrever_json(caminho: str, dados: Any) -> None:
    """Escrita determinística: ensure_ascii=False, indent=2, newline final."""
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(dados, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    log("escrito %s (%d bytes)" % (os.path.relpath(caminho, RAIZ),
                                   os.path.getsize(caminho)))


def ler_json(caminho: str) -> Any:
    with open(caminho, encoding="utf-8") as fh:
        return json.load(fh)


def existe(caminho: str) -> bool:
    return os.path.isfile(caminho)


def primeira_existente(*caminhos: str) -> str | None:
    for c in caminhos:
        if existe(c):
            return c
    return None


# ─────────────────────────────────────────────────────────────────────────────
# 1. MEMBROS  (S3.1.1)
# ─────────────────────────────────────────────────────────────────────────────

def construir_membros(fonte_dir: str, destino: str) -> list[dict[str, Any]]:
    """
    Lê o CSV, remove o registo junk (D17) e valida cada um dos restantes
    contra o `membros.json` que já existia (quando existe) — campo a campo.

    Só são publicados 7 campos. Os 7 campos sensíveis do CSV são descartados
    aqui e nunca chegam ao JSON.
    """
    caminho_csv = os.path.join(fonte_dir, CSV_MEMBROS)
    if not existe(caminho_csv):
        log("AVISO: %s não encontrado — membros.json fica inalterado" % caminho_csv)
        return []

    with open(caminho_csv, encoding="utf-8-sig", newline="") as fh:
        linhas = list(csv.DictReader(fh))
    log("CSV: %d linhas, %d colunas" % (len(linhas), len(linhas[0]) if linhas else 0))

    # D17: deitar fora as linhas que não são pessoas.
    total_csv = len(linhas)
    pessoas = [ln for ln in linhas if (limpar(ln.get("Nome")) or "") not in NOMES_JUNK]
    removidas = total_csv - len(pessoas)
    log("D17: %d linha(s) junk removida(s) -> %d pessoas" % (removidas, len(pessoas)))

    if len(pessoas) != TOTAL_MEMBROS_ESPERADO:
        log("AVISO: %d pessoas mas esperavam-se %d — a validação vai falhar"
            % (len(pessoas), TOTAL_MEMBROS_ESPERADO))

    # Base já existente, para validação campo a campo (se houver).
    anterior: list[dict[str, Any]] = []
    if existe(destino):
        try:
            anterior = ler_json(destino)
        except json.JSONDecodeError:
            log("AVISO: %s ilegível — salto a validação cruzada" % destino)
    anterior_por_nome = {
        (r.get("nome") or ""): r for r in anterior if r.get("nome") not in NOMES_JUNK
    }

    registos: list[dict[str, Any]] = []
    divergencias: list[str] = []

    for ln in pessoas:
        nome = limpar(ln.get("Nome"))
        n_carta = limpar(ln.get("N_Carta_Profissional"))
        registo = {
            "nome": nome,
            "nCarta": n_carta,
            "empresa": limpar(ln.get("Empresa")),
            "situacao": limpar(ln.get("Situacao")),
            "provincia": limpar(ln.get("Provincia")),
            "delegacao": limpar(ln.get("Delegacao_Regional")),
            # `activo` reflecte ter carteira profissional emitida, ou seja,
            # `nCarta` preenchido no CSV. Não é um estado que a fonte declare.
            "activo": bool(n_carta),
        }

        # Validação campo a campo contra o registo pré-existente.
        velho = anterior_por_nome.get(nome)
        if velho is not None:
            for campo in ("nCarta", "empresa", "situacao", "provincia", "delegacao"):
                if velho.get(campo) != registo[campo]:
                    divergencias.append(
                        "%s | %s: CSV=%r JSON=%r"
                        % (nome, campo, registo[campo], velho.get(campo))
                    )
        registos.append(registo)

    if divergencias:
        log("!! %d divergência(s) CSV<->JSON:" % len(divergencias))
        for d in divergencias[:20]:
            log("   " + d)
    else:
        log("validação cruzada CSV<->JSON: 0 divergências em %d pessoas x 5 campos"
            % len(pessoas))

    # Higiene: nenhuma chave sensível pode ter escapado.
    for r in registos:
        proibidas = [c for c in COLUNAS_SENSIVEIS if c in r]
        if proibidas:
            raise SystemExit("PII em membros.json: %r" % proibidas)

    registos.sort(key=lambda r: (r["nome"] or ""))
    escrever_json(destino, registos)

    delegacoes: dict[str, int] = {}
    situacoes: dict[str, int] = {}
    for r in registos:
        delegacoes[r["delegacao"] or "(sem delegação)"] = \
            delegacoes.get(r["delegacao"] or "(sem delegação)", 0) + 1
        situacoes[r["situacao"] or "(sem situação)"] = \
            situacoes.get(r["situacao"] or "(sem situação)", 0) + 1
    log("delegação: " + ", ".join("%s=%d" % kv for kv in sorted(delegacoes.items())))
    log("situação:   " + ", ".join("%s=%d" % kv for kv in sorted(situacoes.items())))
    return registos


# ─────────────────────────────────────────────────────────────────────────────
# 2. EVENTOS  (S3.1.2)
# ─────────────────────────────────────────────────────────────────────────────

def _padrao_local() -> re.Pattern[str]:
    """
    Reconhece apenas nomes de local que a FONTE nomeia literalmente.

    Não há inferência: se a frase não estiver no texto, `local` fica None.
    Aplicado sobre o título já sem marcação Markdown (ver `extrair_local`).
    """
    return re.compile(
        r"(?:"
        r"Audit[oó]rio Municipal da Cidade da Matala"      # AG 2ª sessão, 2011
        r"|Centro de Confer[êe]ncias do Instituto de Forma[çc][ãa]o das "
        r"Telecomunica[çc][õo]es de Mo[çc]ambique,?\s*Maputo"
        r"|Sala de Reuni[õo]es [^—.\n]{1,40}?,\s*Hotel [A-Za-zÀ-ÿ]+"
        r"|Sala \"[^\"]+\",\s*Hotel [A-Za-zÀ-ÿ]+"
        r"|Sala de Reuni[õo]es da CDA"
        r"|plataforma WhatsApp"
        r")"
    )


def extrair_local(titulo: str) -> str | None:
    """Devolve o local tal e qual a fonte o escreve, ou None."""
    if not titulo:
        return None
    # A fonte embute negrito no meio do nome da sala (ex.: Sala de Reuniões
    # **"Mphuma 2"**), por isso a pesquisa é feita sobre o texto limpo.
    limpo = re.sub(r"\*\*|`", "", titulo)
    m = _padrao_local().search(limpo)
    if not m:
        return None
    local = m.group(0).strip().strip(",").strip()
    # Limpar cauda que não é nome de local (horas, etc.).
    local = re.sub(r"\s*[-–]?\s*\d{1,2}[:h]\d{2}.*$", "", local).strip()
    return local or None


def chave_ordenacao(registo: dict[str, Any]) -> str:
    """
    Chave cronológica estável.

    Registos com data exacta ordenam pela data. Registos só com ano vão para o
    fim desse mesmo ano (não para o início) para que a lista leia-se por ordem.
    Registos sem ano nem data vão para o fim de tudo.
    """
    if registo.get("data"):
        return str(registo["data"])
    ano = registo.get("ano")
    if ano:
        return "%04d-12-31" % int(ano)
    return "9999-12-31"


def normalizar_data_txt(bruto: str) -> str:
    """
    Torna `dataTxt` legível em pt-MZ.

    A fonte dá por vezes só fragmentos ("(dia 30)", "WORK (2025)", "(seminário)").
    Esses fragmentos são reescritos como texto legível — NUNCA se lhes inventa
    um dia, um mês ou um ano que a fonte não diga.
    """
    s = bruto.strip()

    if s == "":
        return "Data por definir"

    # "(2025)" / "(2026)"  ->  "Ano de 2025 (dia por definir)"
    m = re.fullmatch(r"\(\s*(?:\(|\s)*((?:19|20)\d{2})\s*\)?\s*\)", s)
    if m:
        return "Ano de %s (dia por definir)" % m.group(1)

    # "WORK (2025)" / "Workshop (2024)"  ->  "Ano de 2025 (dia por definir)"
    m = re.fullmatch(r"[A-Za-zÀ-ÿ]+\s*\(\s*((?:19|20)\d{2})\s*\)", s)
    if m:
        return "Ano de %s (dia por definir)" % m.group(1)

    # "(dia 30)"  ->  "Dia 30 (mês por definir)"
    m = re.fullmatch(r"\(\s*dia\s+(\d{1,2})\s*\)", s, re.IGNORECASE)
    if m:
        return "Dia %s (mês por definir)" % m.group(1)

    # "(data a fixar)" / "data a fixar"
    if re.fullmatch(r"\(?\s*data\s+a\s+fixar\s*\)?", s, re.IGNORECASE):
        return "Data a fixar"

    # "(seminário)"
    if re.fullmatch(r"\(\s*(semin[aá]rio|workshop)\s*\)", s, re.IGNORECASE):
        return "%s (data por definir)" % s.strip("() ").capitalize()

    # Resto: a fonte já é legível, devolve-se tal e qual (só sem marcação
    # Markdown). NÃO se reescreve o texto: reescrever com um separador fixo
    # ("— data a fixar") fazia a função NÃO-IDEMPOTENTE — cada execução
    # acrescentava outro travessão ao resultado anterior.
    limpo = re.sub(r"\s+", " ", re.sub(r"\*\*|\*|`", "", s)).strip()
    return limpo or "Data por definir"


def construir_eventos(destino: str) -> list[dict[str, Any]]:
    """
    Enriquece o `eventos.json` existente com `tipoLabel` (D21) e `local`.

    NÃO reconstrói a lista a partir do markdown: os títulos já curados são
    parte do trabalho de outro agente e podem estar referenciados por
    `site/js/`. O que este script faz é *acrescentar* o que falta, usando
    `CDA_eventos.md` apenas para conferir o número de eventos e o tipo.
    """
    if not existe(destino):
        log("AVISO: %s não encontrado — eventos.json não gerado" % destino)
        return []

    eventos = ler_json(destino)
    if not isinstance(eventos, list):
        raise SystemExit("eventos.json não é uma lista")

    for ev in eventos:
        codigo = (ev.get("tipo") or "").strip()
        rotulo = MAPA_TIPO.get(codigo)
        if rotulo is None:
            # Código desconhecido: não inventar, degradar para o próprio código
            # mas deixar visível para revisão.
            log("AVISO: tipo %r sem rótulo — a rever" % codigo)
            rotulo = codigo or "Sem tipo"
        ev["tipoLabel"] = rotulo

        titulo = ev.get("titulo") or ""
        ev["local"] = extrair_local(titulo)

        ev["dataTxt"] = normalizar_data_txt(ev.get("dataTxt") or "")

    eventos.sort(key=lambda e: (
        chave_ordenacao(e),
        ORDEM_TIPO.get(e.get("tipo") or "", 99),
        e.get("titulo") or "",
    ))
    escrever_json(destino, eventos)

    com_local = sum(1 for e in eventos if e.get("local"))
    com_data = sum(1 for e in eventos if e.get("data"))
    so_ano = sum(1 for e in eventos if not e.get("data") and e.get("ano"))
    log("eventos: %d (com data exacta: %d · só ano: %d · com local: %d)"
        % (len(eventos), com_data, so_ano, com_local))
    return eventos


# ─────────────────────────────────────────────────────────────────────────────
# 3. TIMELINE  (S3.1.3)
# ─────────────────────────────────────────────────────────────────────────────

def classificar_cronologia(diploma: str, titulo: str) -> str:
    """
    Escolhe a `categoria` a partir do que a linha DIZ — sem inventar.
    legal         -> diploma com número (Decreto, Lei, Estatuto, Regulamento)
    organizacional -> assembleias, electos, comissões, sede
    digital       -> nothing aqui, reservado
    actividade    -> o resto (workshops, formações, reuniões, cerimónias)
    """
    d = sem_acento(diploma + " " + titulo).lower()
    if re.search(r"\b(lei|decreto|estatuto|regulamento|diploma)\b", d):
        return "legal"
    if re.search(r"\b(assembleia geral|\bag\b|\bage\b|comiss[aã]o|elei|c[aá]mara|directiv|sede|obra|mandato)\b", d):
        return "organizacional"
    return "actividade"


def extrair_data(bruto: str) -> tuple[int | None, str | None]:
    """
    Devolve (ano, data_iso).

    - data completa dd-mm-aaaa -> (ano, ISO)
    - só ano, ou mês+ano      -> (ano, None)   [regra dura: datas só-parciais
                                             ficam em `ano`, nunca inventadas]
    - nada                     -> (None, None)
    """
    s = bruto.strip().replace("**", "")
    s = re.sub(r"[*()`]", "", s).strip()
    if not s:
        return None, None

    # dd-mm-aaaa
    m = re.search(r"\b(\d{1,2})-(\d{1,2})-(\d{4})\b", s)
    if m:
        d, mes, ano = (int(g) for g in m.groups())
        if 1 <= mes <= 12 and 1 <= d <= 31:
            return ano, "%04d-%02d-%02d" % (ano, mes, d)

    # 29.12.1960
    m = re.search(r"\b(\d{1,2})[.](\d{1,2})[.](\d{4})\b", s)
    if m:
        d, mes, ano = (int(g) for g in m.groups())
        if 1 <= mes <= 12 and 1 <= d <= 31:
            return ano, "%04d-%02d-%02d" % (ano, mes, d)

    # dd/mm/aaaa
    m = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b", s)
    if m:
        d, mes, ano = (int(g) for g in m.groups())
        if 1 <= mes <= 12 and 1 <= d <= 31:
            return ano, "%04d-%02d-%02d" % (ano, mes, d)

    # mês + ano, ex. "Março 2023" / "Março de 2023"
    m = re.search(r"([A-Za-zÀ-ÿç]{3,12})\s*(?:de\s+)?((?:19|20)\d{2})", s)
    if m:
        chave = sem_acento(m.group(1)).lower()
        if chave in MESES_PT:
            return int(m.group(2)), None

    # só ano
    m = re.search(r"\b((?:19|20)\d{2})\b", s)
    if m:
        return int(m.group(1)), None
    return None, None


def construir_timeline(fonte_dir: str, destino: str) -> list[dict[str, Any]]:
    """
    Extrai a cronologia institucional da fonte (ANEXO A do relatório master,
    com recurso a `CDA_institucional.md` como rede de segurança).

    Regras duras:
      * zero invenção de datas ou eventos
      * datas só-parciais ficam em `ano` com `data: null`
      * ordenado cronologicamente
      * sem duplicados
    """
    linhas_tab: list[list[str]] = []
    origem = ""

    master = os.path.join(fonte_dir, MD_MASTER)
    if existe(master):
        texto = ler_texto(master)
        linhas_tab = extrair_tabela_cronologia(texto)
        if linhas_tab:
            origem = MD_MASTER

    if not linhas_tab:
        inst = os.path.join(fonte_dir, MD_INSTITUCIONAL)
        if existe(inst):
            texto = ler_texto(inst)
            linhas_tab = extrair_tabela_cronologia(texto)
            if linhas_tab:
                origem = MD_INSTITUCIONAL

    if not linhas_tab:
        log("AVISO: nenhuma tabela de cronologia encontrada — timeline.json não gerado")
        return []

    entradas: list[dict[str, Any]] = []
    vistos: set[tuple[int | None, str]] = set()

    for celulas in linhas_tab:
        if len(celulas) < 3:
            continue
        col_data, col_diploma, col_desc = celulas[0], celulas[1], celulas[2]
        ano, data_iso = extrair_data(col_data)

        diploma = remover_markdown(col_diploma)
        descricao = remover_markdown(col_desc)

        # Linhas de cabeçalho / separador da tabela markdown.
        if set(diploma) <= set("-: "):
            continue
        if diploma.lower() in ("data", "diploma / evento", "diploma/evento"):
            continue
        if not diploma or not descricao:
            continue

        # A chave de duplicado é (ano, diploma normalizado).
        chave = (ano, re.sub(r"[^a-z0-9]+", "", sem_acento(diploma).lower()))
        if chave in vistos:
            log("duplicado ignorado: %s" % diploma)
            continue
        vistos.add(chave)

        entradas.append({
            "ano": ano,
            "data": data_iso,
            "titulo": diploma,
            "descricao": descricao,
            "categoria": classificar_cronologia(diploma, descricao),
        })

    entradas.sort(key=lambda e: (
        chave_ordenacao(e),
        e["titulo"],
    ))

    escrever_json(destino, entradas)

    exactas = sum(1 for e in entradas if e["data"])
    cats: dict[str, int] = {}
    for e in entradas:
        cats[e["categoria"]] = cats.get(e["categoria"], 0) + 1
    log("timeline (%s): %d entradas · %d com data exacta · %s"
        % (origem, len(entradas), exactas,
           ", ".join("%s=%d" % kv for kv in sorted(cats.items()))))
    return entradas


def ler_texto(caminho: str) -> str:
    with open(caminho, encoding="utf-8", errors="replace") as fh:
        return fh.read()


def extrair_tabela_cronologia(texto: str) -> list[list[str]]:
    """
    Devolve as linhas da tabela que tem a cronologia.

    Procura o cabeçalho `| Data | Diploma / Evento | ...` (com variantes de
    espaçamento e acentuação) e devolve as células até uma linha em branco.
    """
    linhas = texto.splitlines()
    inicio = None
    padrao_cab = re.compile(
        r"^\s*\|.*\bdata\b.*\|\s*$", re.IGNORECASE
    )
    for i, ln in enumerate(linhas):
        if padrao_cab.match(ln) and "diploma" in sem_acento(ln).lower():
            inicio = i
            break
    if inicio is None:
        return []

    celulas_linhas: list[list[str]] = []
    padrao_sep = re.compile(r"^\s*\|[\s\-:|]+\|\s*$")
    for ln in linhas[inicio + 1:]:
        if not ln.strip():
            if celulas_linhas:
                break
            continue
        if padrao_sep.match(ln):
            continue
        if not ln.strip().startswith("|"):
            break
        celulas = [c.strip() for c in ln.strip().strip("|").split("|")]
        celulas_linhas.append(celulas)
    return celulas_linhas


# ─────────────────────────────────────────────────────────────────────────────
# main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="Constrói os datasets da CDA")
    ap.add_argument("--fontes", default=None,
                    help="directório com as fontes de levantamento")
    args = ap.parse_args()

    fonte_dir = os.path.expanduser(args.fontes) if args.fontes else None
    if fonte_dir is None:
        for cand in CANDIDATOS_FONTES:
            if os.path.isdir(cand):
                fonte_dir = cand
                break
    if not fonte_dir or not os.path.isdir(fonte_dir):
        log("ERRO: directório de fontes inexistente.")
        log("      Candidatos testados:")
        for c in CANDIDATOS_FONTES:
            log("        %s -> %s" % (c, "existe" if os.path.isdir(c) else "não"))
        log("      Use --fontes <caminho>")
        return 2
    log("fontes: %s" % fonte_dir)

    log("— S3.1.1 membros")
    construir_membros(fonte_dir, os.path.join(DIR_DATA, "membros.json"))

    log("— S3.1.2 eventos")
    construir_eventos(os.path.join(DIR_DATA, "eventos.json"))

    log("— S3.1.3 timeline")
    construir_timeline(fonte_dir, os.path.join(DIR_DATA, "timeline.json"))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())