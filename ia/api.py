#!/usr/bin/env python3
"""Fase 2 — API do Assistente CDA (RAG via Ollama Cloud + BM25 local).

Endpoints:
  POST /ia/perguntar  {pergunta, ficheiro?}  → resposta fundamentada + fontes
  GET  /ia/pesquisar  ?q=                     → top-k extratos (sem LLM)
  GET  /ia/documento  ?f=...&q=               → pesquisa restrita a um documento
  GET  /ia/status                             → estado do motor

A chave da API do Ollama Cloud vive APENAS no servidor (ia/.env).
"""
import json
import math
import os
import re
import sys
from collections import Counter
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from snowballstemmer import PortugueseStemmer

RAIZ = Path(__file__).resolve().parent.parent
ENV = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV)

IA_URL = os.getenv("IA_URL", "https://api.ollama.com")
IA_CHAVE = os.getenv("IA_API_KEY", "")
IA_MODELO = os.getenv("IA_MODELO", "gpt-oss:120b")
IA_TIMEOUT = float(os.getenv("IA_TIMEOUT", "120"))

INDICE = json.loads((Path(__file__).resolve().parent / "indice.json").read_text(encoding="utf-8"))
DOCS = INDICE["docs"]
K = int(os.getenv("IA_TOP_K", "5"))
SCORE_MIN = float(os.getenv("IA_SCORE_MIN", "0.15"))
STEM = PortugueseStemmer()
RE_ACENTOS = re.compile(r"[áàâãä]|[éèêë]|[íìîï]|[óòôõö]|[úùûü]|[ç]")

FACTOS_INSTITUCIONAIS = (
    Path(__file__).resolve().parent / "factos_institucionais.txt"
).read_text(encoding="utf-8")


def normaliza(s: str) -> str:
    s = s.lower()
    for a, b in [("áàâãä", "a"), ("éèêë", "e"), ("íìîï", "i"),
                 ("óòôõö", "o"), ("úùûü", "u")]:
        for c in a:
            s = s.replace(c, b)
    s = s.replace("ç", "c")
    return re.sub(r"[\u0300-\u036f]", "", s)


def stem_frase(frase: str) -> list[str]:
    return STEM.stemWords(normaliza(frase).split())


def busca(q: str, ficheiro: str | None = None, k: int = K) -> list[dict]:
    termos = [t for t in stem_frase(q) if len(t) > 1]
    if not termos:
        return []
    pontuados = []
    for d in DOCS:
        if ficheiro and d["ficheiro"] != ficheiro:
            continue
        score = 0.0
        for t in set(termos):
            if t in d["pesos"]:
                score += d["pesos"][t]
        if score > 0:
            pontuados.append((score, d))
    pontuados.sort(key=lambda x: x[0], reverse=True)
    return [{"score": round(s, 4), **{kk: vv for kk, vv in d.items() if kk != "pesos"}}
            for s, d in pontuados[:k]]


def fonte(chunk: dict) -> dict:
    return {"titulo": chunk["titulo"], "tipo": chunk["tipo"],
            "entidade": chunk["entidade"], "ano": chunk.get("ano"),
            "url": chunk["url"], "excerto": chunk["texto"][:260]}


def resposta_local(chunks: list[dict]) -> dict:
    """Resposta por extratos (sem LLM) — usada como fallback honesto."""
    txt = "Com base nas informações disponíveis (site e documentos oficiais da CDA), encontrei os seguintes trechos relacionados:\n\n"
    for c in chunks:
        ano = f" ({c['ano']})" if c.get("ano") else ""
        txt += f"• {c['titulo']}{ano}: \"{c['texto'][:220]}…\"\n\n"
    txt += "Nota: resposta gerada por pesquisa local (sem modelo de linguagem). Abra as fontes para a informação completa."
    return {"resposta": txt, "fontes": [fonte(c) for c in chunks],
            "modo": "local", "modelo": "bm25-local"}


