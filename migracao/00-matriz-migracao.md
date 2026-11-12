# Fase 0 — Matriz de Migração para o CDA Digital 3.0

> **Versão:** 1.0 — aprovada tecnicamente em 12 de Novembro de 2026.
> **Estado:** aprovação técnica **concedida**; decisões institucionais **pendentes**; Fase 0 **em encerramento** (falta cópia externa do bundle).
> **Âmbito:** mantém integralmente o inventário da versão 0.9 e incorpora as correcções da revisão. Não inicia Laravel.
> **Destino:** CDA Digital 3.0 — Plataforma de Gestão Institucional. Decisão registada em [`ADR-0001`](ADR-0001-cda-digital-3.0.md); não haverá website provisório nem segunda reconstrução.
> **Referência estável:** `main` em `a102920` — “Ativar área de membro, painel admin e chat IA”.
> **Branch de trabalho:** `refatoracao/laravel-13`.
> **Data da revisão:** 12 de Novembro de 2026.
> **Repositório:** `git@github.com:cleitonsimiaondonac2-cyber/cda-digital.git`.

## 1. Objetivo

Inventariar o que existe no CDA Digital 2.0 antes de o substituir pelo **CDA
Digital 3.0**, para que a nova plataforma preserve funcionalidades, conteúdos e
dados, e para que a reconstrução seja feita com critérios de aceitação
verificáveis. O 2.0 não é uma segunda entrega: é o baseline e a referência de
recuperação até o 3.0 assumir a produção.

Esta matriz responde a quatro perguntas por cada elemento do sistema:

1. O que existe hoje?
2. Onde está implementado?
3. Em que estado se encontra?
4. O que deve acontecer na nova plataforma e como validar?

### 1.1 Aprovação técnica vs. decisão institucional

Há duas aprovações distintas, que não devem ser confundidas:

| Aprovação | O que valida | Quem decide | Estado |
|---|---|---|---|
| **Técnica** | Inventário, âmbito, lacunas e critérios de migração | Equipa técnica + revisão da CDA | **Aprovada em 12/11/2026**; registo em [`APROVACAO-FASE-0.md`](APROVACAO-FASE-0.md) |
| **Institucional** | Privacidade, CDA Verify, denúncias, OCR, domínio, alojamento e retenção | CDA e GigaSystems | Pendente; ver secção 13 |

A aprovação técnica foi concedida e permite **fechar a auditoria e abrir a Fase 1**.
Não autoriza, por si só, tratar dados de membros, ativar o CDA Verify, publicar
denúncias, executar OCR em massa nem contratar alojamento. Essas decisões têm
responsável próprio e devem ficar registadas antes da fase em que produzem efeitos.

**Regra de passagem:** a Fase 2 (instalação Laravel) não começa sem estarem
decididos alojamento, domínio e âmbito institucional; a política de privacidade é
necessária antes de tratar dados de membros na Fase 4; a Fase 5 não fecha sem
autorização de OCR e cobertura documental completa.

### 1.2 Destino definitivo: CDA Digital 3.0

A decisão arquitectónica da CDA é vinculativa e está registada em
[`ADR-0001`](ADR-0001-cda-digital-3.0.md):

| Elemento | Decisão |
|---|---|
| Produto | **CDA Digital 3.0 — Plataforma de Gestão Institucional** |
| Núcleo | Laravel 13: website, CMS, membros, administração, documentos, autenticação, permissões, auditoria e APIs |
| Website | Módulo da plataforma, construído directamente em Laravel/Blade |
| Dados | PostgreSQL como fonte de verdade; ficheiros em armazenamento gerido |
| IA | Python/FastAPI independente, integrado por APIs autenticadas |
| Baseline | CDA Digital 2.0 preservado até o 3.0 ser validado e assumir a produção |
| Sequência | Fase 0 a Fase 6, começando pela arquitectura e não pelas páginas |

**Não-objectivos explícitos:**

- construir um website provisório fora do Laravel;
- reconstruir o website uma segunda vez depois da migração;
- começar pelas páginas antes de decidir membros, documentos, autenticação,
  permissões e modelo de dados;
- tratar o Laravel como simples backend de um site estático paralelo;
- manter o 2.0 como produto paralelo depois da entrada em produção do 3.0.

A Fase 3 implementa o website oficial dentro do Laravel. O inventário desta matriz
é a lista de paridade funcional e editorial; nenhuma funcionalidade é descartada
sem decisão registada.

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
| Membros no directório público | 218 registos profissionais; **217 carteiras únicas** (1 duplicado a resolver) |
| Documentos curados em `dados.js` | 58 (subconjunto dos 266) |
| Documentos a importar | **266** — os 58 curados não são registos adicionais |
| Notícias | 18 |
| Actividades | 8 |
| Órgãos | 15 pessoas; `instituicao.html` e `dados.js` divergem no agrupamento |
| Eventos | 38 |
| Cronologia | 19 entradas |
| Presidentes | 3 |
| Texto extraído dos PDFs | 34 de 266 |
| Chunks no índice BM25 | 1031 |
| PHP / Composer / PostgreSQL | PHP 8.3.6; Composer 2.7.1; PostgreSQL 16.15 activo |
| Docker | não instalado |

**Leitura correcta dos números:**

- Os **218** são registos profissionais do directório público, não 218 contas de
  utilizador nem 218 administradores. As contas são criadas separadamente no
  registo e devem ser modeladas como `users` na nova plataforma.
- Os **58** documentos curados são um **subconjunto** dos 266 PDFs. O universo a
  importar é 266, não 324.
- Existe **uma carteira duplicada** em `membros.json`: `011801160313` aparece em
  dois registos (Madalena dos Anjos Chambul e Sheila Albertina Hassan Mahomed).
  O conflito deve ser resolvido pela CDA antes da importação; não deve ser
  deduplicado automaticamente. Ver `DIV-21`.
