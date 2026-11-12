# Fase 0 — Matriz de Migração

> **Estado:** entrega para revisão. Este documento não altera o sistema em produção.
> **Referência estável:** `main` em `a102920` — “Ativar área de membro, painel admin e chat IA”.
> **Branch de trabalho:** `refatoracao/laravel-13` (criada a partir de `a102920`).
> **Data da auditoria:** 12 de Novembro de 2026.
> **Repositório:** `git@github.com:cleitonsimiaondonac2-cyber/cda-digital.git`.

## 1. Objetivo

Inventariar o que existe no CDA Digital 2.0 antes de iniciar a migração para Laravel 13,
para que a nova plataforma preserve funcionalidades, conteúdos e dados, e para que a
reconstrução seja feita com critérios de aceitação verificáveis.

Esta matriz responde a quatro perguntas por cada elemento do sistema:

1. O que existe hoje?
2. Onde está implementado?
3. Em que estado se encontra?
4. O que deve acontecer na nova plataforma e como validar?

## 2. Baseline verificado

| Item | Resultado |
|---|---|
| Commit de referência | `a102920` |
| Páginas HTML | 23 |
| Ficheiros JavaScript | 18 |
| Ficheiros CSS | 7 |
| PDFs no acervo | 266 (≈236 MB) |
| Datasets em `site/data` | 7 JSON |
| Testes | 5 ficheiros; suíte completa **OK** |
| Validação de datasets | **PASS** (4/4) |
| Membros no directório público | 218 |
| Documentos curados em `dados.js` | 58 |
| Notícias | 18 |
| Actividades | 8 |
| Órgãos | 15 |
| Eventos | 38 |
| Cronologia | 19 entradas |
| Presidentes | 3 |
| Texto extraído dos PDFs | 34 de 266 |
| Chunks no índice BM25 | 1031 |
| PHP / Composer / PostgreSQL | PHP 8.3.6; Composer 2.7.1; PostgreSQL 16.15 activo |
| Docker | não instalado |

Comandos de verificação executados:

```bash
cd ~/cda-digital
bash tests/run_tests.sh          # suíte completa: OK
python3 tools/verify_datasets.py # PASS (4/4)
git rev-parse --short HEAD       # a102920
```

> Nota operacional: `tests/run_tests.sh` não tem bit de execução; deve ser invocado
> com `bash tests/run_tests.sh` ou o bit deve ser corrigido numa alteração própria.

## 3. Legenda

### 3.1 Estado actual

| Código | Significado |
|---|---|
| **Funcional** | Fluxo completo em uso, com dados reais ou conteúdo publicado. |
| **Funcional com limitação** | Funciona, mas tem lacuna conhecida que a nova plataforma deve resolver. |
| **Parcial** | Só parte do fluxo existe; falta backend, persistência ou regra de negócio. |
| **Demonstração** | Protótipo client-side; não deve ser tratado como funcionalidade de produção. |
| **Estático** | Conteúdo escrito directamente no HTML, sem CMS. |
| **Em falta** | Não existe e é necessário para a plataforma. |

### 3.2 Acção de migração

| Código | Significado |
|---|---|
| **Reutilizar** | Conteúdo, dados ou activo importado com alterações mínimas. |
| **Adaptar** | Lógica ou interface aproveitável, mas com alterações relevantes. |
| **Reconstruir** | Nova implementação em Laravel, preservando o comportamento e os dados. |
| **Substituir** | Mecanismo actual trocado por outro mais adequado. |
| **Arquivar** | Não entra em produção; fica como fixture, histórico ou demo. |

### 3.3 Módulos de destino

`Website` · `CMS` · `Membros` · `Quotas` · `Requerimentos` · `Documentos` ·
`Comunicação` · `Utilizadores` · `IA` · `Plataforma`

## 4. Inventário de páginas

As 23 páginas públicas e administrativas estão listadas abaixo. As páginas
institucionais partilham o mesmo layout, mas os seus conteúdos e fontes de dados
são diferentes e devem ser migrados individualmente.

