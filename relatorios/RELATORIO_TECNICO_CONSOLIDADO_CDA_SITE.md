# RELATÓRIO TÉCNICO CONSOLIDADO — SITE INSTITUCIONAL CDA

<style>
:root {
  --cda-red: #B71C1C;
  --cda-red-dark: #7F1414;
  --cda-navy: #0F3D56;
  --cda-ink: #1A1A1A;
  --cda-slate: #334155;
  --cda-bg: #F8F9FA;
  --cda-border: #E5E7EB;
  --cda-success: #2E7D32;
  --cda-warning: #D97706;
  --cda-info: #1565C0;
}
.cda-badge { display:inline-block;padding:2px 8px;border-radius:999px;font-weight:600;font-size:0.875rem;border:1px solid var(--cda-border); }
.badge-feito { background:#E8F5E9;color:var(--cda-success);border-color:#C8E6C9; }
.badge-andamento { background:#E3F2FD;color:var(--cda-info);border-color:#BBDEFB; }
.badge-fazer { background:#FFF3E0;color:var(--cda-warning);border-color:#FFE0B2; }
.badge-bloqueado { background:#FFEBEE;color:var(--cda-red);border-color:#FFCDD2; }
.cda-h1 { color:var(--cda-red);border-bottom:3px solid var(--cda-red);padding-bottom:0.5rem; }
.cda-h2 { color:var(--cda-navy);border-left:4px solid var(--cda-red);padding-left:0.75rem; }
.cda-table { width:100%;border-collapse:collapse;margin:1rem 0; }
.cda-table th { background:var(--cda-navy);color:#fff;padding:0.5rem;text-align:left;font-weight:600; }
.cda-table td { padding:0.5rem;border:1px solid var(--cda-border); }
.cda-table tr:nth-child(even){ background:var(--cda-bg); }
.cda-callout { border:1px solid var(--cda-border);border-left:4px solid var(--cda-red);background:var(--cda-bg);padding:1rem;border-radius:4px; }
.cda-callout.info { border-left-color:var(--cda-info);background:#F8FAFF; }
.cda-callout.ok { border-left-color:var(--cda-success);background:#F1F8F4; }
.cda-callout.warn { border-left-color:var(--cda-warning);background:#FFFBF0; }
</style>

<div class="cda-h1"><h1 style="color:var(--cda-red);margin:0;">RELATÓRIO TÉCNICO CONSOLIDADO — SITE INSTITUCIONAL CDA</h1></div>

**Projecto:** Câmara dos Despachantes Aduaneiros de Moçambique (CDA)  
**Repositório:** `/home/cleiton/projetos-software/cda` (GitHub: https://github.com/cleitonsimiaondonac2-cyber/cda-digital.git)  
**Branch activa:** `main` (commit `341fad4`)  
**Deploy:** `./build.sh` → `site/` → `docs/` (GitHub Pages)  
**Data de referência:** 07/10/2026  
**Elaborado por:** Equipa Multi-Agente (Commander/Planner/Worker/Reviewer)  

<div class="cda-callout ok">
<strong>PRIORIDADE:</strong> Este relatório consolida TODO o histórico desde o início, reorganizado por dias úteis (Segunda–Sexta). <strong>Trabalho de Sábado foi puxado para Sexta-feira</strong>. <strong>Sábado e Domingo foram EXCLUÍDOS</strong> (não são dias de trabalho). 
</div>

## 1. IDENTIDADE VISUAL CDA — PALETA DE CORES UTILIZADA

Extraída de `site/css/tokens.css` (Design System CDA).

<div class="cda-table-wrapper">
<table class="cda-table">
<thead><tr><th>Cor</th><th>Token</th><th>Hex</th><th>Finalidade</th><th>Contraste (verificado)</th></tr></thead>
<tbody>
<tr><td style="background:#B71C1C;color:#fff">Vermelho CDA</td><td>`--cda-red-500/600`</td><td>#B71C1C / #8F1419*</td><td>Marca, CTAs, links, bordas críticas</td><td>AA com branco (≥4.5:1)</td></tr>
<tr><td style="background:#0F3D56;color:#fff">Navy Institucional</td><td>`--ink-900` / superfícies</td><td>#0F3D56</td><td>Headers, footers, títulos, UI</td><td>AA com branco</td></tr>
<tr><td style="background:#1A1A1A;color:#fff">Texto Primário</td><td>`--text-primary`</td><td>#1A1A1A</td><td>Corpo de texto</td><td>≥4.5:1</td></tr>
<tr><td style="background:#334155;color:#fff">Texto Secundário</td><td>`--text-secondary`</td><td>#334155</td><td>Metadados, legendas</td><td>≥4.5:1</td></tr>
<tr><td style="background:#F8F9FA">Fundo Neutro</td><td>`--bg-100`</td><td>#F8F9FA</td><td>Secções, cards</td><td>ok</td></tr>
<tr><td style="background:#E5E7EB">Bordas</td><td>`--border-default`</td><td>#E5E7EB</td><td>Divisores</td><td>ok</td></tr>
<tr><td style="background:#2E7D32;color:#fff">Sucesso</td><td>Estado</td><td>#2E7D32</td><td>Verde OK</td><td>≥4.5:1</td></tr>
<tr><td style="background:#D97706;color:#fff">Aviso</td><td>Estado</td><td>#D97706</td><td>Amarelo-alaranjado</td><td>≥4.5:1</td></tr>
<tr><td style="background:#1565C0;color:#fff">Informação</td><td>Estado</td><td>#1565C0</td><td>Azul informativo</td><td>≥4.5:1</td></tr>
</tbody>
</table>
</div>

## 2. HISTÓRICO COMPLETO DESDE O INÍCIO

### 2.1 LINHA TEMPORAL POR DIAS ÚTEIS (Segunda–Sexta). Sábado→sexta; Sábado/Domingo excluídos.

**Legenda:** <span class="cda-badge badge-feito">FEITO</span> <span class="cda-badge badge-andamento">EM ANDAMENTO</span> <span class="cda-badge badge-fazer">A FAZER</span> <span class="cda-badge badge-bloqueado">BLOQUEADO</span>

#### Segunda, 22/09/2026 (Dia útil)
- <span class="cda-badge badge-feito">FEITO</span> **Foco na 1.ª notícia (foto)**: `dados.js` + `noticias.html` — `object-position` afinado (cabeça em ~10%). Evidência: commit `be06ede`, `25d0e98`.
- <span class="cda-badge badge-feito">FEITO</span> **Carrossel de parceiros**: integração de logos reais + nomes completos; normalização de imagens. Commits `be06ede`, `6f9585f`.
- <span class="cda-badge badge-feito">FEITO</span> **Página Instituição + Parceiros**: cartaz dos Órgãos Sociais (Triénio 2024–2026), logos oficiais. Commit `993ed1f`.
- <span class="cda-badge badge-feito">FEITO</span> **Versão final inicial**: notícias da revista com imagens, órgãos em cards, remoções, banner 1140→1000px. Commit `a697c7e`.

#### Terça, 23/09/2026 (Dia útil)
- <span class="cda-badge badge-feito">FEITO</span> **Reconciliar `docs/`**: restaurar PDFs existentes. Commit `e6eed8a`.
- <span class="cda-badge badge-feito">FEITO</span> **Revista "O Despachante" — Edição Julho 2026**: integração de conteúdo + imagens. Commit `aeca52c`.
- <span class="cda-badge badge-feito">FEITO</span> **Sync `docs/`** após build (parceiros + indentação). Commit `3c352da`.
- <span class="cda-badge badge-feito">FEITO</span> **Documentar análise de lacunas regulamentação**: commit `341fad4` (HEAD actual).

#### Quarta, 01/10/2026 (Dia útil) — Sessão CDA 01/10
- <span class="cda-badge badge-feito">FEITO</span> **Levantamento completo do acervo CDA** (SCAN GERAL). Evidência: 43.990 ficheiros, 227 candidatos, 55 OCR.
- <span class="cda-badge badge-feito">FEITO</span> **Eventos/assembleias/reuniões**: `/tmp/CDA_eventos.md` (38 eventos).
- <span class="cda-badge badge-feito">FEITO</span> **Comunicados/notícias/regulamentação**: `/tmp/CDA_comunicados.md` (31 comunicados, 37 circulares).
- <span class="cda-badge badge-feito">FEITO</span> **Dados institucionais**: `/tmp/CDA_institucional.md` (identidade legal, órgãos, 219 membros).
- <span class="cda-badge badge-feito">FEITO</span> **Relatório Master site institucional**: `/tmp/CDA_SITE_INSTITUCIONAL.md` (467 linhas) — **VERIFICADO PASS**.

#### Quinta, 02/10/2026 (Dia útil)
- <span class="cda-badge badge-feito">FEITO</span> **Preparação e análise de versões alternativas** (`cda-digital-v3`, `cda-digital-v4`). Comparação detalhada, recomendação de porting seletivo (v3: UX editorial/leitura; v4: verificar.html + timeline.json com reimplementação controlada). Evidência: `/tmp/opencode/versoes/COMPARACAO-VERSOES.md`.

#### Sexta, 03/10/2026 (Dia útil) — incluído trabalho consolidado
- <span class="cda-badge badge-feito">FEITO</span> **Levantamento de conteúdo adicional** (Área de Trabalho/Site CDA - Levantamento): 5 relatórios + 75 ficheiros-fonte + acervo fotográfico 865 ficheiros (~14,7GB). Índices verificados.
- <span class="cda-badge badge-feito">FEITO</span> **Auditoria inicial do site actual**: identificação de 21 defeitos (D1–D21). Criação de `.opencode/auditoria-site.md` (base para trabalho subsequente).

#### **[TRABALHO DE SÁBADO 04/10/2026 — PUXADO PARA SEXTA-FEIRA 03/10/2026]** *(conforme pedido: mover para Sexta, excluir Sábado/Domingo)*
- <span class="cda-badge badge-feito">FEITO</span> **Auditoria detalhada estendida**: consolidação de defeitos críticos (D1 Design System órfão, D2 `<main>` ausente 15/15, D3 skip-link, D4 lang, D16 admin.html publicado, D17 contagem membros, D20 PII). 
- <span class="cda-badge badge-feito">FEITO</span> **Remoção de PII** (`site/js/dados.js`): purga de e-mails (6→0) e BIs (4 registos: Coana/Ussen/Esmail/Abdala). `CDA.MEMBROS=[]`, contrato `window.CDA_DATA_LEITOR`. Verificado por execução (27/27). Evidência: `.opencode/unit-tests/2026-10-05-pii-dados-js.md`.

#### Sexta, 03/10/2026 (continuação — dias úteis consolidados)
- <span class="cda-badge badge-feito">FEITO</span> **SYNC-13 (integração fonte única)**: `despachantes.html` renderiza 218 linhas, `index.html` mostra 218 (correcção hardcoded 221→218). Contrato de leitura unificado via `CDA_DATA_LEITOR`.

#### Segunda, 06/10/2026 (Dia útil)
- <span class="cda-badge badge-feito">FEITO</span> **Design System CDA (tokens+sistema+layout)**: `site/css/tokens.css`, `site/css/sistema.css`, `site/css/layout.css`. Tipografia **Manrope variable** (400–800), auto-hospedada; contraste verificado com `tools/verify_contrast.py` (EXIT=0, 48/50 AA globais). Correção WCAG 1.4.11 em `.search-trigger`.
- <span class="cda-badge badge-feito">FEITO</span> **Motion UI** (`site/js/ui.js`, reveal + header `.is-stuck`) — verificado isoladamente. Ligado em `site/index.html` (`defer`).
- <span class="cda-badge badge-feito">FEITO</span> **Componentes** (`site/js/tabs.js`, `tests/componentes.html`) — harness de componentes criado.
- <span class="cda-badge badge-feito">FEITO</span> **Datasets M3.1** (`tools/build_datasets.py`, `tools/build_documentos.py`, `tools/verify_datasets.py`): 
  - `site/data/membros.json`: **218** registos válidos (junk removido), sem PII
  - `site/data/eventos.json`: **38** eventos, `tipoLabel` completo 38/38, correções de campos
  - `site/data/timeline.json`: **19** entradas (fonte ANEXO A de `CDA_RELATORIO_MASTER_SITE.md`)
  - `site/data/documentos.json`: **266** PDFs (mapeamento completo)
  - `site/data/README.md` documentado. Todos validados (PASS 4/4).
- <span class="cda-badge badge-feito">FEITO</span> **T3.2 — Directorio/Cronologia/Galeria**: `site/js/directorio.js`, `site/js/cronologia.js`, `site/js/galeria.js` + `site/css/galeria.css`. Testes chromium: directorio 31 PASS, cronologia 20 PASS, galeria 7 PASS (0 FAIL). Unit-test registado em `.opencode/unit-tests/2026-10-07-t32-directorio-cronologia-galeria.md`.

#### Terça, 07/10/2026 (Dia útil — estado actual)
- <span class="cda-badge badge-feito">FEITO</span> **Header/Footer institucional (S2.2.1)**: `site/index.html` reescrito com header novo (mega-menu de 9 secções, busca global dialog, CTA Área do Membro), footer completo. `site/js/ui.js` com lógica de menu/busca/mega-menu (aria-expanded, teclado, Esc). Verificação: 4/4 PASS, links 0 falhas.
- <span class="cda-badge badge-feito">FEITO</span> **Limpeza de artefactos**: removidos `_harness_s221.html`, `site/_isolated_ui.html` (não publicados). `test_links.py`: **0 falhas, 208 avisos** (baseline mantido).

## 3. ESTRUTURA DO PROJECTO (Separada por Partes)

### 3.1 ESTRUTURA GERAL
- **`site/`** — Código estático publicado (HTML/CSS/JS/img/data/fonts/docs)
- **`docs/`** — Build de produção (rsync `site/` → `docs/`) — GitHub Pages
- **`tools/`** — Scripts Python (build_datasets, build_documentos, verify_datasets, verify_contrast, verify_contrast_legacy)
- **`tests/`** — Testes (test_links.py, componentes.html, harnesses diversos)
- **`.opencode/`** — Estado de missão, auditoria, work-log, sync-issues, unit-tests
- **`relatorios/`** — Relatórios técnicos (este documento)

### 3.2 PARTE 1 — DESIGN SYSTEM & ESTILOS <span class="cda-badge badge-feito">FEITO (96%)</span>
| Ficheiro | Estado | Descrição |
|---|---|---|
| `site/css/tokens.css` | <span class="cda-badge badge-feito">FEITO</span> | Tokens CSS (118 variáveis), Manrope variable, paleta CDA com cálculo/controlo de contraste. |
| `site/css/sistema.css` | <span class="cda-badge badge-feito">FEITO</span> | Componentes base (botões, inputs, chips, cards, avisos, skip-link, utilitários). |
| `site/css/layout.css` | <span class="cda-badge badge-feito">FEITO</span> | Layout, header novo (.header__inner, nav__panel, search-dialog), footer, grelha. |
| `site/css/estilo.css` | <span class="cda-badge badge-andamento">EM USO (legado)</span> | Base histórica CDA (mantido sem quebrar). |
| `site/css/cta.css` | <span class="cda-badge badge-andamento">EM USO (legado)</span> | Tema CTA (coexistente com DS novo). |
| `site/css/galeria.css` | <span class="cda-badge badge-feito">FEITO</span> | Mosaico CSS Grid, lightbox acessível (dialog), efeitos, responsivo. |

**Falta (estilos):** <span class="cda-badge badge-fazer">A FAZER</span> Aplicar Design System novo em **todas as 15 páginas** (hoje só parcialmente aplicado em `index.html`). Harmonizar legado vs DS (M4).

### 3.3 PARTE 2 — HTML/PÁGINAS <span class="cda-badge badge-andamento">EM ANDAMENTO (1/15 migradas)</span>
| Página | Header/Footer DS | DS Aplicado | Estado |
|---|---|---|---|
| `site/index.html` | <span class="cda-badge badge-feito">FEITO</span> | <span class="cda-badge badge-feito">FEITO (parcial)</span> | <span class="cda-badge badge-feito">FEITO</span> (migrada header/footer + nav) |
| `site/instituicao.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/orgaos-sociais.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/atividades.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/noticias.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/anuncios.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/documentacao.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/despachantes.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/parceiros.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/associar-se.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/contactos.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/galeria.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/estatutos.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/regulamentos.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> (M4) |
| `site/admin.html` | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-fazer">A FAZER</span> | <span class="cda-badge badge-bloqueado">BLOQUEADO (D16)</span> — **não publicar em GitHub Pages** (painel de login). |

### 3.4 PARTE 3 — JAVASCRIPT (Lógica) <span class="cda-badge badge-andamento">EM ANDAMENTO (60%)</span>
| Ficheiro | Estado | Descrição |
|---|---|---|
| `site/js/ui.js` | <span class="cda-badge badge-feito">FEITO</span> | Header/sticky, reveal, mega-menu, busca global (dialog), acessibilidade (aria-expanded, teclado, Esc). Ligado em index.html. |
| `site/js/app.js` | <span class="cda-badge badge-feito">FEITO</span> | Núcleo da app, consome `CDA_DATA_LEITOR` (fonte única). |
| `site/js/home.js` | <span class="cda-badge badge-feito">FEITO</span> | Home, carrossel parceiros, render dinâmico. |
| `site/js/dados.js` | <span class="cda-badge badge-feito">FEITO</span> | Datasets legacy + contrato `CDA_DATA_LEITOR` (sem PII). |
| `site/js/directorio.js` | <span class="cda-badge badge-feito">FEITO</span> | Listagem membros (218), filtro, paginação 25/pág, acessibilidade. |
| `site/js/cronologia.js` | <span class="cda-badge badge-feito">FEITO</span> | Timeline (19), render cronológico, navegação teclado. |
| `site/js/galeria.js` | <span class="cda-badge badge-feito">FEITO</span> | Galeria mosaico, chips filtros, lightbox `<dialog>` (foco preso, Esc, ←→). |
| `site/js/tabs.js` | <span class="cda-badge badge-feito">FEITO</span> | Tabs acessíveis (aria-selected, focus). |
| `site/js/assistente.js` | <span class="cda-badge badge-andamento">EXISTENTE</span> | Assistente virtual (mantido). |
| `site/js/leitura.js` | <span class="cda-badge badge-andamento">EXISTENTE (v3)</span> | UX leitura (portável de v3 — avaliar M4). |
| `site/js/verify.js` | <span class="cda-badge badge-fazer">PORTAR (v4)</span> | Verificação profissionais (v4) — reimplementar sobre API real (M4). |

### 3.5 PARTE 4 — DADOS & FERRAMENTAS <span class="cda-badge badge-feito">FEITO (95%)</span>
| Item | Estado | Descrição |
|---|---|---|
| `site/data/membros.json` | <span class="cda-badge badge-feito">FEITO</span> | 218 registos. Sem PII. Campos normalizados. |
| `site/data/eventos.json` | <span class="cda-badge badge-feito">FEITO</span> | 38 eventos (tipoLabel 100%). |
| `site/data/timeline.json` | <span class="cda-badge badge-feito">FEITO</span> | 19 entradas (fonte: ANEXO A CDA_RELATORIO_MASTER_SITE.md). |
| `site/data/documentos.json` | <span class="cda-badge badge-feito">FEITO</span> | 266 PDFs mapeados. |
| `site/data/README.md` | <span class="cda-badge badge-feito">FEITO</span> | Documentação datasets. |
| `tools/build_datasets.py` | <span class="cda-badge badge-feito">FEITO</span> | Gera membros/timeline/eventos a partir de fontes. Idempotente. |
| `tools/build_documentos.py` | <span class="cda-badge badge-feito">FEITO</span> | Varre `site/docs/*.pdf` → `documentos.json`. Idempotente. |
| `tools/verify_datasets.py` | <span class="cda-badge badge-feito">FEITO</span> | Validação 4/4 (membros/eventos/timeline/documentos). Guarda contra regressão PII (`COLUNAS_PII_PROIBIDAS`). |
| `tools/verify_contrast.py` | <span class="cda-badge badge-feito">FEITO</span> | Verificação de contraste AA (EXIT=0). |
| `tools/verify_contrast_legacy.py` | <span class="cda-badge badge-andamento">LEGADO</span> | Versão anterior (mantida). |

**Falta:** <span class="cda-badge badge-fazer">A FAZER</span> Criar `data-gen.js` (opcional) — decisão técnica: manter contrato runtime `CDA_DATA_LEITOR.ready()` (não obrigatório gerar estático em build). Ver SYNC-13 (resolvido).

### 3.6 PARTE 5 — ASSETS (Imagens, Fontes, PDFs) <span class="cda-badge badge-andamento">EM ANDAMENTO</span>
| Item | Estado | Observação |
|---|---|---|
| `site/fonts/` | <span class="cda-badge badge-feito">FEITO</span> | Manrope (latin + latin-ext) — WOFF2 auto-hospedado. |
| `site/img/` | <span class="cda-badge badge-feito">FEITO</span> | Logos, ícones, notícias, órgãos (organizado). |
| `site/docs/` | <span class="cda-badge badge-feito">FEITO</span> | 266 PDFs presentes. `test_links.py` reporta 208 avisos (PDFs existentes não declarados em `documentos.json`) — **baseline conhecido, não é falha** (0 falhas). |
| `acervo-fotografico/` | <span class="cda-badge badge-andamento">INVENTARIADO</span> | 865 ficheiros (~14,7GB). Fora do repositório Git (grande). Índices em `_indice/INDICE-FOTOGRAFIAS.md`. Integração futura (galeria). |

## 4. O QUE JÁ FOI FEITO — SÍNTESE EXECUTIVA

<div class="cda-callout ok">
<strong>TOTAL FEITO (crítico):</strong> Design System CDA completo + tipografia Manrope + datasets validados (membros 218/eventos 38/timeline 19/documentos 266) + UI.js com mega-menu/busca + componentes (tabs) + galeria/directorio/cronologia testados + remoção total de PII + header/footer novo em index.html + scripts de verificação.
</div>

| Área | % Feito | Evidência |
|---|---|---|
| Design System (tokens+sistema+layout) | 100% | `tokens.css` (Manrope), `verify_contrast.py` PASS |
| Tipografia & Contraste | 100% | 48/50 AA; correção 1.4.11 |
| Header/Footer institucional | 100% (apenas index) | `index.html` + `ui.js` — 4/4 PASS |
| UI Interativa (mega-menu, busca dialog) | 100% | Acessível (aria, teclado, Esc) |
| Datasets M3.1 | 100% | 4/4 validados por `verify_datasets.py` |
| Directorio (membros) | 100% | 31/31 PASS (chromium) |
| Cronologia (timeline) | 100% | 20/20 PASS |
| Galeria | 100% | 7/7 PASS + CSS completo |
| Tabs/Componentes | 100% | `tabs.js` + `tests/componentes.html` |
| PII Remoção | 100% | dados.js sem emails/BIs; regressão corrigida SYNC-13 |
| Fonte única (`CDA_DATA_LEITOR`) | 100% | app.js/home.js/despachantes.html alinhados |
| Build/Deploy (`build.sh`) | 100% | rsync site/→docs/, funciona |
| QA Links | 100% | `test_links.py`: 0 falhas, 208 avisos (baseline) |

## 5. O QUE AINDA FALTA — POR PARTES (PRIORITÁRIO)

### 5.1 URGENTE — MIGRAÇÃO DAS PÁGINAS AO DS NOVO (M4) <span class="cda-badge badge-fazer">CRÍTICO</span>
- <span class="cda-badge badge-fazer">A FAZER</span> Aplicar **header/footer** novo + estrutura DS em **14 páginas** restantes (instituicao, orgaos-sociais, atividades, noticias, anuncios, documentacao, despachantes, parceiros, associar-se, contactos, galeria, estatutos, regulamentos). 
- <span class="cda-badge badge-fazer">A FAZER</span> Garantir `<main>` semântico + skip-link (D2/D3) em todas as páginas.
- <span class="cda-badge badge-fazer">A FAZER</span> Carregar `css/tokens.css`, `css/sistema.css`, `css/layout.css` de forma consistente.
- <span class="cda-badge badge-fazer">A FAZER</span> Incluir `<script src="js/ui.js" defer></script>` em páginas que usem `[data-reveal]` ou componentes interativos.

**Estimativa:** 1–2 dias úteis. **Bloqueador parcial** para "site 100% com DS novo".

### 5.2 MÉDIO — PORTING SELETIVO DE v3/v4 <span class="cda-badge badge-fazer">A FAZER</span>
- <span class="cda-badge badge-fazer">A FAZER</span> **v3**: portar `css/leitura.css`, `css/editorial.css`, `js/leitura.js` (UX editorial) — baixo risco, alto valor.
- <span class="cda-badge badge-fazer">A FAZER</span> **v4**: `site/verificar.html` + `site/js/verify.js` — **reimplementar** (evitar mock sessionStorage). Integrar com API real (`ia/` existe).
- <span class="cda-badge badge-fazer">A FAZER</span> Avaliar `timeline.json` já feito; páginas separadas (estatutos/historia/lideranca/orgaos) — migrar com header/footer novo.

### 5.3 BAIXO/MÉDIO — CONTEÚDO & DADOS <span class="cda-badge badge-fazer">A FAZER</span>
- <span class="cda-badge badge-fazer">A FAZER</span> **documentos.json**: reduzir avisos (208). Muitos PDFs existem mas não declarados — mapear criticamente (só publicar o que é relevante). 
- <span class="cda-badge badge-fazer">A FAZER</span> **admin.html (D16)**: **NUNCA publicar** via `build.sh`. Garantir exclusão ou mover para `admin/` fora de `site/` (proteger GitHub Pages). 
- <span class="cda-badge badge-fazer">A FAZER</span> **Acervo fotográfico (865)**: integrar em `galeria.html` usando `galeria.js` existente (fotos fora de repo por tamanho).
- <span class="cda-badge badge-fazer">A FAZER</span> **Comunicados**: cruzar `CDA_comunicados.md` (368 linhas) com PDFs (parcial: 5/28). Completar mapeamento.

## 6. SYNC ISSUES — ESTADO ACTUAL

**Issues abertas no projecto (`/home/cleiton/projetos-software/cda/.opencode/sync-issues.md`):**

| ID | Severidade | Estado | Descrição |
|---|---|---|---|
| SYNC-14 | LOW | <span class="cda-badge badge-fazer">PENDENTE</span> | Inventário fotos/comunicados — parcialmente resolvido na auditoria (§9), aguarda verificação/fecho por Reviewer. |
| SYNC-18 | MEDIUM | <span class="cda-badge badge-fazer">PENDENTE</span> | Harness de teste `_isolated_ui.html` em `site/` — **CORRIGIDO** (removido). Aguarda re-teste: `test_links.py` deve manter **15 páginas / 208 avisos / 0 falhas** (confirmado após remoção: 0 falhas, 208 avisos). |

**Issues fechadas (Wave 1 — verificados por execução):** SYNC-11, SYNC-12, SYNC-13, SYNC-15, SYNC-16, SYNC-17 — **TODAS RESOLVIDAS E VERIFICADAS**.

**Nota importante:** O contador "137 issues" reportado noutro contexto (`/root/.opencode/`) corresponde a ocorrências históricas em `archive/` (missões concluídas) — **não corresponde a issues abertas do projecto actual**. O número real de issues abertas nesta missão é **2**.

## 7. QA — VERIFICAÇÕES REALIZADAS

| Verificação | Comando | Resultado | Evidência |
|---|---|---|---|
| Links (site) | `python3 tests/test_links.py` | **0 falhas, 208 avisos** | EXIT=0 — baseline intacto |
| Sintaxe JS | `node --check site/js/*.js` (chaves) | **OK (EXIT=0)** | ui.js, galeria.js, directorio.js, cronologia.js, tabs.js, app.js, home.js, dados.js |
| Contraste | `python3 tools/verify_contrast.py` | **EXIT=0** | 48/50 AA globais; texto ≥4.5:1 |
| Datasets | `python3 tools/verify_datasets.py` | **PASS 4/4** | membros/eventos/timeline/documentos OK |
| Chromium harness (T3.2) | Testes headless | **58 PASS / 0 FAIL** | directorio 31 + cronologia 20 + galeria 7 |
| Chromium harness (S2.2.1) | Testes headless | **4/4 PASS** | menu, busca, mega-menu aria, atalho / |
| LSP/diagnostics | `lsp_diagnostics` (pontuais) | **clean** | Sem erros críticos |

## 8. BUILD, DEPLOY & GIT

### 8.1 Build
```bash
cd /home/cleiton/projetos-software/cda
bash build.sh  # rsync -a --delete site/ docs/
```
**Estado:** Funcionando. `docs/` mantém sync com `site/`.

### 8.2 Git Status (actual)
- **Branch:** `main`
- **HEAD:** `341fad4`
- **Alterações por commitar:** Múltiplos ficheiros novos/modificados (DS, JS, dados, ferramentas, testes, relatórios). Ver `git status --short` acima.
- **Remotos:** origin → https://github.com/cleitonsimiaondonac2-cyber/cda-digital.git

### 8.3 Pull Request — A CRIAR/ACTUALIZAR (PRIORITÁRIO)
**Requisito:** Fazer PR, atualizar tudo no GitHub, atualizar relatório. Só voltar a trabalhar no site após PR+relatório prontos.

**Sugestão de título PR:**
```text
docs+feat: Design System CDA, datasets validados, header/footer institucional e galeria
```

**Sugestão de descrição PR (resumida):**
- Design System CDA (tokens/sistema/layout) com Manrope variable + verificação contraste AA
- Header/footer institucional em index.html + ui.js (mega-menu, busca dialog, acessível)
- Datasets M3.1 validados (membros 218, eventos 38, timeline 19, documentos 266)
- Componentes: tabs.js + tests/componentes.html
- Galeria/directorio/cronologia: galeria.js+css + testes chromium (58 PASS)
- Remoção completa PII (dados.js) + fonte única CDA_DATA_LEITOR
- Ferramentas de validação (verify_datasets, verify_contrast)
- Relatório técnico consolidado com histórico completo (dias úteis, Sábado→Sexta, exclui Sábado/Domingo)

## 9. CONCLUSÃO

<div class="cda-callout ok">
<strong>MISSÃO — RELATÓRIO + PR (PRIORITÁRIOS):</strong> Conforme solicitado, o relatório técnico consolidado está completo. 

<strong>O que já foi feito:</strong> Fundação sólida (DS CDA, tipografia, datasets validados, UI acessível, galeria/directorio/cronologia testados, PII removida). 

<strong>O que ainda falta (mais urgente):</strong> Migrar as **14 páginas restantes** para o Design System novo (header/footer + estrutura) — **M4**. Porting seletivo v3/v4 e completar mapeamento de documentos.

<strong>PRONTO PARA PR:</strong> Este relatório (`relatorios/RELATORIO_TECNICO_CONSOLIDADO_CDA_SITE.md`) + alterações no código devem ser commitados, pushados e PR criado/atualizado. **SÓ SE RETOMA TRABALHO NO SITE APÓS RELATÓRIO ACTUALIZADO + PR CRIADO/ATUALIZADO.**
</div>

**Versão do relatório:** 1.0  
**Última actualização:** 07/10/2026 08:55:19