- O ambiente auditado é local. PostgreSQL 16.15 estar ativo nesta máquina **não
  confirma** o alojamento de produção; ver secção 9.1.

Comandos de verificação executados:

```bash
cd ~/cda-digital
bash tests/run_tests.sh          # suíte completa: OK
python3 tools/verify_datasets.py # PASS (4/4)
git rev-parse --short HEAD       # a102920
```

> Nota operacional: `tests/run_tests.sh` não tem bit de execução; deve ser invocado
> com `bash tests/run_tests.sh` ou o bit deve ser corrigido numa alteração própria.

## 3. Critérios, legenda e princípios

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

### 3.4 Fonte única de verdade

A plataforma não deve reproduzir a fragmentação actual. A regra é:

| Domínio | Fonte de verdade | O que não é fonte |
|---|---|---|
| Metadados | PostgreSQL | `dados.js`, `documentos.json`, `membros.json` |
| Ficheiros | Object storage/disco gerido, com checksum | Cópias soltas em `site/docs` ou no Git |
| Conteúdo editorial | PostgreSQL (CMS) | HTML estático duplicado |
| Índice de IA | Derivado do corpus autorizado | `ia/indice.json` como original |
| Texto OCR | Derivado do PDF, com job e estado | `ia/texto/*.txt` como original |
| Contas e permissões | PostgreSQL (`users`, papéis) | `is_admin` ou ficheiros JSON |

Consequências obrigatórias:

1. **Um documento = um registo.** Os 58 curados são atributos editoriais
   (`featured`, `titulo_curado`, `categoria_curada`) sobre os mesmos 266 registos;
   nunca criam 58 registos adicionais.
2. **Os JSON/JS antigos são fontes de importação**, não destinos. Depois da
   importação, ficam read-only ou são descontinuados.
3. **A IA não escreve na base de dados principal.** Consome uma cópia autorizada
   do corpus e devolve resultados; a publicação e a autorização pertencem ao Laravel.
4. **Toda a escrita relevante é auditável.** Importações, publicação, aprovações,
   pagamentos e alterações de permissões deixam rasto.

### 3.5 Identidades e acesso

O modelo actual confunde conceitos: a tabela `Membro` guarda simultaneamente o
registo profissional e a conta de acesso, e o booleano `is_admin` atribui
administração. A nova plataforma deve separar:

| Entidade | O que representa | Autentica? | Onde vive |
|---|---|---|---|
| **Membro institucional** | Registo profissional da CDA (nome, carteira, empresa, situação, delegação) | Não por si só | `members` |
| **Utilizador** | Conta de acesso (e-mail, senha, estado, sessões) | Sim | `users` |
| **Operador** | Funcionário/colaborador que usa o painel | Sim, com papel | `users` + papel |
| **Administrador** | Gere conteúdo, membros, quotas ou documentos conforme permissão | Sim, com papel | `users` + papel |
| **Superadministrador** | Configuração, permissões e operações sensíveis | Sim, com papel restrito | `users` + papel |

Regras:

- Um membro **não** é automaticamente utilizador, operador ou administrador.
- Um utilizador pode estar ligado a zero ou um membro (`members.user_id` ou
  tabela de ligação), mas a permissão vem do papel, não da existência do registo.
- Uma pessoa pode acumular relações (membro + operador), mas os papéis são
  explícitos, separados e auditáveis.
- O directório público e o CDA Verify não são fontes de autenticação.
- A aprovação de um membro não cria conta; a criação de conta não aprova o membro.

### 3.6 Fronteira Laravel ↔ IA

O serviço Python não deve ter acesso irrestrito à plataforma. A fronteira proposta
para a Fase 1 é:

```text
Browser → Laravel (auth, autorização, quotas, auditoria)
             ↓ pedido assinado, com escopo e IDs autorizados
         Python/FastAPI (OCR, índice, recuperação, geração)
             ↓ resposta com fontes e metadados
         Laravel → Browser
```

Regras:

- O browser fala com o Laravel; o Laravel decide o que o utilizador pode ver e
  encaminha o pedido para a IA. Isto evita expor o serviço Python e permite
  aplicar quotas e auditoria num único ponto.
- O Python recebe apenas: pergunta, histórico permitido, idioma, IDs de documentos
  autorizados e contexto de utilizador mínimo. Não recebe senhas, cookies de
  sessão, chaves de administração nem acesso directo à base de dados.
- A autenticação entre serviços usa um token de curta duração (JWT/HMAC com
  `iss`, `aud`, `exp`, `jti` e escopos) ou mTLS/rede privada. O contrato exacto
  fica em `03-contratos-api.md`.
- O Python não altera membros, quotas, permissões, documentos ou conteúdo. Se
  precisar de registar um job de OCR, faz através de uma API de serviço com escopo
  mínimo e auditada.
- Toda a resposta da IA inclui fontes e um modo (`rag`, `local`, `sem-resultados`);
  o Laravel valida que as fontes pertencem ao conjunto autorizado antes de as
  devolver.
- Documentos privados nunca entram no índice público; o índice deve ter metadados
  de acesso e o Laravel filtra por esses metadados.

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
| PUB-15 | `despachantes.html` | Como ser membro + directório de 218 registos profissionais (217 carteiras únicas) com filtros | `membros.json` + `directorio.js` | Funcional com limitação | Membros/Website | Adaptar |
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
- **Directório:** `membros.json` contém 218 registos profissionais e apenas
  campos públicos (nome, carteira, empresa, situação, província, delegação,
  activo). O teste de datasets confirma ausência de e-mail, telefone e outros PII.
  Há **217 carteiras únicas**: `011801160313` aparece em dois registos
  (Madalena dos Anjos Chambul e Sheila Albertina Hassan Mahomed), conflito a
  resolver pela CDA antes da importação. Estes 218 registos **não são 218 contas
  de utilizador**.