| ID | Página | Função actual | Fonte de dados | Estado | Destino | Acção |
|---|---|---|---|---|---|---|
| PUB-01 | `index.html` | Home: destaque, notícias, actividades, publicações, documentos e serviços | `dados.js`, `documentos.json`, `home.js` | Funcional | Website + CMS | Reconstruir |
| PUB-02 | `instituicao.html` | Quem somos, missão/visão/valores, órgãos nominais e delegações | HTML estático | Estático | CMS/Páginas | Reutilizar |
| PUB-03 | `historia.html` | Narrativa histórica + cronologia 1960–2026 | HTML + `timeline.json` + `cronologia.js` | Funcional | CMS/Páginas + Linha temporal | Adaptar |
| PUB-04 | `lideranca.html` | Presidentes e mandato 2024–2026 | HTML + `presidentes.json` | Funcional | CMS/Equipa | Adaptar |
| PUB-05 | `presidente-single.html` | Perfil individual por `?id=` | `presidentes.json` + `presidente.js` | Funcional | Website (rota dinâmica) | Reconstruir |
| PUB-06 | `orgaos.html` | Competências dos órgãos sociais | HTML estático | Estático | CMS/Páginas | Reutilizar |
| PUB-07 | `estatutos.html` | Estatutos, regulamento interno e código de ética | HTML + PDFs | Funcional | CMS/Páginas + Documentos | Reutilizar |
| PUB-08 | `noticias.html` | Lista de 18 notícias; texto integral em cards, sem detalhe nem paginação | `dados.js` + script inline | Funcional com limitação | CMS/Notícias | Reconstruir |
| PUB-09 | `anuncios.html` | Comunicados, circulares e convocatórias em lista estática | HTML estático | Estático | CMS/Notícias ou Documentos | Adaptar |
| PUB-10 | `actividades.html` | Arquivo de 8 actividades, destaque, detalhe e galeria | `dados.js` + `actividades.js` | Funcional | CMS/Actividades | Adaptar |
| PUB-11 | `publicacoes.html` | Selecção editorial de publicações | HTML estático | Estático | CMS/Páginas + Documentos | Reutilizar |
| PUB-12 | `revista.html` | Edição Julho 2026, índice e PDFs por secção | HTML estático | Estático | CMS/Publicações | Reutilizar |
| PUB-13 | `galeria.html` | Galeria filtrada por evento, com lightbox | `dados.js` (capas) + `galeria.js` | Funcional | CMS/Media | Adaptar |
| PUB-14 | `documentacao.html` | Centro Documental: 266 PDFs, filtros, paginação e URL partilhável | `documentos.json` + `centro-documental.js` | Funcional | Documentos | Reconstruir |
| PUB-15 | `despachantes.html` | Como ser membro + directório de 218 membros com filtros | `membros.json` + `directorio.js` | Funcional | Membros/Website | Adaptar |
| PUB-16 | `verificar.html` | Verificação por nome/carteira contra a lista pública | `membros.json` + `verificar.js` | Parcial | CDA Verify | Reconstruir |
| PUB-17 | `area-membro.html` | Registo, login, painel, quotas e requerimentos | `membro.js` + APIs | Funcional com limitação | Membros/Quotas/Requerimentos | Reconstruir |
| PUB-18 | `admin.html` | Dashboard e CRUD de documentos, notícias, actividades, mensagens, membros, quotas, requerimentos e publicação | `admin.js` + APIs | Funcional com limitação | Filament/Admin | Reconstruir |
| PUB-19 | `contactos.html` | Contactos institucionais e formulário | HTML + `app.js` + `/api/contacto` | Funcional | Comunicação | Adaptar |
| PUB-20 | `pergunte.html` | FAQ e formulário de contacto | HTML + `pergunte.js` (localStorage) | Demonstração | CMS/FAQ + Comunicação | Reconstruir |
| PUB-21 | `denunciar.html` | Denúncia de fraude | `denunciar.js` (localStorage) | Demonstração | Comunicação/Denúncias | Reconstruir¹ |
| PUB-22 | `servicos.html` | Serviços da CDA | HTML estático | Estático | CMS/Páginas | Reutilizar |
| PUB-23 | `parceiros.html` | Parceiros e links relevantes | HTML estático | Estático | CMS/Páginas | Reutilizar |

¹ A denúncia de fraude exige requisitos próprios (confidencialidade, retenção,
responsável, canal de acompanhamento). Não deve ser migrada como simples formulário
sem decisão da CDA.

### 4.1 Observações sobre páginas

- **Notícias:** não existe rota de detalhe. O texto completo é injectado nos cards
  de `noticias.html`; a home liga para `noticias.html#noticia-N`. A nova plataforma
  deve ter `slug`, página de detalhe, paginação e metadados SEO.
- **Centro Documental:** a lista pública vem de `documentos.json` (266 registos).
  O CMS actual só gere os 58 documentos de `dados.js`. Um upload novo pode não
  aparecer na lista pública — ver `DIV-01`.
- **Directório:** `membros.json` contém apenas campos públicos (nome, carteira,
  empresa, situação, província, delegação, activo). O teste de datasets confirma
  ausência de e-mail, telefone e outros PII.
- **Verificação:** `verificar.js` compara com a lista pública e não constitui
  prova de titularidade. A nova funcionalidade deve ter rate-limit, auditoria e
  uma política clara sobre que dados são devolvidos.
- **Galeria:** as imagens vêm das capas das actividades em `dados.js`; não há
  biblioteca de media nem upload de galeria no admin.
- **Órgãos:** `dados.js` contém 15 registos `ORGAOS`, mas nenhum JS os consome;
  a página `instituicao.html` tem a composição nominal em HTML estático. Importar
  os 15 registos para o CMS e confirmar a fonte canónica.
