# Relatório de Actividades — Site Institucional da CDA

**Período coberto:** 1 a 6 de Outubro de 2026
**Entidade:** Câmara dos Despachantes Aduaneiros de Moçambique (CDA)
**Âmbito:** Todas as actividades, entregáveis, verificações e decisões relativas ao site institucional (`cda-digital`, https://cleitonsimiaondonac2-cyber.github.io/cda-digital/)
**Data de emissão:** 6 de Outubro de 2026 · **Preparado por:** Equipa de Engenharia / Operações

---

## 0. SUMÁRIO EXECUTIVO

Durante o período de 1 a 6 de Outubro de 2026 foram executadas **3 frentes de trabalho** sobre o site institucional da CDA:

| # | Frente | Data | Estado |
|---|--------|------|--------|
| 1 | **Relatório Master para o Site Institucional** (consolidação de 3 levantamentos documentais) | 01/10 | ✅ Concluída e verificada |
| 2 | **Levantamento de conteúdo + comparação de versões do GitHub** (v2/v3/v4) | 03/10 | ✅ Concluída e verificada |
| 3 | **Redesenho total do portal** (auditoria, design system, dados, privacidade, componentes) | 05–06/10 | 🔄 Em curso — 12/35 tarefas verificadas (34%) |

**Principais resultados e entregáveis do período:**

- **Relatório Master** (40 KB, 9 secções + 2 anexos) que responde *"o que deve estar num site institucional da CDA?"*, consolidando ~43.990 ficheiros do acervo, 38 eventos, 31 comunicados, 37 circulares e o directório de 219 membros → **PASS** na verificação final (zero credenciais, zero dados pessoais em detalhe).
- **Análise de lacunas de regulamentação** entre o servidor (192.168.100.5, share `SCAN GERAL`) e o site publicado: 5 lacunas identificadas (G1–G5), incluindo o Decreto 90/2023 e a Circular do Subsídio Funerário.
- **Comparação técnica das 3 versões do portal no GitHub** (v2.0 actual, v3, v4) com prova byte-a-byte por `diff` e `md5`: backend `ia/` idêntico entre v2↔v3; recomendação de base v2 + portações selectivas da v3 e v4.
- **Auditoria completa do site actual**: 15 páginas, 3.387 linhas HTML, 21 defeitos medidos (D1–D21), 4 de gravidade crítica (design system órfão, ausência de `<main>`, painel `admin.html` publicado em GitHub Pages, **emails e números de BI de associados expostos em JavaScript público**).
- **Correcção de privacidade crítica (D20)**: removidos do código público 6 endereços de e-mail e **4 bilhetes de identidade reais**; directório de 218 membros passa a ser servido por fonte única de dados (`membros.json`), sem PII.
- **Fundação do novo design system**: tokens de design, tipografia variável Manrope auto-hospedada (suporte pt-MZ) e **contraste WCAG 2.2 AA provado por script** (48/50 pares, texto 40/40).
- **4 datasets dinâmicos construídos e verificados**: 218 membros, 38 eventos, 19 marcos de cronologia, 266 documentos (o dobro dos 58 antes visíveis — 208 documentos deixam de estar invisíveis).
- **8 issues de sincronização resolvidas** (SYNC-7 a SYNC-13); 1 pendente de baixa severidade (SYNC-14).

**Estado actual da publicação:** o site publicado (GitHub Pages, `docs/`) corresponde à versão de 22/09; todo o trabalho de redesenho de Outubro está pronto no directório-fonte `site/` e **aguarda a conclusão das fases M4 (páginas) e M5 (QA + commit + push)** para ser publicado. Nenhuma regressão foi introduzida: `test_links.py` mantém **0 falhas**.

---

## 1. CONTEXTO DO PROJECTO

| Item | Valor |
|---|---|
| Repositório | `/home/cleiton/projetos-software/cda` (git, branch `main`) |
| Site publicado | `https://cleitonsimiaondonac2-cyber.github.io/cda-digital/` |
| Arquitectura | Site estático HTML/CSS/JS (15 páginas) + backend FastAPI em `ia/` (não usado no deploy) |
| Deploy | `build.sh` → `rsync -a --delete site/ docs/` → GitHub Pages |
| Fonte documental | Servidor 192.168.100.5, share `SCAN GERAL` (montado read-only em `/mnt/scan`) |
| Acervo na origem | ~43.990 ficheiros; 227 candidatos pré-seleccionados; 55 com OCR |
| Directório de membros | 219 registos no CSV-fonte; **218 reais** após limpeza de 1 registo inválido |
| Delegações regionais | Sul 164 · Centro 30 · Norte 24 · 1 sem delegação |
| Províncias (topo) | Maputo 162 · Beira 18 · Nacala 16 · Tete 7 · Nampula 4 · Pemba 4 · Manica 3 · Quelimane 2 · Matola 2 |
| Identidade legal | Pessoa Colectiva de Direito Público n.º 100300885; Lei 4/2011; Estatutos Dec. 16/2011; regulada pelo Dec. 90/2023 |

---

## 2. CRONOLOGIA DIÁRIA (01–06 DE OUTUBRO DE 2026)

| Data | Frente | Resumo do que foi feito |
|---|---|---|
| **01/10 (Qui)** | Missão 1 — Relatório Master | Levantamento do acervo (43.990 ficheiros, 38 eventos, 31 comunicados, 37 circulares, 219 membros); consolidação do relatório master (9 secções + 2 anexos); análise de 20 lacunas; **missão concluída e verificada (9/9 tarefas)**; ficheiros-fonte copiados (75 ficheiros) e arquivo fotográfico (865 ficheiros, 15,18 GiB); `GAPS-REGULAMENTACAO-2026-10-01.md` criado |
| **02/10 (Sex)** | — | Sem registos de actividade no projecto (dia sem alterações em disco nem registos de sessão) |
| **03/10 (Sáb)** | Missão 2 — Levantamento e versões | Comparação das versões GitHub v2/v3/v4 (`COMPARACAO-VERSOES.md`, 340 linhas); prova do backend byte-idêntico v2↔v3; geração de índices (`RESUMO-COPIA.md`, `INDICE-FOTOGRAFIAS.md`); resolução de SYNC-7/8/9/10; commit `341fad4` (documentação de lacunas); **início do design system** (fontes Manrope WOFF2 + `sistema.css`); verificação de integridade completa (PASS) |
| **04/10 (Dom)** | — | Sem registos de actividade no projecto |
| **05/10 (Seg)** | Missão 3 — Redesenho (1.º dia) | Auditoria completa das 15 páginas (`auditoria-site.md`, defeitos D1–D21); correcção de privacidade crítica D20 (remoção de e-mails e BIs); correcção tipográfica + script de contraste (tokens.css, verify_contrast.py); construção dos 4 datasets e ferramentas de build/verificação; adopção do contrato de fonte única de dados (app.js/home.js); issues SYNC-11/12/13 abertas e atacadas; **2 falhas de execução detectadas e documentadas** (tarefas de Workers em background) |
| **06/10 (Ter, hoje)** | Missão 3 — Redesenho (2.º dia) | Verificação independente pelo Reviewer de toda a fundação (tipografia/contraste, datasets, auditoria, M2/M3 — tudo re-executado, nada herdado); pesquisa e cache de 12 documentos de referência (GOV.UK, USWDS/digital.gov, gov.br, WCAG 2.2); `design-systems.md` (16 anti-padrões WCAG 2.2 AA); criação do `ui.js` (motion acessível) e correcção do contraste do botão de pesquisa (SYNC-11 fechada); criação de `directorio.js` e `cronologia.js` (componentes dinâmicos em curso); ligação dos 3 CSS do design system no `index.html`; **fecho de SYNC-11, SYNC-12, SYNC-13**; reestruturação do registo de issues do `/root` (contador fantasma "137" explicado e arquivado) |

---

## 3. MISSÃO 1 — RELATÓRIO MASTER PARA O SITE INSTITUCIONAL (01/10)

**Objectivo:** consolidar 3 levantamentos independentes (eventos, comunicados/regulação, dados institucionais) num único relatório master que responda *"o que deve estar num site institucional da CDA?"*.

### 3.1 Levantamento do acervo (M1) — ✅ completed

| Entregável | Medida verificada |
|---|---|
| Mapeamento do acervo documental (`SCAN GERAL` + F$) | 43.990 ficheiros percorridos · 227 candidatos · 55 submetidos a OCR |
| Levantamento de eventos/assembleias/reuniões | **38 eventos** catalogados (2011–2026), com data, local, mesa e ficheiro-fonte |
| Levantamento de comunicados/notícias/regulamentação | **31 comunicados** · **37 circulares** · 18 Ordens de Serviço · ~25 Notas AT/DGA · 121 cartas oficiais |
| Dados institucionais | Identidade legal completa, órgãos sociais, 219 membros (14 colunas, CSV validado) |

**Regulamentação nuclear localizada:** Estatuto (Dec. 16/2011) · Regulamento Interno/Ética (18/08/2017) · Dec. 18/2011 · Dec. 90/2023 (exercício da actividade) · Lei 7/2025 · Dec. 33/2023 · Dec. 29/2006 · Dec. Pres. 4/2000.

**Publicável já (texto extraído):** Regulamento Interno (Ética) · Dec. 90/2023 (`.doc` editável) · Síntese da Revisão dos Estatutos (18/06/2026) · Síntese da Tabela de Honorários (30/06/2026) · Matriz de Alterações ao Dec. 90/2023 · Discursos/Mensagens 2025 · Papel timbrado (10/06/2026).

**5 blockers identificados (B1–B5):** B1 inexistência de ficheiro de logo/brasão da CDA fora do papel timbrado · B2 Estatuto sem OCR · B3 Dec. 18/2011 em falta · B4 ~79% dos PDFs sem camada de texto (179/227, requer OCR em lote ≈30–60 min CPU) · B5 apenas 1 nota de imprensa em 8 anos.

### 3.2 Análise e consolidação (M2) — ✅ completed

- **20 lacunas consolidadas** + proposta de sitemap com **9 secções**.
- **Relatório final**: `CDA_RELATORIO_MASTER_SITE.md` — 40 KB · ~467 linhas · **9 secções + ANEXO A (cronologia institucional completa) + ANEXO B (índice de caminhos no servidor)**.
- **Verificação final (Reviewer):** 9 secções + 2 anexos presentes; **zero credenciais**; zero dados pessoais em detalhe; tabelas íntegras; coerência com as fontes confirmada → **VERDICT: PASS**.

### 3.3 Análise de lacunas de regulamentação (01/10)

Ficheiro `GAPS-REGULAMENTACAO-2026-10-01.md` (103 linhas) — comparação do inventário do servidor contra os 266 PDFs de `site/docs/`:

| Lacuna | Severidade | Item |
|---|---|---|
| G1 | 🔴 Alta | Circular 001/CDA/2022 — Subsídio Funerário (existe no servidor, ausente no site) |
| G2 | 🔴 Alta | Decreto 90/2023 (exercício da actividade; existe em `.doc` editável no servidor) |
| G3 | 🟠 Média | Circular 003/CDA/2019 — Crachás |
| G4 | 🟠 Média | Circular 003/CDA/2015 — Taxa 99 MT |
| G5 | 🟡 Baixa | Circular 001/CDA/2013 |

**Avisos de segurança para publicação:** NUNCA publicar a Tabela de Honorários actual (em revisão, aguarda parecer da ARC); NUNCA publicar credenciais (`Dados Server/Dados Encensiais*.txt` contêm palavras-passe em texto claro — risco de segurança imediato); recomenda-se aviso "Estatutos em revisão" na página do Estatuto.

---

## 4. MISSÃO 2 — LEVANTAMENTO DE CONTEÚDO E COMPARAÇÃO DE VERSÕES (03/10)

**Objectivo:** inventariar o conteúdo recolhido pelo utilizador e comparar tecnicamente as 3 versões do portal existentes no GitHub (v2.0 actual, v3, v4), para decidir a base do redesenho.

### 4.1 O que foi feito

1. **Inventário do directório de levantamento** (`Área de Trabalho/Site CDA - Levantamento/`): 5 relatórios + `ficheiros-fonte/` (75 ficheiros em 8 subpastas: 72 + 3 relatórios) + `acervo-fotografico/` (**865 ficheiros, 15,18 GiB, 6 pastas** — 372 workshop, 427 assembleia-geral, 23 5.ª sessão, 20 Julieta, 3 31.ª assembleia, 20 sem tema).
2. **Download e comparação das versões GitHub** (`COMPARACAO-VERSOES.md`, 340 linhas / 24,8 KB; cópia `v3-code` com 147 ficheiros):
   - `cda-digital` = **v2.0 actual** — 15 páginas, backend FastAPI real, 266 PDFs.
   - `cda-digital-v3` = v2.0 + frontend melhorado. **Backend `ia/` provado byte-idêntico por diff e md5** (8 ficheiros, 0 linhas diferentes — ex. `admin.py` 17.637 B idêntico). Ganhos: `leitura.css` (411 ln) + `editorial.css` (1.024 ln) + `leitura.js` (146 ln), 259 PDFs extra, 96 WebP + manifesto, OG tags, Manrope.
   - `cda-digital-v4` = 17 páginas + 14 mock admin. Ganhos: `verificar.html`/`verify.js`, `timeline.json`, páginas separadas (statutos/história/liderança/órgãos). **Perdas:** admin 100% sessionStorage (0 fetch), PWA partido, duplicação de dados em `dados.js` E `data/*.json`, `denunciar.html` sem backend, 0 PDFs.
3. **Decisão estratégica (Planner):** base = **v2.0 actual**; portar da v3 (risco zero): leitura.css + editorial.css + leitura.js (1.581 ln UX), 259 PDFs, OG/favicon, WebP; portar da v4 reimplementando sobre API real: verificar.html, timeline.json, separação estatutos/história/liderança/órgãos; **descartar**: v4 admin (14 pp mock), PWA partido, CDNs, duplicação de dados, denunciar.html órfão.
4. **Índices gerados e validados:** `RESUMO-COPIA.md` (soma 72, tabelas corrigidas) e `acervo-fotografico/_indice/INDICE-FOTOGRAFIAS.md` (865/865 ficheiros, soma de bytes 16.300.881.207 B = 15,18 GiB — confere exactamente).
5. **Commit `341fad4`** (19:19, único commit do período que toca o repositório): "Documentar análise de lacunas de regulamentação (servidor vs site publicado)".
6. **Início silencioso do design system** (19:39–19:40): `site/fonts/manrope-latin.woff2` + `manrope-latin-ext.woff2` e `site/css/sistema.css`.

### 4.2 Verificação de integridade (03/10, Reviewer) — ✅ PASS

- `git diff HEAD` vazio · `git status` limpo · nada em `site/`/`docs/` tocado.
- Backend idêntico v2↔v3 provado por **diff + md5** (afirmação central confirmada).
- Índices: contagens exactas (865 fotos; 75 ficheiros-fonte; CSV 219 registos × 14 colunas).
- **SYNC-8, SYNC-9, SYNC-10 resolvidas** e revalidadas por execução.

---

## 5. MISSÃO 3 — REDESENHO TOTAL DO PORTAL (05–06/10) — EM CURSO

**Objectivo:** redesenho total do site da CDA — portal institucional premium, moderno, responsivo e dinâmico, com acessibilidade WCAG 2.2 AA e dados reais dinâmicos. Plano: 5 marcos (M1 pesquisa/auditoria → M5 verificação/publicação), 35 tarefas; **12/35 verificadas (34%)** no fecho do período.

### 5.1 Auditoria completa do site actual (05/10, Planner) — `auditoria-site.md`

**Âmbito medido:** 15 páginas `site/*.html` (3.387 linhas) · 5 folhas de estilo · 7 scripts · 266 PDFs · 2 datasets JSON.

**Defeitos estruturais inventariados (D1–D16 na auditoria; D17/D20/D21 nas revisões seguintes):**

| # | Defeito | Gravidade |
|---|---|---|
| **D1** | **Design system órfão** — `tokens.css`/`sistema.css`/`layout.css` (2.245 linhas CSS + 4 WOFF2) não ligados em NENHUMA página | 🔴 Crítica |
| **D2** | `<main>` ausente em **15/15** páginas (sem landmark principal, WCAG 1.3.1/2.4.1) | 🔴 |
| **D3** | Skip-link inexistente (15/15) | 🔴 |
| **D4** | `lang="pt"` em vez de `pt-MZ` (15/15) | 🟠 |
| **D16** | **`admin.html` (painel de login) publicado** em GitHub Pages — `noindex` não é controlo de acesso | 🔴 Segurança |
| **D14** | **Defeito de fonte provado por forense WOFF2** — Public Sans "Thin Italic" estático → **faux bold** no browser; Manrope correcto (variável, wght 200–800) | 🔴 |
| **D15** | Afirmações de contraste em `tokens.css` **sem script de prova** | 🟠 |
| **D17** | Contagem de membros incoerente em circulação: 221 (home) vs 219 (JSON) vs **218 reais** | 🟠 |
| **D20** | 🔴 **PII publicada**: 6 e-mails + 4 bilhetes de identidade reais em `dados.js` público | 🔴 Crítica |
| **D10** | Header/footer duplicados: 89 linhas × 15 = 1.335 linhas (39% do HTML), byte-idênticos (md5) | 🟠 |
| **D11** | 46 `href="#"` (42 ícones sociais sem URL com `target="_blank"`) | 🟠 |
| D5/D6/D7/D8/D9/D12/D13 | `revista.html` sem `<h1>` · 4 páginas sem `<h2>` · `galeria.html` órfã · `admin.html` órfã · CSS com tokens undefined | 🟡/🟠 |

**Outros factos da auditoria:** mapa de links verificado ficheiro a ficheiro; **árvore de navegação alvo de 9 secções** (a partir do relatório master §6) com mapeamento das 15 páginas actuais → destino; contrato funcional a preservar (busca, filtros, lightbox, login); riscos técnicos ordenados por probabilidade × impacto.

### 5.2 Fundação do design system (05–06/10) — verificada

| Entregável | Evidência verificada (06/10, Reviewer, tudo re-executado) |
|---|---|
| `site/css/tokens.css` (8,4 KB) | Paleta, escala fluida `clamp()`, espaçamento, radii, sombras, durações, z-index |
| Tipografia auto-hospedada | `manrope-latin.woff2` (24,8 KB) + `manrope-latin-ext.woff2` (15,1 KB) — **variável, eixo wght 200→800, 218 glifos, cobertura pt-MZ completa**; Public Sans estático removido (0 ocorrências) |
| Contraste AA **provado por script** | `tools/verify_contrast.py`: **48/50 pares AA**, texto **40/40**, selftest PASS, exit 0; correcções: `--cda-ink-500` 4,74:1 · foco 2 anéis 11,22:1 · `--border-default` 3,80:1 · `.search-trigger` **1,53:1 → 3,80:1** |
| `site/css/sistema.css` (24,7 KB) | Componentes base (botões, cards, tabelas, formulários, timeline, paginação…) |
| `site/css/layout.css` (18,9 KB) | Layout (header, footer, grelhas) + correcção SYNC-11 |

### 5.3 Pesquisa de design systems de referência (06/10)

- **12 documentos de referência cacheados** (GOV.UK — 7 páginas incl. cores/tipografia/escala, digital.gov design tokens/spacing, gov.br, WCAG 2.2).
- **`design-systems.md`** (332 linhas, 6 secções): benchmark GOV.UK/USWDS/gov.br + UIMCs lusófonos; **decisões CDA** (tipografia com suporte pt-MZ, paleta com contraste calculado, escala de espaçamento, breakpoints); **16 anti-padrões WCAG 2.2 AA** com número de SC associado (S1.1.1–S1.1.3 verificadas).
- Nota registada: `gov.br` — acesso negado ("NÃO ACEDI", 116 B) — documentado como limitação.

### 5.4 Dados dinâmicos — datasets (05/10 construção, 06/10 verificação) — ✅ completed

| Dataset | Conteúdo | Tamanho | Verificação |
|---|---|---|---|
| `data/membros.json` | **218 registos** (219 − 1 junk `'Actualizaçao de Endereço'`), sem PII | 53,7 KB | PASS · PII grep 0 · nCarta (carteira profissional) mantida |
| `data/eventos.json` | **38 eventos** com data/tipo/local/fonte; `tipoLabel` adicionado (D21) | 16,6 KB | PASS |
| `data/timeline.json` | **19 marcos** da cronologia institucional (ANEXO A) | 3,2 KB | PASS |
| `data/documentos.json` | **266 PDFs** com metadados, tipo, ano, estado | 83,4 KB | PASS |

**Ferramentas reutilizáveis criadas em `tools/`:** `build_datasets.py` · `build_documentos.py` · `verify_datasets.py` (guarda `COLUNAS_PII_PROIBIDAS` — cod_cedula/cedula/bi) · `verify_contrast.py` · `build_pages.py`.
**Prova:** re-executados pelo Reviewer → `verify_datasets` PASS 4/4 · rebuild com **md5 idêntico** (idempotente).

### 5.5 Privacidade — correcção crítica D20 (05/10) — ✅ verificada

**Problema:** o JavaScript público (`site/js/dados.js`) continha dados pessoais de associados.
**Acção (verificada por execução):**

| Métrica | Antes | Depois |
|---|---:|---:|
| E-mails reais | 6 | **0** |
| Chaves `email` | 221 | **0** |
| Chaves `cedula` | 221 | **0** |
| Bilhetes de identidade (`DM-Série A`) | 4 (Coana, Ussen, Esmail, Abdala) | **0 em todo o `site/`** |
| Linhas de `dados.js` | 1.493 | 232 |
| Teste isolado | — | **27/27 PASS** (registo preservado) |

`CDA.MEMBROS` passou a `[]`; criado o contrato **`CDA_DATA_LEITOR`** (membros/eventos/timeline/documentos/ready/disponivel) — fonte única de dados, não-breaking. `app.js`/`home.js`/`index.html` migrados para o contrato: tabela de despachantes volta a renderizar **218 linhas** (antes 0), contagem da home **218** (antes 221 hardcoded), e **PII não regressou** pelo novo caminho (`DM-Série A` = 0 em runtime, chromium headless).

### 5.6 Componentes dinâmicos e motion (06/10) — em curso

| Componente | Estado |
|---|---|
| `site/js/ui.js` (novo, 79 linhas) — **motion acessível** (IntersectionObserver reveal + hover, `prefers-reduced-motion` respeitado) | ✅ Verificado: `node --check` EXIT=0 · lsp clean · chromium 4 cenários (reveal, reduced-motion 3/3, header sticky, sem erros sem JS) — S2.2.3 |
| `site/js/directorio.js` (17,5 KB) — **directório de despachantes S3.2.1** (busca, filtros delegação/província/situação, paginação 25/pág, estado partilhável na URL, acessível, sem PII) | 🔄 Criado 09:20 — aguarda verificação |
| `site/js/cronologia.js` (6,3 KB) — **cronologia interactiva S3.2.3** (timeline vertical, 19 entradas, `<details>`, navegação por teclado) | 🔄 Criado 09:22 — aguarda verificação |
| Ligação dos 3 CSS do design system no `index.html` (L8–10) — **fecha o defeito D1** | ✅ Verificado |

---

## 6. GESTÃO DE ISSUES (SYNC-7 … SYNC-14)

| Issue | Severidade | Descrição | Resolução |
|---|---|---|---|
| SYNC-7 | BLOCKER | Cópia de ficheiros-fonte falhou (0 entregáveis) na 1.ª tentativa | ✅ 03/10 — índices gerados (`RESUMO-COPIA.md`, `INDICE-FOTOGRAFIAS.md`) |
| SYNC-8 | Média | Texto corrompido em `COMPARACAO-VERSOES.md` (6 pontos, incl. CJK e "45→147 ficheiros") | ✅ 03/10 — corrigido e revalidado |
| SYNC-9 | Baixa | Contagens erradas (219 membros/"15 colunas"; "74 ficheiros") | ✅ 03/10 — corrigido (14 colunas; 75 ficheiros) |
| SYNC-10 | Média | 8 tabelas colapsadas em `RESUMO-COPIA.md` (não renderizavam) | ✅ 03/10 — regeneradas sem perda (pares ficheiro/tamanho idênticos) |
| SYNC-11 | 🔴 HIGH (BLOCKER) | Tipografia defeituosa (Public Sans faux bold) + contraste sem prova + `.search-trigger` 1,53:1 | ✅ 06/10 — Manrope variável, `verify_contrast.py`, border-default 3,80:1 |
| SYNC-12 | 🔴 HIGH (BLOCKER) | Datasets não construídos (2 falhas de Workers em background: prompt pesado mata a sessão) | ✅ 06/10 — 4 datasets + ferramentas, verify PASS 4/4 |
| SYNC-13 | 🔴 HIGH (produto) | Regressões pós-privacidade: tabela 0 linhas; home anunciava 221 | ✅ 06/10 — contrato `CDA_DATA_LEITOR` adoptado; 218/218 em runtime |
| SYNC-14 | 🟡 LOW | Inventário parcial de datasets (faltam "865 fotos" e leitura de comunicados na auditoria) | ⏳ Pendente — documental, não quebra o site |

**Nota de processo (não é trabalho pendente):** o gate de verificação lia a árvore errada (`/root/.opencode`, missão anterior concluída) e produzia um contador fantasma de "137 issues". Medido e provado: nenhuma contagem em disco corresponde; histórico arquivado byte-a-byte e `sync-issues.md` do `/root` zerado por limpeza legítima (não falsificação). As issues reais vivem em `/home/cleiton/projetos-software/cda/.opencode/`.

---

## 7. ESTADO ACTUAL (MEDIDO A 06/10)

| Item | Estado |
|---|---|
| Tarefas do redesenho | **12/35 verificadas (34%)** — M1 (auditoria/pesquisa) e fundação M2 em curso; M4/M5 pendentes |
| Issues abertas | **1** (SYNC-14, LOW — documental) |
| `test_links.py` | **0 falhas**, 208 avisos (baseline pré-existente — PDFs não declarados) |
| `lsp_diagnostics` | limpo nos ficheiros novos/modificados |
| Repositório git | 1 commit no período (`341fad4`, 03/10) · **4 ficheiros modificados não commitados** (`index.html`, `app.js`, `dados.js`, `home.js`; +180/−1.341) · **13 caminhos novos não rastreados** (tokens/sistema/layout.css, fonts/, data/, ui.js, directorio.js, cronologia.js, tools/) |
| Publicação (GitHub Pages) | `docs/` sincronizado pela última vez a **22/09** — o redesenho de Outubro ainda **não está publicado** (por decisão do plano, só na fase M5) |
| Design system | Criado e verificado, ligado no `index.html` — **D1 resolvido na fonte** |
| Dados | 218 membros · 38 eventos · 19 marcos · 266 documentos — todos verificados |

---

## 8. PRÓXIMOS PASSOS (PÓS-PERÍODO)

1. **M2/T2.2** — Header institucional (mega-menu, busca global) e footer; componentes premium (cards, stat tiles, tabs, lightbox, breadcrumbs).
2. **M3/T3.2** — Concluir e **verificar** o directório de despachantes (S3.2.1), galeria com lightbox (S3.2.2) e cronologia interactiva (S3.2.3).
3. **M4** — Construir as 8 páginas-alvo sobre o novo design system (Home, A CDA, Serviços, Notícias, Assembleia Geral, Legislação, Vida associativa, Contactos+Direcção).
4. **M5** — QA completo (build + test_links 0 falhas, auditoria WCAG 2.2 AA, responsivo 360/768/1024/1440, performance/peso/lazy load), **commit + push + build** → publicação do novo portal.
5. **Correcções pendentes de conteúdo** (do relatório master): OCR em lote de ~40 documentos prioritários; recuperar actas 2016–2022; extrair logo/brasão do papel timbrado; reconciliar numeração de AGE.
6. **Segurança:** remover/rodar as credenciais expostas no share `SCAN GERAL` (decisão da direcção).
7. **SYNC-14:** completar o inventário fotográfico (865 ficheiros) e leitura dos comunicados na auditoria.

---

## 9. MÉTRICAS DO PERÍODO

| Métrica | Valor |
|---|---:|
| Dias com trabalho registado | 4 de 6 (01, 03, 05, 06/10) |
| Missões concluídas | 2 (+1 em curso) |
| Tarefas verificadas | 12 (+9 da missão de 01/10) |
| Registos de teste unitário (05–06/10) | 7 |
| Documentos de referência cacheados | 12 |
| Relatórios/entregáveis produzidos | 9 (master, gap de regulamentação, comparação de versões, auditoria, design-systems, 4 datasets, índices ×2…) |
| Issues de sincronização resolvidas | 8 (SYNC-7…13 + antecessoras) |
| Dados pessoais removidos do código público | 6 e-mails + 4 BIs |
| Defeitos auditados | 21 (D1–D21), 4 críticos |
| Documentos que passam de invisíveis a visíveis | +208 (58 → 266 declarados) |
| Regressões introduzidas | 0 (test_links 0 falhas) |

---

## 10. ANEXO — ENTREGÁVEIS DO PERÍODO (CAMINHOS)

| Entregável | Caminho |
|---|---|
| Relatório Master (9 secções + 2 anexos) | `~/Área de Trabalho/Site CDA - Levantamento/CDA_RELATORIO_MASTER_SITE.md` |
| Levantamentos-fonte | `CDA_eventos.md` · `CDA_comunicados.md` · `CDA_institucional.md` · `CDA_membros.csv` (mesma pasta) |
| Lacunas de regulamentação | `/home/cleiton/projetos-software/cda/GAPS-REGULAMENTACAO-2026-10-01.md` |
| Comparação de versões GitHub | `/tmp/opencode/versoes/COMPARACAO-VERSOES.md` (+ `v3-code/`, `cda-digital-v3/`, `cda-digital-v4/`) |
| Índices | `ficheiros-fonte/INDICE-FICHEIROS.md`, `RESUMO-COPIA.md` · `acervo-fotografico/_indice/INDICE-FOTOGRAFIAS.md` |
| Auditoria do site | `/home/cleiton/projetos-software/cda/.opencode/auditoria-site.md` (283 linhas) |
| Design systems | `.opencode/docs/design-systems.md` (332 linhas) + 12 docs cacheados |
| Design system (código) | `site/css/tokens.css` · `sistema.css` · `layout.css` · `site/fonts/manrope-*.woff2` |
| Datasets | `site/data/{membros,eventos,timeline,documentos}.json` + `README.md` |
| Ferramentas | `tools/{build_datasets,build_documentos,verify_datasets,verify_contrast,build_pages}.py` |
| Componentes JS | `site/js/{ui,directorio,cronologia}.js` |
| Registos de verificação | `.opencode/unit-tests/2026-10-05-*.md` e `2026-10-06-*.md` (7 registos) |

---

*Fim do relatório. Datas e contagens conforme registos de trabalho, registos de teste unitário e verificações independentes do Reviewer (06/10).*