- **Verificação:** `verificar.js` reutiliza `membros.json` e apresenta nome,
  carteira, empresa, situação, província e delegação. Isto serve para consulta,
  não constitui prova de titularidade. O CDA Verify deve ter uma política própria,
  mais restrita do que o directório, com rate-limit e auditoria — ver secção 7.4.
- **Galeria:** as imagens vêm das capas das actividades em `dados.js`; não há
  biblioteca de media nem upload de galeria no admin.
- **Órgãos:** `dados.js` contém 15 registos `ORGAOS`, mas nenhum JS os consome;
  `instituicao.html` tem a composição nominal dos 15 membros, com números de
  carteira e cartaz oficial. As duas fontes não têm o mesmo agrupamento nem os
  mesmos nomes abreviados. A fonte canónica provisória é `instituicao.html` +
  cartaz oficial; `dados.js` serve apenas para fotos e metadados auxiliares.
  Confirmar com a CDA — ver secção 7.3.
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
| FUN-08 | CRUD de metadados documentais | `ia/admin.py`; `admin.js` | Funcional | Documentos | Reconstruir | 266 registos; os 58 curados são atributos dos mesmos registos, não documentos adicionais; tipo, ano, emissor, categoria, estado, visibilidade |
| FUN-09 | Upload de PDF, validação e OCR | `POST /api/admin/documentos/upload`; `ia/ocr.py` | Funcional com limitação | Documentos + IA | Adaptar | Validar extensão, MIME e magic bytes; limite; antivírus/quarentena; checksum; job de OCR; atualizar a lista pública |
| FUN-10 | Centro Documental público | `documentacao.html`; `centro-documental.js` | Funcional | Documentos | Reconstruir | Paridade de 266 documentos; filtros; pesquisa; paginação; URL estável; acesso por nível |
| FUN-11 | Pipeline de publicação | `ia/publicar.py`; `build.sh` | Funcional com limitação | Plataforma + CMS | Substituir | Publicar conteúdo sem regenerar JS à mão; invalidar cache; reindexar; rollback |
| FUN-12 | Registo, login, logout e sessão | `ia/auth.py`; `ia/admin.py`; `membro.js` | Funcional com limitação | Utilizadores | Reconstruir | Laravel auth; verificação de e-mail; recuperação de senha; rate-limit; revogação de sessão; CSRF |
| FUN-13 | Aprovação de membros | Endpoints `/api/admin/membros/*` | Funcional | Membros | Adaptar | Estados pendente/aprovado/rejeitado/suspenso; motivo; auditoria; notificação |
| FUN-14 | Perfil e painel do membro | `membro.js`; `/api/membro/resumo` | Funcional com limitação | Membros | Reconstruir | Dados do membro, quotas, requerimentos, documentos e privacidade num único painel |
| FUN-15 | Directório público de membros | `membros.json`; `directorio.js` | Funcional com limitação | Membros/Website | Adaptar | 218 registos; 217 carteiras únicas; conflito documentado; filtros; privacidade; nenhum campo sensível exposto |
| FUN-16 | CDA Verify | `verificar.js`; `membros.json` | Parcial | Membros/CDA Verify | Reconstruir | Pesquisa por nome/carteira; resultado mínimo e distinto do directório; rate-limit; auditoria; sem enumeração abusiva |
| FUN-17 | Quotas | `ia/db.py` (`Quota`); `/api/admin/quotas/*` | Funcional com limitação | Quotas | Reconstruir | Ciclo financeiro definido (secção 5.1); geração anual; estados; pagamentos; recibos; reconciliação; histórico; notificações |
| FUN-18 | Requerimentos | `ia/db.py` (`Requerimento`); endpoints | Funcional com limitação | Requerimentos | Reconstruir | Tipos; anexos; estados; resposta; histórico; prazo; notificações |
| FUN-19 | Mensagens de contacto | `ContactoMsg`; `/api/contacto` | Funcional com limitação | Comunicação | Adaptar | Anti-spam; consentimento; atribuição; estado lida/resolvida; retenção |
| FUN-20 | Denúncias de fraude | `denunciar.js` | Demonstração | Comunicação/Denúncias | Reconstruir¹ | Canal confidencial; referência; triagem; confidencialidade; retenção legal |
| FUN-21 | FAQ | `pergunte.html`; `pergunte.js` | Demonstração | CMS/FAQ | Reconstruir | Categorias e perguntas no CMS; pesquisa; fallback para contacto |
| FUN-22 | Pesquisa global | `ui.js` (só títulos de documentos) | Parcial | Website/Plataforma | Reconstruir | Pesquisar páginas, notícias, documentos e FAQ; relevância; excluir conteúdo privado |
| FUN-23 | Assistente CDA | `assistente.js`; `ia/api.py` | Funcional com limitação | IA | Adaptar | Chave só no servidor; pedidos assinados; fontes; fallback; rate-limit; latência |
| FUN-24 | Notificações | Não existe | Em falta | Comunicação | Reconstruir | In-app/e-mail; templates; opt-in; registo de entregas |
| FUN-25 | Utilizadores, papéis e permissões | `Membro.is_admin` (booleano) | Funcional com limitação | Utilizadores | Reconstruir | Separar membro de utilizador; papéis granulares; menor privilégio; testes de autorização; superadmin |
| FUN-26 | Auditoria | Não existe | Em falta | Plataforma | Reconstruir | Registar login, CRUD, aprovações, downloads e exportações; imutável; retenção |
| FUN-27 | Backups, logs e monitorização | Não existe | Em falta | Plataforma | Reconstruir | Backup diário de BD e ficheiros; restauro testado; alertas; retenção |
| FUN-28 | Design system e acessibilidade | 7 CSS; `ui.js` | Funcional | Website | Adaptar | WCAG 2.2 AA; contraste; teclado; foco; responsividade; testes de regressão |
| FUN-29 | SEO, sitemap e redireccionamentos | Parcial | Funcional com limitação | Website | Adaptar | Metadados; canonical; sitemap; 301 das URLs antigas; dados estruturados |
| FUN-30 | Importação e validação de dados | Não existe | Em falta | Plataforma | Reconstruir | Contagens, checksums, idempotência, relatório de erros e rollback |