def resposta_rag(pergunta: str, chunks: list[dict],
                 historico: list[dict] | None = None) -> dict:
    """RAG: contexto do site + documentos + LLM via Ollama Cloud."""
    contexto = "\n\n".join(
        f"[{i}] {c['titulo']} — {c['entidade']}"
        + (f", {c['ano']}" if c.get("ano") else "")
        + f" (tipo: {c['tipo']}):\n{c['texto']}"
        for i, c in enumerate(chunks, start=1))
    sistema = (
        "É o Assistente CDA, o assistente digital e atendente da Câmara dos "
        "Despachantes Aduaneiros de Moçambique (CDA). Atende visitantes do site "
        "cda-mz.org e membros, esclarecendo dúvidas sobre a Câmara, a profissão "
        "de despachante aduaneiro, procedimentos, contactos, delegações, notícias "
        "e documentos. Responda SEMPRE em português, de forma cordial e directa.\n"
        "Regras obrigatórias:\n"
        "1. Responda APENAS com base no CONTEXTO (páginas oficiais do site, "
        "factos institucionais e documentos oficiais da CDA). Nunca invente leis, "
        "datas, valores, contactos ou procedimentos.\n"
        "2. Se a informação não estiver no contexto, responda exatamente: "
        "\"Não encontrei informação suficiente no site e nos documentos oficiais "
        "disponíveis para responder com segurança.\" e sugira contactar a CDA "
        "(tel. +258 21 305 504 / 305 506) ou consultar o Centro Documental.\n"
        "3. Cite as fontes usadas com [1], [2], etc., no fim da resposta.\n"
        "4. Seja directo e conciso (máx. 4 parágrafos).\n"
        "5. Quando útil, convide a visitar a página relevante do site "
        "(ex.: 'pode consultar a página Como ser Membro') e o Centro Documental.\n\n"
        "CONTEXTO (site oficial + documentos da CDA):\n"
        + FACTOS_INSTITUCIONAIS + "\n\n" + contexto)
    messages = [{"role": "system", "content": sistema}]
    if historico:
        for h in historico[-6:]:
            if h.get("papel") in ("user", "assistant") and h.get("conteudo"):
                messages.append({"role": h["papel"], "content": h["conteudo"]})
    messages.append({"role": "user", "content": pergunta})
    payload = {
        "model": IA_MODELO,
        "messages": messages,
        "stream": False,
        "options": {"num_predict": 2048, "temperature": 0.2},
    }
    r = httpx.post(f"{IA_URL}/api/chat", headers={
        "Authorization": f"Bearer {IA_CHAVE}"}, json=payload,
        timeout=IA_TIMEOUT)
    r.raise_for_status()
    msg = r.json().get("message", {})
    resposta = (msg.get("content") or "").strip()
    if not resposta:
        raise RuntimeError("modelo devolveu resposta vazia")
    return {"resposta": resposta, "fontes": [fonte(c) for c in chunks],
            "modo": "rag", "modelo": IA_MODELO}


app = FastAPI(title="Assistente CDA — IA", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Mensagem(BaseModel):
    papel: str
    conteudo: str


class Pergunta(BaseModel):
    pergunta: str
    ficheiro: str | None = None
    historico: list[Mensagem] | None = None


@app.post("/ia/perguntar")
def perguntar(p: Pergunta) -> dict:
    if not p.pergunta.strip():
        raise HTTPException(400, "pergunta vazia")
    chunks = busca(p.pergunta, p.ficheiro)
    if not chunks:
        return {"resposta": "Não encontrei informação suficiente no site e nos "
                            "documentos oficiais disponíveis para responder com "
                            "segurança. Contacte a CDA (tel. +258 21 305 504 / "
                            "305 506) ou consulte o Centro Documental.",
                "fontes": [], "modo": "sem-resultados", "modelo": IA_MODELO}
    historico = [{"papel": m.papel, "conteudo": m.conteudo} for m in (p.historico or [])]
    if not IA_CHAVE:
        return resposta_local(chunks)
    try:
        return resposta_rag(p.pergunta, chunks, historico)
    except Exception as e:  # noqa: BLE001
        print("ERRO LLM:", e, file=sys.stderr)
        return resposta_local(chunks)


@app.get("/ia/pesquisar")
def pesquisar(q: str = "", ficheiro: str | None = None, k: int = 5) -> dict:
    return {"resultados": [fonte(c) | {"score": c["score"]} for c in busca(q, ficheiro, k)]}


@app.get("/ia/documento")
def documento(f: str, q: str) -> dict:
    return {"resultados": [fonte(c) | {"score": c["score"]} for c in busca(q, f, 4)]}


@app.get("/ia/status")
def status() -> dict:
    ficheiros = sorted({d["ficheiro"] for d in DOCS})
    return {"total_chunks": len(DOCS), "total_docs": len(ficheiros),
            "docs_sem_texto": INDICE.get("docs_sem_texto", []),
            "modelo": IA_MODELO, "chave_configurada": bool(IA_CHAVE),
            "chunk_tamanho": INDICE["parametros"]["chunk"]}


@app.get("/")
def raiz() -> dict:
    return {"servico": "Assistente CDA — IA", "endpoints": [
        "POST /ia/perguntar", "GET /ia/pesquisar?q=",
        "GET /ia/documento?f=&q=", "GET /ia/status"]}