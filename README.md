# CDA Digital 2.0

Portal digital + assistente de IA (RAG) da Câmara dos Despachantes Aduaneiros de Moçambique (CDA).

Fases: frontend institucional, centro documental (266 PDFs no acervo), notícias, galeria, lista de membros, **área de membro funcional** (registo validado por carteira, quotas e requerimentos), **painel de administração** e **Assistente CDA** — resposta fundamentada em documentos oficiais via OCR → indexação BM25 → RAG (Ollama Cloud), com fallback offline honesto.

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

Servir o site localmente (qualquer porta; o frontend detecta o backend em `127.0.0.1:8765`):

```bash
python3 -m http.server 8000 --directory site
```

API em `http://127.0.0.1:8765`:

```bash
./ia/run.sh
# ou: ia/venv/bin/python -m uvicorn ia.api:app --host 127.0.0.1 --port 8765
```

- `GET /health` — estado público (ok)
- `POST /ia/perguntar` `{pergunta, ficheiro?, historico?}` — resposta + fontes (RAG ou fallback local)
- `GET /ia/pesquisar?q=` — top-k de extratos (sem LLM)
- `GET /ia/documento?f=&q=` — pesquisa restrita a um documento
- `GET /ia/status` — métricas (protegido se `IA_STATUS_TOKEN` definido)
- `POST /api/auth/registar` / `POST /api/auth/login` — conta de membro (carteira + nome da lista pública)
- `GET /api/membro/resumo` — carteira, quotas e requerimentos do membro autenticado
- `POST /api/membro/requerimentos` — novo requerimento
- `/api/admin/*` — gestão de documentos, notícias, actividades, mensagens, membros, quotas e requerimentos

### Criar o primeiro administrador

```bash
./ia/venv/bin/python -m ia.criar_admin --email admin@cda-mz.org
# a senha é pedida no terminal (mín. 8 caracteres)
```

Depois de entrar em `admin.html`, o administrador aprova as contas pendentes em **Membros**, marca quotas como pagas e actualiza o estado dos requerimentos. Uma conta só consegue entrar depois de aprovada.

### Conta de membro

1. O membro abre `area-membro.html` e regista-se com **nome + número de carteira** (validados contra `site/data/membros.json`) e uma senha.
2. A conta fica `pendente` até aprovação no painel admin.
3. Após aprovação, entra com **carteira ou e-mail** e vê quotas, requerimentos e os seus dados públicos.
4. O administrador pode desactivar a conta a qualquer momento.

---

## ⚠️ Notas de produção (antes de entregar à CDA)