### 5.1 Ciclo financeiro de quotas (a modelar na Fase 1)

A matriz anterior previa “pagamentos e recibos” sem definir o ciclo. Isto é
insuficiente para uma plataforma institucional. Antes de implementar quotas, a
Fase 1 deve fixar:

| Elemento | Decisão necessária |
|---|---|
| Exercício anual | Ano, valor por categoria, data de vencimento, isenções e descontos |
| Emissão | Geração em lote, referência única, notificação e reemissão |
| Pagamento | Canais aceites (transferência, depósito, numerário, gateway?), prova e moeda (MZN) |
| Reconciliação | Extracto bancário, conciliação manual/automática, pagamentos parciais e duplicados |
| Recibo | Numeração, emissão, reemissão, anulação e obrigações fiscais |
| Inadimplência | Estado “em atraso”, plano de pagamento e efeitos legais (a decidir pela CDA) |
| Segregação de funções | Quem regista o pagamento, quem confirma e quem audita |
| Relatórios | Extracto do membro, mapa de cobrança, reconciliação e exportação |

**Fora de âmbito até decisão explícita:** gateway de pagamento online, multas
automáticas, suspensão automática de membros e integração bancária directa. O
modelo de dados deve acomodar o ciclo, mas a implementação só avança com requisitos
aprovados.

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

### 6.5 Planos de autenticação a formalizar

A expressão “Laravel Auth” não é suficiente para cobrir todos os planos. A Fase 1
deve fixar quatro mecanismos distintos:

| Plano | Uso | Mecanismo proposto | Onde fica |
|---|---|---|---|
| Sessão web | Browser → Laravel | Cookie de sessão `HttpOnly`, `Secure`, `SameSite=Lax`, CSRF e regeneração de sessão | Laravel |
| API pública | Site/consumidores → Laravel | Sessão ou token de leitura com rate-limit; sem dados privados | Laravel |
| Serviço | Laravel → Python | JWT/HMAC de curta duração com `iss`, `aud`, `exp`, `jti` e escopos; mTLS/rede privada se possível | `03-contratos-api.md` |
| Administração | Operadores → Filament | Sessão + RBAC + políticas; 2FA a avaliar | Laravel/Filament |

Regras:

- O cookie de sessão do membro **não** autentica no serviço Python.
- O `AUTH_SECRET`/chave de serviço **não** é enviado para o browser.
- O Python não deve ficar exposto directamente à Internet sem proxy e autorização
  do Laravel.
- A revogação de sessão e a rotação de tokens têm de ser testáveis.

## 7. Inventário de dados e conteúdos

| ID | Fonte | Registos | Utilização actual | Destino | Acção | Validação |
|---|---|---:|---|---|---|---|
| DAT-01 | `site/data/membros.json` | 218 | Directório e CDA Verify | `members` + directório público | Importar | 218 registos; 217 carteiras únicas; duplicado `011801160313` resolvido pela CDA; zero PII adicional |
| DAT-02 | `site/data/documentos.json` | 266 | Centro Documental | `documents` + ficheiros | Importar | 266 PDFs; checksum; metadados completos |
| DAT-03 | `site/js/dados.js` → `DOCUMENTOS` | 58 | CMS e destaques | `documents` (atributos de curadoria) | Importar | 58/266 são subconjunto; atualizar os mesmos registos; **não somar 58 aos 266** |
| DAT-04 | `site/js/dados.js` → `NOTICIAS` | 18 | Home e notícias | `news` | Importar | 18 notícias; imagens; datas; categorias |
| DAT-05 | `site/js/dados.js` → `ACTIVIDADES` | 8 | Arquivo e galeria | `activities` + `activity_media` | Importar | 8 actividades; capas; documentos |
| DAT-06 | `site/js/dados.js` → `ORGAOS` | 15 | Nenhum JS consome; fotos e metadados auxiliares | `organs`/`team` | Adaptar | 15 pessoas; usar `instituicao.html` + cartaz como fonte canónica provisória; confirmar com a CDA |
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
2. As 18 notícias, 8 actividades, 15 pessoas na composição dos órgãos, 19
   entradas de cronologia e 3 perfis de presidentes devem manter título, data,
   texto e imagens.
3. Os 218 registos profissionais do directório devem manter os campos públicos; a
   importação não pode introduzir e-mail, telefone, NUIT ou morada. Estes registos
   não são contas de utilizador.
4. O duplicado de carteira `011801160313` deve ser preservado e sinalizado, não
   apagado automaticamente. A CDA decide qual é o registo correcto.
5. `despachantes.json` é demonstração e não deve ser misturado com membros reais.
6. `dados.js` e os restantes JSON deixam de ser fonte de verdade; passam a ser
   fontes de importação ou artefactos de exportação.
7. Os 58 documentos curados são um subconjunto dos 266; nunca são somados.
8. A composição dos órgãos deve ser importada de uma fonte canónica confirmada,
   não de duas listas divergentes.

### 7.2 Regra de contagem documental

O universo documental é **266 ficheiros**. Os 58 registos de `dados.js` são um
subconjunto de metadados curados e **não** representam 58 documentos adicionais.

| Operação | Resultado esperado |
|---|---:|
| PDFs em `site/docs` | 266 |
| Registos em `documentos.json` | 266 |
| Registos curados em `dados.js` | 58 (todos presentes nos 266) |
| Registos a criar em `documents` | **266** |
| Registos curados a atualizar | 58 |
| Registos a somar (266 + 58) | **0 — proibido** |

Validação obrigatória na importação:

