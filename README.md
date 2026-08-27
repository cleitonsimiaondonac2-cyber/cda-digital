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

## ✅ Checklist de entrega (state)

| Área | Estado |
|---|---|
| Frontend (9 páginas, navegação, IA responsiva) | CONCLUÍDO |
| Centro documental + pesquisa | PARCIAL (falta gestão/CMS) |
| OCR + indexação + RAG + fallback | CONCLUÍDO (evolução: pesquisa híbrida) |
| API (CORS, rate limit, validação, health) | PARCIAL (falta deploy/proxy) |
| Autenticação / BD / gestão de membros | FALTA |
| Administração (CMS de conteúdos) | FALTA |
| Testes automáticos | PARCIAL (test_links.py) |
| Documentação | PARCIAL |

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