- **Eventos/despachantes:** `eventos.json` (38) e `despachantes.json` (10) não são
  usados pelo runtime; `despachantes.json` é demonstração. Não misturar com dados
  reais — ver `DIV-13`.

## 5. Matriz funcional

Esta matriz cobre as funções transversais e os fluxos que não se esgotam numa
página. Cada linha tem de ser validada na fase correspondente.

| ID | Funcionalidade | Localização actual | Estado | Destino | Acção | Critério de validação |
|---|---|---|---|---|---|---|
| FUN-01 | Layout, navegação, rodapé, menus e SEO base | 23 páginas; `app.js`, `ui.js` | Funcional com duplicação | Website + CMS | Reconstruir | Um único layout Blade; todas as rotas 200; menu e rodapé consistentes; skip-link e navegação por teclado |
| FUN-02 | Home editorial | `home.js`; `dados.js` | Funcional | CMS + Website | Reconstruir | Destaques configuráveis no CMS; fallback quando não há conteúdo; sem HTML duplicado |
| FUN-03 | CMS de páginas e menus | Não existe | Em falta | CMS/Páginas | Reconstruir | Criar, editar, publicar e despublicar páginas; ordenar menus; pré-visualizar rascunhos |
| FUN-04 | CRUD de notícias | `ia/admin.py`; `admin.js` | Funcional com limitação | CMS/Notícias | Reconstruir | Rascunho/publicado; slug único; imagem de capa; categoria; data; autor; SEO |
| FUN-05 | Listagem e detalhe de notícias | `noticias.html`; script inline | Funcional com limitação | Website + CMS | Reconstruir | 18 notícias migradas; detalhe por slug; paginação; arquivo por ano/categoria |
| FUN-06 | CRUD e publicação de actividades | `ia/admin.py`; `actividades.js` | Funcional | CMS/Actividades | Adaptar | 8 actividades migradas; detalhe, capas, documentos e notícia associada |
| FUN-07 | Biblioteca de media | Não existe | Em falta | CMS/Media | Reconstruir | Upload de imagens/PDFs; alt text; dimensões; deduplicação; quota e armazenamento |
| FUN-08 | CRUD de metadados documentais | `ia/admin.py`; `admin.js` | Funcional | Documentos | Reconstruir | 266 + novos documentos; tipo, ano, emissor, categoria, estado, visibilidade |
| FUN-09 | Upload de PDF, validação e OCR | `POST /api/admin/documentos/upload`; `ia/ocr.py` | Funcional com limitação | Documentos + IA | Adaptar | Validar extensão, MIME e magic bytes; limite; antivírus/quarentena; checksum; job de OCR |
| FUN-10 | Centro Documental público | `documentacao.html`; `centro-documental.js` | Funcional | Documentos | Reconstruir | Paridade de 266 documentos; filtros; pesquisa; paginação; URL estável; acesso por nível |
| FUN-11 | Pipeline de publicação | `ia/publicar.py`; `build.sh` | Funcional com limitação | Plataforma + CMS | Substituir | Publicar conteúdo sem regenerar JS à mão; invalidar cache; reindexar; rollback |
| FUN-12 | Registo, login, logout e sessão | `ia/auth.py`; `ia/admin.py`; `membro.js` | Funcional com limitação | Utilizadores | Reconstruir | Laravel auth; verificação de e-mail; recuperação de senha; rate-limit; revogação de sessão; CSRF |
| FUN-13 | Aprovação de membros | Endpoints `/api/admin/membros/*` | Funcional | Membros | Adaptar | Estados pendente/aprovado/rejeitado/suspenso; motivo; auditoria; notificação |
| FUN-14 | Perfil e painel do membro | `membro.js`; `/api/membro/resumo` | Funcional com limitação | Membros | Reconstruir | Dados do membro, quotas, requerimentos, documentos e privacidade num único painel |
| FUN-15 | Directório público de membros | `membros.json`; `directorio.js` | Funcional | Membros/Website | Adaptar | 218 registos; filtros; privacidade; nenhum campo sensível exposto |
| FUN-16 | CDA Verify | `verificar.js`; `membros.json` | Parcial | Membros/CDA Verify | Reconstruir | Pesquisa por nome/carteira; resultado claro; rate-limit; auditoria; sem enumeração abusiva |
| FUN-17 | Quotas | `ia/db.py` (`Quota`); `/api/admin/quotas/*` | Funcional com limitação | Quotas | Reconstruir | Geração anual; estados; pagamentos; recibos; histórico; notificações |
| FUN-18 | Requerimentos | `ia/db.py` (`Requerimento`); endpoints | Funcional com limitação | Requerimentos | Reconstruir | Tipos; anexos; estados; resposta; histórico; prazo; notificações |
| FUN-19 | Mensagens de contacto | `ContactoMsg`; `/api/contacto` | Funcional com limitação | Comunicação | Adaptar | Anti-spam; consentimento; atribuição; estado lida/resolvida; retenção |
| FUN-20 | Denúncias de fraude | `denunciar.js` | Demonstração | Comunicação/Denúncias | Reconstruir¹ | Canal confidencial; referência; triagem; confidencialidade; retenção legal |
| FUN-21 | FAQ | `pergunte.html`; `pergunte.js` | Demonstração | CMS/FAQ | Reconstruir | Categorias e perguntas no CMS; pesquisa; fallback para contacto |
| FUN-22 | Pesquisa global | `ui.js` (só títulos de documentos) | Parcial | Website/Plataforma | Reconstruir | Pesquisar páginas, notícias, documentos e FAQ; relevância; excluir conteúdo privado |
| FUN-23 | Assistente CDA | `assistente.js`; `ia/api.py` | Funcional com limitação | IA | Adaptar | Chave só no servidor; pedidos assinados; fontes; fallback; rate-limit; latência |
| FUN-24 | Notificações | Não existe | Em falta | Comunicação | Reconstruir | In-app/e-mail; templates; opt-in; registo de entregas |
| FUN-25 | Utilizadores, papéis e permissões | `Membro.is_admin` (booleano) | Funcional com limitação | Utilizadores | Reconstruir | Papéis granulares; menor privilégio; testes de autorização; superadmin |
| FUN-26 | Auditoria | Não existe | Em falta | Plataforma | Reconstruir | Registar login, CRUD, aprovações, downloads e exportações; imutável; retenção |
| FUN-27 | Backups, logs e monitorização | Não existe | Em falta | Plataforma | Reconstruir | Backup diário de BD e ficheiros; restauro testado; alertas; retenção |
| FUN-28 | Design system e acessibilidade | 7 CSS; `ui.js` | Funcional | Website | Adaptar | WCAG 2.2 AA; contraste; teclado; foco; responsividade; testes de regressão |
| FUN-29 | SEO, sitemap e redireccionamentos | Parcial | Funcional com limitação | Website | Adaptar | Metadados; canonical; sitemap; 301 das URLs antigas; dados estruturados |
| FUN-30 | Importação e validação de dados | Não existe | Em falta | Plataforma | Reconstruir | Contagens, checksums, idempotência, relatório de erros e rollback |