- `SELECT count(*) FROM documents` = 266 para o lote inicial.
- Os 58 nomes de ficheiro de `dados.js` existem exactamente uma vez em `documents`.
- Nenhum registo duplicado por `storage_key` ou `checksum`.
- O total de PDFs acessíveis é 266; não 324.
- Os campos de curadoria (`featured`, `titulo_curado`, `categoria_curada`) ficam
  no mesmo registo do documento, não numa tabela paralela de 58 documentos.

### 7.3 Fonte canónica dos órgãos sociais

Existem duas representações com 15 pessoas, mas não são equivalentes:

| Fonte | Conteúdo | Limitação |
|---|---|---|
| `instituicao.html` + cartaz oficial | 15 nomes, cargos, números de carteira e imagem do cartaz | HTML estático; formato de carteira inconsistente; confirmar mandato |
| `dados.js` → `ORGAOS` | 15 registos, agrupamento “Direcção/Mesa/Conselho”, 2 fotos | Sem números de carteira; nomes abreviados; agrupamento diferente |

**Fonte canónica provisória:** `instituicao.html` + cartaz
`img/cartaz/cartaz-orgaos-sociais.jpg`. `dados.js` serve apenas para fotos e
metadados auxiliares.

Antes da importação, a CDA deve confirmar:

- nomes completos e cargos do triénio 2024–2026;
- órgão de pertença de cada pessoa (Mesa da AG, Presidente, Conselho Directivo,
  Conselho Deontológico e Fiscalizador);
- formato oficial do número de carteira (12 ou 16 dígitos; o HTML tem os dois);
- se o cartaz ou a página é a referência pública oficial.

Critério de validação: 15 pessoas, sem duplicados, cada uma com órgão, cargo,
carteira e foto (quando exista), confirmadas pela CDA.

### 7.4 Política de privacidade: directório vs. CDA Verify

O directório e o CDA Verify servem fins diferentes e não devem partilhar a mesma
exposição de dados. A situação actual reutiliza `membros.json` em ambos, pelo que
a verificação mostra o perfil profissional completo.

**Directório público (proposta):**

- Finalidade: transparência da classe e procura de profissionais.
- Campos: nome, carteira, empresa, situação, província, delegação, activo.
- Base legal, consentimento e processo de correcção/oposição a definir pela CDA.
- Sem e-mail, telefone, NUIT, morada ou documentos pessoais.
- Retenção e actualização anual definidas.

**CDA Verify (proposta):**

- Finalidade: confirmar que uma pessoa é membro e se está activo.
- Resultado mínimo: nome, carteira e estado; empresa apenas se necessário.
- Não devolver o perfil completo por defeito.
- Rate-limit, auditoria, protecção contra enumeração e sem listagens em massa.
- Base legal e tratamento de pedidos de terceiros definidos pela CDA.

| Campo | Directório | CDA Verify |
|---|---|---|
| Nome | Sim | Sim |
| N.º de carteira | Sim | Sim, eventualmente mascarado |
| Empresa | Sim | Opcional |
| Situação profissional | Sim | Não por defeito |
| Província/delegação | Sim | Não por defeito |
| Activo/inactivo | Sim | Sim |
| E-mail/telefone/NUIT/morada | Não | Não |

Estas políticas **não estão aprovadas**. São propostas para decisão institucional
antes da Fase 4. A aprovação técnica da matriz não as substitui.

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

Isto é um bloqueio conhecido, não um defeito da migração Laravel. O OCR dos 232
PDFs é **requisito obrigatório da Fase 5**, não uma melhoria opcional.

### 8.2 Gate obrigatório da Fase 5

A Fase 5 não é aprovada enquanto todos os critérios abaixo não tiverem evidência:

| ID | Critério | Evidência exigida |
|---|---|---|
| G5-01 | `tesseract-ocr` e `tesseract-ocr-por` instalados e versionados | Registo de instalação e versão |
| G5-02 | 266/266 PDFs processados, ou excepção aprovada com motivo | Relatório por documento |
| G5-03 | Índice cobre todos os documentos públicos autorizados | Contagem e lista de exclusões |
| G5-04 | Qualidade de OCR revista por amostra | Amostra mínima de 10% ou 30 documentos, com taxa de erro |
| G5-05 | Conjunto de avaliação com 50 perguntas e fontes esperadas | Relatório de precisão/groundedness |
| G5-06 | Nenhum documento privado é devolvido a utilizador sem permissão | Teste de autorização negativo |
| G5-07 | Chave de IA e credenciais apenas no servidor | Revisão de configuração e código |
| G5-08 | Respostas com fontes e modo explícito | Testes de RAG, fallback e “sem resultados” |

**Definição de bloqueio:** se G5-02, G5-03 ou G5-06 falhar, a Fase 5 não é
considerada concluída e a Fase 6 não começa.

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
| INF-11 | Alojamento de produção | — | Não confirmado | A decidir | Validar |
| INF-12 | Ambiente de staging | — | Em falta | Plataforma | Reconstruir |
| INF-13 | Retenção e restauro documental | — | Em falta | Plataforma | Definir |

### 9.1 Ambiente auditado vs. produção

O ambiente local foi validado para a auditoria. Isso **não** confirma o alojamento
de produção nem a sua capacidade.

| Componente | Ambiente auditado (local) | Produção (a confirmar) |
|---|---|---|
| PHP | 8.3.6 | 8.3–8.5, exigido pelo Laravel 13 |
| PostgreSQL | 16.15 activo localmente | Serviço gerido/VPS, versão e HA a confirmar |
| Servidor web | `uvicorn`/`http.server` local | Nginx/Caddy + PHP-FPM ou equivalente |
| Filas | Não configuradas | Worker persistente e supervisor |
| Armazenamento | `site/docs` no disco/Git | Object storage/disco gerido com backup |
| TLS/domínio | `localhost` | Domínio e certificados a definir |
| Backups | Bundle Git local | Política operacional por definir |
| Docker | Não instalado | Opcional; não é requisito |
| Monitorização | Não existe | Logs, métricas e alertas |