1. **IA pública:** o GitHub Pages serve só o site estático. Em produção a API tem de estar atrás de um reverse proxy (Nginx/Caddy/Cloudflare) em domínio próprio (ex.: `api.cda-mz.org` ou `/api/ia` no mesmo domínio) e o CORS alargado via `IA_ORIGINS`.
2. **Deploy determinístico:** manter `site/` como fonte; rodar `./build.sh` e publicar `docs/`.
3. **Base da API no frontend:** em produção defina `window.CDA_API_OVERRIDE = "https://api..."` **antes** de `js/config.js`, ou edite `CDA_API_BASE` em `site/js/config.js`. Sem override, o site estático usa a mesma origem e o login/admin/chat não funcionam no GitHub Pages.
4. **Dados privados:** contactos da instituição → *factos_institucionais.txt* (curados). Dados de membros → confirmar com a CDA quais campos são públicos.
5. **Segurança:** `ia/.env`, `ia/.auth_secret` e `*.db` nunca são versionados. Em produção: HTTPS obrigatório (cookies de sessão), `AUTH_SECRET` próprio, `IA_STATUS_TOKEN` e `IA_PROXY_HEADER` definidos e backup regular da BD.
6. **Área de membro:** funcional, mas a validação usa a lista pública `site/data/membros.json`; antes de produção confirme a origem oficial dessa lista e o fluxo de aprovação com a CDA.
7. **OCR:** sem `tesseract-ocr` instalado, os PDFs digitalizados não entram no índice (nesta máquina: 34/266 com camada de texto). Instale `tesseract-ocr` e `tesseract-ocr-por` para indexar o acervo completo.

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
| Centro documental | CONCLUÍDO (consulta pública + gestão no admin) |
| Pesquisa | PARCIAL (lexical+BM25; evolução: híbrida) |
| OCR | PARCIAL (34/266 PDFs indexados; instalar tesseract para o resto) |
| IA (RAG + fallback honesto) | CONCLUÍDO |
| Notícias | CONCLUÍDO (CMS no admin) |
| Galeria | CONCLUÍDO |
| Contactos | CONCLUÍDO (formulário com backend + mensagens no admin) |
| Área de membro | CONCLUÍDO (registo por carteira, aprovação, quotas, requerimentos) |
| Login/Autenticação | CONCLUÍDO (sessão assinada; produzir com HTTPS) |
| Administração | CONCLUÍDO (conteúdo, membros, quotas e requerimentos) |
| Segurança | PARCIAL (hardening P0 + auth; falta HTTPS/proxy em produção) |
| SEO | PARCIAL |
| Mobile/Responsivo | CONCLUÍDO |
| Backup | FALTA (definir política para `cda.db`) |
| Deploy | PARCIAL (estático OK; falta API/proxy em produção) |
| Testes | CONCLUÍDO (links, índice, IA, API, membros/admin) |
| Documentação | CONCLUÍDO |

### Estado — build de hardening (esta fase)

- **Fix P0**: `site/` é a única fonte; `docs/` gerado por `build.sh` (elimina divergência). 
- **API**: rate limiting (20/60s, overridable), `/health` público, `/ia/status` protegível por token, `k` limitado a 20, validação de `pergunta`/`histórico`.
- **Fallback honesto**: o modo local indica claramente "sem modelo de linguagem" na resposta e na UI (`.assist-status`); timeout de 30 s.
- **Bootstrap**: `setup.sh`, `ia/requirements.txt`, `ia/.env.example`, `README.md`.
- **Testes**: `tests/test_links.py`, `tests/test_indice.py`, `tests/test_api.py`, `tests/test_membros.py`.
- **Área de membro**: registo validado por carteira na lista pública, conta pendente até aprovação, login por carteira/e-mail, quotas e requerimentos com estados.
- **Painel admin**: dashboard, CRUD de documentos/notícias/actividades, leitura de mensagens e gestão de membros, quotas e requerimentos.
- **Assistente**: sugestões iniciais, estados de carregamento, `aria-live`, bloqueio do input durante o pedido e nota explícita de modo `rag`/`local`.

> ⚠️ **Contexto da auditoria**: a alegação de que OCR/indexador apontam para pasta errada era falsa — `site/` é a fonte de desenvolvimento e `docs/` a de deploy; ambas existem e a divergência é resolvida por `build.sh`. A referência jurídica "Decreto 16/2011 (Estatuto)" **está correta** (verificado por OCR do PDF); "Diploma Ministerial 16/2012" é um documento distinto (Regulamento do Desembaraço Aduaneiro).

---

## 🧪 Testes

```bash
tests/run_tests.sh        # corre toda a suíte (links, índice, lógica IA, API)
```

Suíte:
- `tests/test_links.py` — valida links/âncoras de todas as páginas e existencia de PDFs.
- `tests/test_indice.py` — integridade do `indice.json` (chunks × PDFs).
- `tests/test_ia_logic.py` — normalização, busca, fallback honesto e prompt (sem rede).
- `tests/test_api.py` — smoke da API via TestClient (health, validação, rate-limit, clamp).
- `tests/test_membros.py` — registo por carteira, aprovação, login, quotas, requerimentos e isolamento do admin.