## 6. Inventário de APIs

Total actual: **42 rotas** — 6 no serviço de IA e 36 no backend de membros/admin
(`ia/admin.py`, incluindo autenticação, membro e contacto).

> Por legibilidade, os parâmetros de rota são apresentados como `{id}`. Os nomes
> reais são `{doc_id}`, `{noticia_id}`, `{act_id}`, `{msg_id}`, `{membro_id}`,
> `{quota_id}` e `{req_id}`.

### 6.1 APIs de autenticação, membro e contacto

| Grupo | Rotas | Autenticação actual | Estado | Destino |
|---|---|---|---|---|
| Auth/sessão | `POST /api/auth/registar`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/status` | Cookie `cda_sessao` assinado com HMAC; `status` público | Funcional com limitação | Laravel Auth + sessão/API tokens |
| Membro | `GET /api/membro/resumo`, `POST /api/membro/requerimentos` | Membro autenticado | Funcional | Membros/Quotas/Requerimentos |
| Contacto | `POST /api/contacto` | Público | Funcional com limitação | Comunicação |

### 6.2 APIs administrativas

| Grupo | Rotas | Autenticação actual | Estado | Destino |
|---|---|---|---|---|
| Documentos | `GET /api/admin/documentos`, `GET /api/admin/documentos/{id}`, `POST /api/admin/documentos`, `PUT /api/admin/documentos/{id}`, `DELETE /api/admin/documentos/{id}`, `POST /api/admin/documentos/upload` | `is_admin` | Funcional com limitação | Documentos (Filament) |
| Notícias | `GET/POST /api/admin/noticias`, `GET/PUT/DELETE /api/admin/noticias/{id}` | `is_admin` | Funcional | CMS/Notícias |
| Actividades | `GET/POST /api/admin/actividades`, `GET/PUT/DELETE /api/admin/actividades/{id}` | `is_admin` | Funcional | CMS/Actividades |
| Mensagens | `GET /api/admin/mensagens`, `POST /api/admin/mensagens/{id}/ler`, `DELETE /api/admin/mensagens/{id}` | `is_admin` | Funcional | Comunicação |
| Membros | `GET /api/admin/membros`, `GET /api/admin/membros/{id}`, `POST /api/admin/membros/{id}/aprovar`, `POST /api/admin/membros/{id}/rejeitar`, `POST /api/admin/membros/{id}/toggle` | `is_admin` | Funcional com limitação | Membros |
| Quotas | `POST /api/admin/quotas/{id}/pagar` | `is_admin` | Funcional com limitação | Quotas |
| Requerimentos | `POST /api/admin/requerimentos/{id}/estado` | `is_admin` | Funcional com limitação | Requerimentos |
| Publicação/galeria | `POST /api/admin/publicar`, `GET /api/admin/galeria` | `is_admin` | Funcional com limitação | Plataforma/CMS |

### 6.3 APIs de IA

| Rota | Função | Autenticação actual | Estado | Destino |
|---|---|---|---|---|
| `POST /ia/perguntar` | Pergunta + histórico → resposta e fontes | Pública, com rate-limit por IP | Funcional com limitação | IA (serviço Python) |
| `GET /ia/pesquisar?q=` | Top-k de extractos, sem LLM | Pública, com rate-limit | Funcional | IA |
| `GET /ia/documento?f=&q=` | Pesquisa restrita a um documento | Pública, com rate-limit | Funcional | IA |
| `GET /ia/status` | Métricas do índice e modelo | Bearer opcional (`IA_STATUS_TOKEN`) | Funcional | IA/Plataforma |
| `GET /health` | Estado do serviço | Pública | Funcional | IA/Plataforma |
| `GET /` | Metadados do serviço | Pública | Funcional | IA |

### 6.4 Observações de segurança da API actual

- O token de sessão é um HMAC com validade de 7 dias; o `logout` apaga o cookie,
  mas **não revoga o token** no servidor. Um token capturado continua válido até
  expirar.
- Não há rate-limit nos endpoints de autenticação nem protecção contra força bruta.
- O painel admin usa um booleano `is_admin`; não há papéis, permissões granulares
  nem auditoria.
- Não há CSRF token explícito; a protecção depende de `SameSite=Lax` e do facto de
  os pedidos serem JSON. Laravel deve aplicar CSRF/sessão correctamente.
- O upload valida a extensão `.pdf` e o limite de 30 MB, mas não confirma magic
  bytes, não analisa malware e não impede colisões de nomes.
- A chave `IA_API_KEY` está correctamente fora do frontend; deve passar para um
  gestor de segredos em produção.

## 7. Inventário de dados e conteúdos

| ID | Fonte | Registos | Utilização actual | Destino | Acção | Validação |
|---|---|---:|---|---|---|---|
| DAT-01 | `site/data/membros.json` | 218 | Directório e CDA Verify | `members` + directório público | Importar | 218 linhas; carteira única; zero PII adicional |
| DAT-02 | `site/data/documentos.json` | 266 | Centro Documental | `documents` + ficheiros | Importar | 266 PDFs; checksum; metadados completos |
| DAT-03 | `site/js/dados.js` → `DOCUMENTOS` | 58 | CMS e destaques | `documents` (curadoria) | Importar | 58 ficheiros existentes; correspondência por nome |
| DAT-04 | `site/js/dados.js` → `NOTICIAS` | 18 | Home e notícias | `news` | Importar | 18 notícias; imagens; datas; categorias |
| DAT-05 | `site/js/dados.js` → `ACTIVIDADES` | 8 | Arquivo e galeria | `activities` + `activity_media` | Importar | 8 actividades; capas; documentos |
| DAT-06 | `site/js/dados.js` → `ORGAOS` | 15 | Nenhum JS consome | `organs`/`team` | Importar | 15 registos; confirmar fonte canónica |
| DAT-07 | `site/data/eventos.json` | 38 | Apenas validação | `events` ou arquivo | Arquivar/decidir | 38 registos; decidir se é conteúdo público |
| DAT-08 | `site/data/timeline.json` | 19 | `historia.html` | `timeline_entries` | Importar | 19 entradas; ordem cronológica |
| DAT-09 | `site/data/presidentes.json` | 3 | `lideranca`/`presidente-single` | `presidents`/`team` | Importar | 3 perfis; biografias; fotos |
| DAT-10 | `site/data/despachantes.json` | 10 | Nenhum runtime; demo | Fixtures | Arquivar | Não entra em produção |
| DAT-11 | `site/docs/*.pdf` | 266 | Acervo público | Object storage + `documents` | Importar | 266/266 acessíveis; checksum; links |
| DAT-12 | `site/img/**` | — | Notícias, galeria, órgãos, parceiros | Media library | Importar | Inventariar, validar alt text e dimensões |
| DAT-13 | `ia/factos_institucionais.txt` | — | Base de factos da IA | CMS/config + IA | Reutilizar | Factos confirmados pela CDA; sem contradições |
| DAT-14 | `ia/texto/*.txt` | 34 | Cache OCR | Não é fonte de verdade | Regerar | 34 textos preservados apenas como cache |
| DAT-15 | `ia/indice.json` | 1031 chunks | Índice BM25 | Índice reconstruído | Substituir | Reindexação completa; cobertura documental |

### 7.1 Regras de preservação

1. Nenhum dos 266 PDFs pode ser removido sem decisão explícita e registo de
   substituição.
2. As 18 notícias, 8 actividades, 15 órgãos, 19 entradas de cronologia e 3 perfis
   de presidentes devem manter título, data, texto e imagens.
3. Os 218 membros do directório devem manter os campos públicos; a importação
   não pode introduzir e-mail, telefone, NUIT ou morada.
4. `despachantes.json` é demonstração e não deve ser misturado com membros reais.
5. `dados.js` deixa de ser fonte de verdade; passa a ser apenas um artefacto
   transitório de exportação, se necessário.

## 8. Pipeline de IA

| ID | Componente | Localização | Estado | Destino | Acção | Critério de validação |
|---|---|---|---|---|---|---|
| IA-01 | OCR | `ia/ocr.py` | Funcional com limitação | Serviço Python + jobs | Adaptar | 266 PDFs processados ou excepções justificadas; `tesseract` com `por`; confiança e retry |
| IA-02 | Indexação BM25 | `ia/indexar.py` | Funcional com limitação | Serviço Python | Reconstruir | Todos os documentos públicos indexados; chunks com metadados e nível de acesso |
| IA-03 | Recuperação | `ia/api.py` (`busca`) | Funcional | Serviço Python | Adaptar | Top-k relevante; filtros por documento; sem fugas de conteúdo privado |
| IA-04 | Resposta RAG | `ia/api.py` (`resposta_rag`) | Funcional com limitação | Serviço Python | Adaptar | Resposta com fontes; sem invenção; fallback quando não há chave |
| IA-05 | Fallback local/factos | `ia/api.py` | Funcional | Serviço Python | Reutilizar | Responde sem LLM; admite quando não sabe; contactos correctos |
| IA-06 | Autenticação e quotas de IA | Rate-limit por IP | Funcional com limitação | Laravel + IA | Reconstruir | Pedidos assinados; quotas por utilizador/IP; auditoria; sem chave no browser |
| IA-07 | Avaliação da qualidade | Não existe | Em falta | IA | Reconstruir | Conjunto de 50 perguntas; precisão de fontes; groundedness; latência; custo |

### 8.1 Limitação crítica de cobertura

O índice actual tem **1031 chunks**, mas cobre sobretudo os 58 documentos de
`dados.js`, 9 páginas, notícias, órgãos e factos. Dos 266 PDFs, apenas **34**
produziram texto com `pdftotext`. Os restantes **232** não têm texto extraído e o
OCR não foi executado porque `tesseract` não está instalado; por isso não podem
ser respondidos pelo RAG.

`tesseract` não está instalado no ambiente actual. A Fase 5 não pode fechar a
cobertura documental total sem:

1. instalar `tesseract-ocr` e `tesseract-ocr-por`;
2. executar OCR sobre os 232 PDFs em falta;
3. rever qualidade e excepções;
4. reindexar e validar respostas com fontes.

Isto é um bloqueio conhecido, não um defeito da migração Laravel.

## 9. Infraestrutura, build e testes

| ID | Elemento | Localização | Estado | Destino | Acção |
|---|---|---|---|---|---|
| INF-01 | Build/deploy estático | `build.sh`, `docs/` | Funcional | Pipeline Laravel + staging | Substituir |
| INF-02 | Bootstrap local | `setup.sh` | Funcional | Documentação + scripts | Adaptar |
| INF-03 | Testes actuais | `tests/` (5) | Funcional | PHPUnit/Pest + testes Python | Adaptar |
| INF-04 | Validação de datasets | `tools/verify_datasets.py` | Funcional | Importadores + testes | Reutilizar |
| INF-05 | GitHub Pages | `docs/` | Funcional | Staging/paralelo | Manter durante transição |
| INF-06 | Base de dados | SQLite | Funcional | PostgreSQL 16+ | Substituir |
| INF-07 | Armazenamento de PDFs | `site/docs/` no Git | Funcional com limitação | Object storage/disco gerido | Substituir |
| INF-08 | Segredos | `ia/.env`, `.auth_secret` | Funcional | Gestor de segredos | Substituir |
| INF-09 | Logs e monitorização | — | Em falta | Plataforma | Reconstruir |
| INF-10 | Backups | — | Em falta | Plataforma | Reconstruir |

**Referência de backup da Fase 0:** tag `baseline-2.0` em `a102920` (local e
`origin`) e bundle `~/backups/cda-digital-a102920.bundle` (220 MB, verificado).
O bundle contém o histórico completo, mas está apenas no disco local; deve ser
replicado para armazenamento externo.

## 10. Dívida técnica e lacunas

### P0 — resolver antes de produção

| ID | Problema | Evidência | Impacto | Resolução na nova plataforma |
|---|---|---|---|---|
| DIV-01 | Upload de PDF não entra na lista pública | `upload_doc` grava em `DocumentoMeta`; `centro-documental.js` lê `documentos.json` | Documento uploadado pode ficar invisível | `documents` como fonte única; publicação explícita e invalidação de cache |
| DIV-02 | Cobertura RAG incompleta | 34/266 PDFs com texto `pdftotext`; 232 sem OCR; `tesseract` ausente | Assistente não responde sobre 232 documentos | OCR em fila + índice completo + relatório de excepções |
| DIV-03 | Autenticação duplicada e inconsistente | `app.js` e `membro.js` registam handlers de login/registo na mesma página; o de `app.js` não envia `carteira` | Pedidos duplicados, erros intermitentes e estado de UI divergente | Um único fluxo Laravel; remover handlers legados e testar o formulário uma só vez |
| DIV-04 | Autorização binária | `Membro.is_admin` | Qualquer admin pode tudo; sem auditoria | Papéis/permissões + policies + audit log |
| DIV-05 | Upload pouco validado | Extensão `.pdf` e limite de 30 MB | Ficheiros maliciosos ou corrompidos | MIME/magic bytes, antivírus, quarentena, checksum, limites |
| DIV-06 | Dados de membros e verificação | 218 nomes/carteiras públicos; verificação client-side | Privacidade e falsa sensação de segurança | Política de dados, campos mínimos, rate-limit, auditoria |
| DIV-07 | Sessões sem revogação | `logout` apaga cookie; token HMAC válido até 7 dias | Token roubado continua activo | Sessões Laravel revogáveis; rotação; expiração |
| DIV-08 | Sem protecção de força bruta | Login sem rate-limit | Ataques de credenciais | Rate-limit, lockout, MFA para admin (avaliar) |
| DIV-09 | Sem auditoria | Nenhum registo de acções administrativas | Impossível investigar alterações | Audit log imutável |
| DIV-10 | Sem backup/restauro | Nenhum procedimento | Risco de perda de dados | Backups diários + teste de restauro |

### P1 — resolver durante a migração

| ID | Problema | Resolução |
|---|---|---|
| DIV-11 | Sem CMS de páginas/menus | Módulo CMS com rascunho/publicação |
| DIV-12 | Sem biblioteca de media | Módulo Media com alt text e deduplicação |
| DIV-13 | Dados demo misturados com datasets | Separar `fixtures/` de dados reais; não importar `despachantes.json` |
| DIV-14 | Notícias sem detalhe/slug | Rota de detalhe e SEO |
| DIV-15 | Pesquisa global limitada a títulos de documentos | Pesquisa transversal (PostgreSQL FTS) |
| DIV-16 | Sem notificações | Notificações in-app/e-mail com templates |
| DIV-17 | Sem SEO técnico | Sitemap, canonical, 301, dados estruturados |
| DIV-18 | `docs/` com 236 MB no Git | Object storage; histórico e deploy separados |
| DIV-19 | Sem staging | Ambiente de pré-produção e testes de aceitação |
| DIV-20 | Sem acessibilidade automatizada | Testes WCAG e revisão manual |

### P2 — melhorias

- Substituir `dados.js` por exportação opcional para consumidores estáticos.
- Remover `ORGAOS` e `eventos.json` se não forem usados, depois de decidir.
- Uniformizar nomenclatura (`carteira`/`nCarta`/`cédula`) na base de dados.
- Adicionar métricas de utilização e pesquisa.
- Avaliar pesquisa semântica/pgvector apenas depois de o corpus estar completo.

## 11. Funcionalidades concluídas, incompletas e experimentais

### Concluídas e a preservar

- Website institucional com 23 páginas e design system responsivo.
- Centro Documental com 266 PDFs, filtros, paginação e links estáveis.
- 18 notícias, 8 actividades, 15 órgãos, 19 entradas de cronologia e 3 presidentes.
- Directório público de 218 membros com filtros e privacidade de campos.
- Registo com validação por carteira, aprovação por admin, quotas e requerimentos.
- Painel admin com CRUD de documentos, notícias, actividades, mensagens e membros.
- Assistente CDA com BM25, fallback local, RAG via Ollama Cloud e fontes.
- Suíte de testes actual e validação de datasets.

### Incompletas

- Upload de PDF → lista pública (DIV-01).
- Cobertura documental do RAG (DIV-02).
- CDA Verify (PUB-16).
- CMS de páginas, menus e media (FUN-03, FUN-07).
- Notificações, auditoria, backups e monitorização (FUN-24, FUN-26, FUN-27).
- Pesquisa global (FUN-22).

### Experimentais ou demonstração

- `denunciar.js` — denúncia apenas no `localStorage`.
- `pergunte.js` — formulário de contacto simulado.
- `despachantes.json` — 10 registos de demonstração.
- `eventos.json` — 38 eventos não consumidos pelo runtime.
- `ia/indice.json` — artefacto local, ignorado pelo Git.

## 12. Mapa de migração por fase

| Fase | Âmbito | Entregável verificável |
|---|---|---|
| 0 | Auditoria e matriz | Este documento + baseline + backup/tag |
| 1 | Arquitectura e modelação | Módulos, ERD PostgreSQL, papéis/permissões, contratos API, armazenamento |
| 2 | Fundação Laravel | Projecto Laravel 13, auth, RBAC, auditoria, logs, testes base |
| 3 | CMS e website | Páginas, notícias, documentos, media e painel Filament |
| 4 | CRM e membros | Registo/aprovação, perfis, quotas, requerimentos, notificações |
| 5 | IA | Serviço Python integrado, OCR completo, RAG com fontes e controlo de acesso |
| 6 | Testes e publicação | Segurança, migração de dados, desempenho, backups, go-live |

### 12.1 Critérios de aceitação por fase

**Fase 1**

- Modelo de dados cobre todos os módulos e relações.
- Matriz de papéis/permissões aprovada.
- Contratos Laravel ↔ Python documentados (autenticação, pedidos, respostas, erros).
- Política de armazenamento documental definida (object storage, retenção, backups).
- Nenhuma funcionalidade da matriz fica sem destino.

**Fase 2**

- Laravel 13 instala e arranca com PostgreSQL.
- Autenticação, verificação de e-mail, recuperação de senha e logout revogável.
- Papéis e policies testados.
- Auditoria e logs activos.
- CI com PHPUnit/Pest e análise estática.

**Fase 3**

- 23 páginas equivalentes ou superior, com conteúdo migrado.
- 18 notícias, 8 actividades, 15 órgãos, 19 entradas de cronologia e 3 presidentes.
- 266 documentos acessíveis e pesquisáveis.
- CMS permite publicar sem alterar código.
- Upload de PDF aparece no Centro Documental após publicação.

**Fase 4**

- 218 membros importados; campos públicos validados.
- Registo, aprovação, quotas e requerimentos com testes E2E.
- Notificações e histórico de processos.
- CDA Verify com rate-limit e auditoria.

**Fase 5**

- 266/266 PDFs com texto ou excepção registada.
- Índice cobre todo o acervo público.
- Assistente responde com fontes e admite quando não sabe.
- Nenhuma chave de IA no frontend.
- Controlo de acesso a documentos privados.

**Fase 6**

- Testes funcionais, de segurança e de autorização.
- Migração de dados com contagens e checksums.
- Teste de restauro de backup.
- Teste de carga e latência.
- Plano de rollback e janela de publicação aprovados.

## 13. Decisões pendentes

Estas decisões devem ser tomadas antes da Fase 1 ou no início dela:

1. **Aprovar esta matriz** e o âmbito das sete fases.
2. **Alojamento:** confirmar PHP 8.3+, PostgreSQL, worker de filas, armazenamento e SSL.
3. **Domínio:** manter `cda-mz.org` e definir subdomínio/API (`api.cda-mz.org`?).
4. **Privacidade:** aprovar que dados de membros ficam públicos no directório e no
   CDA Verify; definir base legal, consentimento e retenção.
5. **Denúncias:** decidir se `denunciar.html` se torna um canal real; se sim, definir
   responsável, confidencialidade e fluxo.
6. **OCR:** autorizar instalação de `tesseract` e processamento dos 232 PDFs.
7. **Armazenamento:** decidir object storage vs. disco gerido; política de backups.
8. **Dados demo:** confirmar que `despachantes.json` e `eventos.json` não entram em
   produção.
9. **Publicação:** manter GitHub Pages em paralelo durante a migração?
10. **Autenticação de membros:** confirmar se o login continua por carteira/e-mail e
    se será necessária verificação de e-mail.

## 14. Riscos principais

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Perda de documentos ou notícias na importação | Média | Alto | Importação idempotente, checksums, contagens, ensaio e rollback |
| RAG incompleto por falta de OCR | Alta | Alto | Instalar `tesseract`, processar 232 PDFs, relatório de excepções |
| Exposição de dados pessoais no directório/verify | Média | Alto | Minimização de dados, política de privacidade, revisão legal |
| Upload malicioso | Média | Alto | Validação MIME/magic bytes, antivírus, quarentena, limites |
| Regressão funcional durante a migração | Média | Alto | Testes de paridade, staging, publicação faseada |
| Bloqueio por decisões de infraestrutura | Média | Médio | Decidir alojamento/domínio antes da Fase 2 |
| Prazo afectado pela cobertura OCR | Alta | Médio | Tratar OCR como fase própria dentro da Fase 5 |

## 15. Próximo passo

1. Rever esta matriz com a CDA e obter aprovação explícita.
2. Copiar o bundle `~/backups/cda-digital-a102920.bundle` para armazenamento
   externo (a tag `baseline-2.0` já foi criada e enviada para `origin`).
3. Abrir a Fase 1: arquitectura, ERD PostgreSQL, papéis/permissões, contratos de
   API e política de armazenamento.
4. Só depois criar o projecto Laravel 13 e iniciar a Fase 2.

---

**Anexos de referência**

- `RELATORIO_TECNICO_COMPLETO.md` — relatório inicial, desactualizado em contagens
  (11 páginas/57 documentos vs. 23/266 actuais); usar apenas como contexto.
- `site/data/README.md` — proveniência e política de privacidade dos datasets.
- `tests/run_tests.sh` — suíte de testes actual.
- `tools/verify_datasets.py` — validação dos datasets.
- `ia/ocr_relatorio.json` — relatório de OCR (quando existir).