### 9.2 Política de backup e restauro

O bundle Git da Fase 0 preserva o código e o histórico, mas **não é** um backup
operacional da plataforma. A política definitiva deve cobrir:

| Item | Requisito |
|---|---|
| PostgreSQL | Dump diário + arquivo WAL/PITR, se disponível |
| Ficheiros | PDFs, imagens e media com checksum e cópia versionada |
| Configuração | Aplicação, filas, storage e integrações (sem segredos no repositório) |
| Segredos | Gestor de segredos com backup separado e acesso restrito |
| Logs/auditoria | Retenção definida e cópia protegida |
| Offsite | Cópia cifrada noutro local/dispositivo |
| RPO/RTO | Definidos pela CDA/GigaSystems antes da produção |
| Teste de restauro | Obrigatório antes do go-live e periódico depois |
| Runbook | Procedimento escrito, com responsáveis e tempos |

**Gate:** a Fase 6 não aprova a publicação sem um teste de restauro documentado.
O bundle local deve ser copiado para armazenamento externo antes da Fase 2.

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
| DIV-10 | Sem backup/restauro | Nenhum procedimento operacional | Risco de perda de dados | Backups diários + teste de restauro (secção 9.2) |
| DIV-21 | Carteira profissional duplicada e formato inconsistente | `011801160313` em dois registos; HTML com 12 e 16 dígitos | Registo, CDA Verify e unicidade ficam ambíguos | CDA resolve o conflito; normalizar o formato oficial; só depois criar restrição única |
| DIV-22 | Membro e utilizador confundidos | `Membro` guarda perfil, senha e `is_admin` | Permissões atribuídas por existência de registo | Separar `members` e `users`; papéis explícitos (secção 3.5) |
| DIV-23 | Risco de duplicar documentos na importação | 266 em `documentos.json` + 58 em `dados.js` | 324 registos em vez de 266 | Regra de subconjunto e chave única por ficheiro/checksum (secção 7.2) |

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
| DIV-24 | Fonte canónica dos órgãos não confirmada | `instituicao.html` e `dados.js` divergem em nomes e agrupamento; CDA confirma a composição antes da importação (secção 7.3) |
| DIV-25 | Contratos de autenticação e serviço inexistentes | Fixar sessão web, API pública, serviço Laravel ↔ Python e administração na Fase 1 (secção 6.5) |
| DIV-26 | Ciclo financeiro de quotas indefinido | Modelar emissão, pagamento, reconciliação, recibo e inadimplência antes de implementar (secção 5.1) |
| DIV-27 | CDA Verify reutiliza o perfil público completo | Definir resposta mínima, rate-limit e auditoria próprios (secção 7.4) |
| DIV-28 | Backup Git confundido com backup operacional | Política de backup/restauro com RPO/RTO e teste documentado (secção 9.2) |
| DIV-29 | Múltiplas fontes de verdade para os mesmos dados | PostgreSQL como fonte de metadados; JSON/JS apenas como importação (secção 3.4) |
| DIV-30 | Fronteira Laravel ↔ IA ainda informal | Escopos mínimos, quotas, auditoria e validação de fontes no contrato da Fase 1 (secção 3.6) |

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
- 18 notícias, 8 actividades, 19 entradas de cronologia e 3 presidentes; 15
  pessoas na composição dos órgãos (fonte canónica a confirmar).
- Directório público com 218 registos profissionais e 217 carteiras únicas, com
  filtros e apenas campos públicos. Estes registos não são contas de utilizador.
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
| 0 | Auditoria e matriz | Matriz v1.0 + baseline + tag + bundle externo |
| 1 | Arquitectura e modelação | Sete documentos: arquitectura, dados, API, RBAC, armazenamento, migração e testes |
| 2 | Fundação Laravel | Projecto Laravel 13, auth, RBAC, auditoria, logs, testes base |
| 3 | Website oficial + CMS | Módulo Laravel: páginas, notícias, documentos, media e painel Filament |
| 4 | CRM e membros | Registo/aprovação, perfis, quotas, requerimentos, notificações |
| 5 | IA | Serviço Python integrado, OCR completo, RAG com fontes e controlo de acesso |
| 6 | Testes e publicação | Segurança, migração de dados, desempenho, backups, go-live |

### 12.1 Critérios de aceitação por fase

**Fase 0**

- Matriz v1.0 revista, sem ambiguidade entre 266 e 324 documentos nem entre 218
  registos e 218 contas.
- Baseline `a102920`, tag `baseline-2.0` e testes/datasets verificados.
- Bundle copiado para armazenamento externo e integridade confirmada.
- Aprovação técnica registada; decisões institucionais com responsável e fase.

**Fase 1**

Os sete documentos devem existir e ser revistos em conjunto:

| Documento | Conteúdo mínimo |
|---|---|
| `01-arquitectura.md` | Módulos, contextos, responsabilidades e comunicação entre serviços |
| `02-modelo-dados.md` | ERD, entidades, relações, integridade, índices e regras |
| `03-contratos-api.md` | Laravel ↔ Python, autenticação, payloads, erros, quotas e escopos |
| `04-seguranca-rbac.md` | Papéis, permissões, sessões, auditoria e segregação de funções |
| `05-armazenamento-documental.md` | Object storage, OCR, retenção, backups e restauro |
| `06-plano-migracao-dados.md` | Importação, checksums, ensaios, contagens e rollback |
| `07-testes-aceitacao.md` | Matriz de testes e critérios de aprovação por fase |

Critérios adicionais:

