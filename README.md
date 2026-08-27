# CDA Digital 2.0

Portal digital + assistente de IA (RAG) da Câmara dos Despachantes Aduaneiros de Moçambique (CDA).

Fases: frontend institucional, centro documental (57 documentos), notícias, galeria, membros, área de membro (demonstração) e **Assistente CDA** — resposta fundamentada em documentos oficiais via OCR → indexação BM25 → RAG (Ollama Cloud), com fallback offline honesto.

Publicação GitHub Pages: <https://cleitonsimiaondonac2-cyber.github.io/cda-digital/>

---

## 🏗 Arquitectura (3 camadas)

```
site/   → frontend estático (fonte de verdade)  — servido local em :8000
ia/     → backend FastAPI (OCR, indexação, RAG) — API em :8765
docs/   → pasta de deploy GitHub Pages (gerada por build.sh)
```

Fluxo de conteúdo:

```
PDF ──► OCR (ia/ocr.py) ──► texto/ ──► indexação (ia/indexar.py) ──► indice.json ──► API ──► Assistente (widget em site/)
```

> `docs/` é gerado por `./build.sh` a partir de `site/`. Nunca edite `docs/` directamente.

---

## 🚀 Começar (máquina limpa)

```bash
./setup.sh            # instala deps + OCR + índice
./setup.sh api        # ... e arranca a API
```

Antes do `setup`: coloque os PDFs do acervo em `site/docs/*.pdf` e edite `ia/.env` depois (copiado do exemplo) para preencher `IA_API_KEY`.

Servir o site localmente:

```bash
python3 -m http.server 8000 --directory site
```

API em `http://127.0.0.1:8765`:
- `GET /health` — estado público (ok)
- `POST /ia/perguntar` `{pergunta, ficheiro?, historico?}` — resposta + fontes (RAG ou fallback local)
- `GET /ia/pesquisar?q=` — top-k de extratos (sem LLM)
- `GET /ia/documento?f=&q=` — pesquisa restrita a um documento
- `GET /ia/status` — métricas (protegido se `IA_STATUS_TOKEN` definido)

---

## ⚠️ Notas de produção (antes de entregar à CDA)

1. **IA pública:** o GitHub Pages serve só o site estático. Em produção a API tem de estar atrás de um reverse proxy (Nginx/Caddy/Cloudflare) em domínio próprio (ex.: `api.cda-mz.org` ou `/api/ia` no mesmo domínio) e o CORS alargado via `IA_ORIGINS`.
2. **Deploy determinístico:** manter `site/` como fonte; rodar `./build.sh` e publicar `docs/`.
3. **Dados privados:** contactos da instituição → *factos_institucionais.txt* (curados). Dados de membros → confirmar com a CDA quais campos são públicos.
4. **Segurança:** `ia/.env` nunca é versionado. Definir `IA_STATUS_TOKEN` e `IA_PROXY_HEADER` em produção (rate limiting já ativo).
5. **Área de membro e formulário de contacto** são demonstração — exigem backend de autenticação/BD antes da entrega.

---

## ✅ Checklist de entrega — RELEASE 1.0

| Item | Estado |
|---|---|
| Homepage | CONCLUÍDO (conteúdo estático, sem depender de JS) |
| Instituição | CONCLUÍDO |
| Órgãos sociais | CONCLUÍDO |
| Delegações | PARCIAL (visual a melhorar — mapa) |
| Despachantes | CONCLUÍDO (verificar referências jurídicas com a CDA) |
| Lista de membros | PARCIAL (rever privacidade de campos) |
| Centro documental | PARCIAL (falta gestão/CMS) |
| Pesquisa | PARCIAL (lexical+BM25; evolução: híbrida) |
| OCR | CONCLUÍDO (5 PDFs corrompidos fora do acervo) |
| IA (RAG + fallback honesto) | CONCLUÍDO |
| Notícias | PARCIAL (homepage estática; falta CMS) |
| Galeria | CONCLUÍDO |
| Contactos | PARCIAL (formulário é mailto — falta backend) |
| Área de membro | PRECISA DE DECISÃO (é demonstração/mock) |
| Login/Autenticação | FALTA |
| Administração | FALTA |
| Segurança | PARCIAL (hardening P0 feito; falta auth/BD/HTTPS) |
| SEO | PARCIAL |
| Mobile/Responsivo | CONCLUÍDO |
| Backup | FALTA |
| Deploy | PARCIAL (estático OK; falta API/proxy em produção) |
| Testes | PARCIAL (tests/ básicos) |
| Documentação | PARCIAL |

### Estado — build de hardening (esta fase)

- **Fix P0**: `site/` é a única fonte; `docs/` gerado por `build.sh` (elimina divergência). 
- **API**: rate limiting (20/60s, overridable), `/health` público, `/ia/status` protegível por token, `k` limitado a 20, validação de `pergunta`/`histórico`.
- **Fallback honesto**: o modo local indica claramente "sem modelo de linguagem" na resposta e na UI (`.assist-status`); timeout de 30 s.
- **Bootstrap**: `setup.sh`, `ia/requirements.txt`, `ia/.env.example`, `README.md`.
- **Testes**: `tests/test_links.py`, `tests/test_indice.py`, `tests/test_api.py`.

> ⚠️ **Contexto da auditoria**: a alegação de que OCR/indexador apontam para pasta errada era falsa — `site/` é a fonte de desenvolvimento e `docs/` a de deploy; ambas existem e a divergência é resolvida por `build.sh`. A referência jurídica "Decreto 16/2011 (Estatuto)" **está correta** (verificado por OCR do PDF); "Diploma Ministerial 16/2012" é um documento distinto (Regulamento do Desembaraço Aduaneiro).

---

## 🧪 Testes

```bash
python3 tests/test_links.py      # valida links/acessibilidade de ficheiros e PDFs
```

(Estrutura de testes a alargar: API, OCR, indexação, pesquisa.)

## 📄 Documentos

- `01-auditoria-cda.{md,pdf}` — auditoria do site antigo
- `02-proposta-portal-cda.{md,pdf}` — proposta (referência histórica)
- `03-resumo-apresentacao.{md,pdf}` — resumo de apresentação
- `04-ia-retrieval.md` — relatório da fase IA/assistente