- Modelo de dados cobre todos os módulos e relações.
- Matriz de papéis/permissões aprovada.
- Contratos Laravel ↔ Python documentados (autenticação, pedidos, respostas, erros).
- Política de armazenamento documental definida (object storage, retenção, backups).
- Nenhuma funcionalidade da matriz fica sem destino.
- O ciclo financeiro de quotas está modelado, mesmo que o gateway fique fora de âmbito.
- A arquitectura do website está definida como módulo Laravel, sem solução provisória.

**Fase 2**

- Laravel 13 instala e arranca com PostgreSQL.
- Autenticação, verificação de e-mail, recuperação de senha e logout revogável.
- Papéis e policies testados.
- Auditoria e logs activos.
- CI com PHPUnit/Pest e análise estática.

**Fase 3**

- Website oficial construído directamente no Laravel, como módulo da plataforma.
- 23 páginas equivalentes ou superior, com conteúdo migrado.
- 18 notícias, 8 actividades, 19 entradas de cronologia, 3 presidentes e 15
  pessoas nos órgãos, com fonte canónica confirmada.
- 266 documentos acessíveis e pesquisáveis; os 58 curados actualizados, não
  duplicados.
- CMS permite publicar sem alterar código.
- Upload de PDF aparece no Centro Documental após publicação.
- Não existe site provisório nem segunda reconstrução.

**Fase 4**

- 218 registos profissionais importados; 217 carteiras únicas após resolução do
  duplicado `011801160313` pela CDA.
- Membros e utilizadores separados; nenhuma conta criada automaticamente.
- Registo, aprovação, quotas e requerimentos com testes E2E.
- Ciclo de quotas com estados, pagamentos, recibos e reconciliação.
- Notificações e histórico de processos.
- CDA Verify com resposta mínima, rate-limit e auditoria.

**Fase 5**

- Gate G5 da secção 8.2 cumprido: 266/266 PDFs com texto ou excepção registada.
- Índice cobre todo o acervo público autorizado.
- Assistente responde com fontes e admite quando não sabe.
- Nenhuma chave de IA no frontend.
- Controlo de acesso a documentos privados testado com casos negativos.

**Fase 6**

- Testes funcionais, de segurança e de autorização.
- Migração de dados com contagens e checksums.
- Teste de restauro de backup.
- Teste de carga e latência.
- Plano de rollback e janela de publicação aprovados.

## 13. Decisões pendentes

A aprovação técnica da matriz **não** aprova as decisões institucionais. Cada
linha tem responsável e fase-limite; a ausência de decisão bloqueia a fase
indicada, não a auditoria.

| # | Decisão | Responsável | Necessária antes de | Estado |
|---|---|---|---|---|
| 1 | Aprovar tecnicamente esta matriz v1.0 e o âmbito das sete fases | Equipa técnica + revisão da CDA | Fase 1 | Pendente |
| 2 | Aprovar institucionalmente o âmbito e a publicação da plataforma | CDA | Fase 2 | Pendente |
| 3 | Confirmar alojamento (PHP 8.3+, PostgreSQL, worker, storage, SSL) | GigaSystems/CDA | Fase 2 | Pendente |
| 4 | Definir domínio e subdomínio da API (`api.cda-mz.org`?) | CDA/GigaSystems | Fase 2 | Pendente |
| 5 | Aprovar privacidade do directório (base legal, consentimento, retenção) | CDA | Fase 4 | Pendente |
| 6 | Aprovar política e resposta do CDA Verify | CDA | Fase 4 | Pendente |
| 7 | Decidir se `denunciar.html` se torna canal real (responsável, confidencialidade, fluxo) | CDA | Fase 3/4 | Pendente |
| 8 | Autorizar instalação de `tesseract` e OCR dos 232 PDFs | CDA | Fase 5 | Pendente |
| 9 | Definir retenção documental e política de eliminação | CDA | Fase 1 (desenho) / Fase 6 | Pendente |
| 10 | Escolher object storage vs. disco gerido e política de backup | GigaSystems/CDA | Fase 1 | Pendente |
| 11 | Confirmar que `despachantes.json` e `eventos.json` não entram em produção | CDA/GigaSystems | Fase 3 | Pendente |
| 12 | Decidir se GitHub Pages se mantém em paralelo durante a migração | CDA/GigaSystems | Fase 6 | Pendente |
| 13 | Confirmar método de autenticação de membros (carteira/e-mail, verificação) | CDA | Fase 2 | Pendente |
| 14 | Resolver a carteira duplicada `011801160313` e o formato oficial (12/16 dígitos) | CDA | Fase 4 (importação) | Pendente |
| 15 | Confirmar a fonte canónica da composição dos órgãos 2024–2026 | CDA | Fase 3 | Pendente |
| 16 | Definir RPO/RTO e responsável pelo teste de restauro | CDA/GigaSystems | Produção (Fase 6) | Pendente |

**Regra:** a Fase 2 não começa sem as decisões 1–4; a Fase 4 não importa membros
sem as decisões 5, 6, 13 e 14; a Fase 5 não fecha sem a decisão 8 e o gate G5.

## 14. Riscos principais

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Perda de documentos ou notícias na importação | Média | Alto | Importação idempotente, checksums, contagens, ensaio e rollback |
| Duplicação de documentos (266 + 58 = 324) | Média | Alto | Regra de subconjunto, chave única e validação de contagem (secção 7.2) |
| RAG incompleto por falta de OCR | Alta | Alto | Instalar `tesseract`, processar 232 PDFs, relatório de excepções e gate G5 |
| Exposição de dados pessoais no directório/verify | Média | Alto | Minimização de dados, política de privacidade, revisão legal |
| Permissões atribuídas por registo de membro | Média | Alto | Separar `members` e `users`; papéis explícitos e testes de autorização |
| IA com acesso excessivo à plataforma | Média | Alto | Escopos mínimos, token de serviço, quotas, auditoria e validação de fontes |
| Upload malicioso | Média | Alto | Validação MIME/magic bytes, antivírus, quarentena, limites |
| Regressão funcional durante a migração | Média | Alto | Testes de paridade, staging, publicação faseada |
| Fonte canónica dos órgãos divergente | Média | Médio | Confirmação da CDA antes da importação; não fundir as duas listas |
| Backup apenas local | Média | Alto | Cópia externa do bundle, política de backup e teste de restauro |
| Decisões institucionais atrasam fases | Alta | Médio | Responsável e fase-limite por decisão (secção 13); não iniciar fase bloqueada |
| Bloqueio por decisões de infraestrutura | Média | Médio | Decidir alojamento/domínio antes da Fase 2 |
| Prazo afectado pela cobertura OCR | Alta | Médio | Tratar OCR como fase própria dentro da Fase 5 |

## 15. Próximo passo

1. **Aprovar tecnicamente** esta matriz v1.0. A aprovação técnica fecha a auditoria,
   mas não substitui as decisões institucionais da secção 13.
2. **Copiar o bundle** `~/backups/cda-digital-a102920.bundle` para armazenamento
   externo e verificar a integridade da cópia com `git bundle verify`.
3. **Congelar a matriz** aprovada com tag própria, sem alterar `main` nem a tag
   `baseline-2.0`.
4. **Abrir a Fase 1** com os sete documentos previstos: arquitectura, modelo de
   dados, contratos API, segurança/RBAC, armazenamento documental, plano de
   migração de dados e testes de aceitação.
5. **Só depois** criar o projecto Laravel 13 e iniciar a Fase 2, com alojamento,
   domínio e âmbito institucional decididos.

---

## Anexo A — Registo de revisão v1.0

Revisão técnica de 12 de Novembro de 2026, incorporada sem alterar o inventário
da versão anterior.

| # | Observação da revisão | Tratamento na v1.0 | Secção |
|---|---|---|---|
| 1 | 58 curados poderiam ser somados aos 266 | Regra explícita de subconjunto; 266 a importar; proibido 324 | 7.2, DIV-23 |
| 2 | Fonte canónica dos órgãos indefinida | `instituicao.html` + cartaz como provisória; `dados.js` auxiliar; confirmação da CDA | 7.3, DIV-24 |
| 3 | PostgreSQL local confundido com produção | Tabela ambiente auditado vs. produção; alojamento pendente | 9.1 |
| 4 | Autenticação sem contratos | Quatro planos: sessão web, API pública, serviço e administração | 6.5, DIV-25 |
| 5 | Quotas sem ciclo financeiro | Ciclo de emissão, pagamento, reconciliação, recibo e inadimplência | 5.1, DIV-26 |
| 6 | OCR tratado como melhoria | Requisito obrigatório da Fase 5 com gate G5-01 a G5-08 | 8.2 |
| 7 | Directório e CDA Verify com a mesma exposição | Políticas distintas, resposta mínima e aprovação institucional | 7.4, DIV-27 |
| 8 | Backup Git confundido com backup operacional | Política de backup/restauro, RPO/RTO e teste obrigatório | 9.2, DIV-28 |
| 9 | Fragmentação de fontes de verdade | PostgreSQL para metadados, object storage para ficheiros, IA sobre corpus autorizado | 3.4, DIV-29 |
| 10 | Membros tratados como utilizadores | Separação `members`/`users`; papéis explícitos; sem contas automáticas | 3.5, DIV-22 |
| 11 | IA potencialmente sem fronteira | Laravel autentica, autoriza, aplica quotas e audita; Python recebe escopo mínimo | 3.6, DIV-30 |
| 12 | Fase 1 com cinco documentos | Sete documentos, com dados, RBAC e testes separados | 12.1 |
| 13 | Aprovação técnica e institucional confundidas | Duas aprovações distintas; decisões com responsável e fase-limite | 1.1, 13 |
| 14 | Carteira duplicada e formato inconsistente | Preservar, sinalizar e resolver pela CDA; não deduplicar automaticamente | 7.1, DIV-21 |
| 15 | Contagens ambíguas no README e na matriz | 218 registos/217 carteiras; 58/266; 266 a importar | 2, 7.1, 11 |

### A.1 Verificações executadas

| Verificação | Resultado |
|---|---|
| 58 ficheiros de `dados.js` presentes nos 266 de `documentos.json` | 58/58, zero em falta |
| PDFs fora de `dados.js` | 208 avisos esperados (266 − 58), não são falhas |
| Registos em `membros.json` | 218 |
| Carteiras únicas | 217 |
| Duplicado identificado | `011801160313` (2 registos) |
| Órgãos em `dados.js` / pessoas em `instituicao.html` | 15 / 15, com divergências de agrupamento e nome |
| Rotas de API | 42 (36 em `ia/admin.py`, 6 em `ia/api.py`) |
| Páginas HTML | 23 |
| Chunks BM25 | 1031 |
| OCR | 34/266 com texto; 232 falhas por `tesseract` ausente |
| Suíte de testes | OK (`bash tests/run_tests.sh`) |
| Datasets | PASS 4/4 (`python3 tools/verify_datasets.py`) |

### A.2 Limites desta revisão

- Não foi executada migração de dados nem instalado Laravel.
- As propostas de privacidade, CDA Verify, quotas e autenticação não estão
  aprovadas institucionalmente.
- O bundle ainda não foi copiado para armazenamento externo.
- A composição dos órgãos e a carteira duplicada aguardam confirmação da CDA.

---

## Anexos de referência

- `RELATORIO_TECNICO_COMPLETO.md` — relatório inicial, desactualizado em contagens
  (11 páginas/57 documentos vs. 23/266 actuais); usar apenas como contexto.
- `site/data/README.md` — proveniência e política de privacidade dos datasets.
- `tests/run_tests.sh` — suíte de testes actual.
- `tools/verify_datasets.py` — validação dos datasets.
- `ia/ocr_relatorio.json` — relatório de OCR (quando existir).
