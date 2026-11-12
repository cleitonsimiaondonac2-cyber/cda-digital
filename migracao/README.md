# CDA Digital 3.0 — Plataforma de Gestão Institucional

Documentação interna da migração a partir do CDA Digital 2.0. O destino é uma
única plataforma integrada, não duas versões independentes. Ver
[`ADR-0001`](ADR-0001-cda-digital-3.0.md).

Esta pasta contém a documentação interna da migração. **Não faz parte do site
publicado** e não deve ser copiada para `docs/`, que é gerado por `build.sh`.

## Decisão arquitectónica

- **Destino:** CDA Digital 3.0 — Plataforma de Gestão Institucional.
- **Núcleo:** Laravel 13 (website, CMS, membros, administração, documentos,
  autenticação, permissões, auditoria e APIs).
- **Dados:** PostgreSQL como fonte de verdade; ficheiros em armazenamento gerido.
- **IA:** Python/FastAPI independente, integrado por APIs autenticadas.
- **Website:** módulo da plataforma, construído directamente em Laravel/Blade.
- **Proibido:** website provisório e segunda reconstrução do website.
- **Baseline:** o CDA Digital 2.0 permanece preservado até o 3.0 ser validado e
  assumir a produção.

A ordem é deliberada: primeiro arquitectura e modelação; depois fundação Laravel;
só então CMS, website, membros e IA.

## Estado actual

| Fase | Estado | Resultado |
|---|---|---|
| 0 — Auditoria e preparação | **Aprovada tecnicamente** | Matriz v1.0 aprovada e congelada; falta cópia externa do bundle |
| 1 — Arquitectura e modelação | **Aberta** | `01-arquitectura.md` em produção; documentos 02–07 pendentes |
| 2 — Fundação Laravel | Não iniciada | Depende da conclusão da Fase 1 |
| 3 — Website + CMS | Não iniciada | Website oficial como módulo Laravel, sem site provisório |
| 4 — CRM e membros | Não iniciada | — |
| 5 — IA | Não iniciada | — |
| 6 — Testes e publicação | Não iniciada | — |

**Referência estável:** `main` em `a102920` — “Ativar área de membro, painel admin
e chat IA”.

**Referência adicional:** tag `baseline-2.0` (local e `origin`) e bundle Git
`~/backups/cda-digital-a102920.bundle` (220 MB, verificado com
`git bundle verify`). O bundle é local; deve ser copiado para armazenamento
externo antes do início da Fase 2.

**Branch de trabalho:** `refatoracao/laravel-13`, criada a partir de `a102920`.
A versão estável em `main` não foi alterada.

## Documentos

| Documento | Estado | Conteúdo |
|---|---|---|
| [`ADR-0001-cda-digital-3.0.md`](ADR-0001-cda-digital-3.0.md) | Aceite | Destino definitivo, identidade do produto e proibição de website provisório |
| [`APROVACAO-FASE-0.md`](APROVACAO-FASE-0.md) | Aprovado | Registo formal da aprovação técnica, ressalvas e gates |
| [`00-matriz-migracao.md`](00-matriz-migracao.md) | v1.0, aprovada | Inventário de páginas, funcionalidades, APIs, dados, IA, infraestrutura, dívida técnica e critérios de validação |
| [`01-arquitectura.md`](01-arquitectura.md) | Rascunho | Arquitectura geral, módulos, fronteiras e comunicação entre serviços |

Documentos previstos para a Fase 1:

| Documento | Finalidade | Estado |
|---|---|---|
| `01-arquitectura.md` | Arquitectura geral, módulos e comunicação entre serviços | Rascunho |
| `02-modelo-dados.md` | ERD, entidades, relações, integridade e índices PostgreSQL | Pendente |
| `03-contratos-api.md` | Laravel ↔ Python: autenticação, payloads, erros, quotas e escopos | Pendente |
| `04-seguranca-rbac.md` | Papéis, permissões, sessões, auditoria e segregação de funções | Pendente |
| `05-armazenamento-documental.md` | Object storage, OCR, retenção, backups e restauro | Pendente |
| `06-plano-migracao-dados.md` | Importação, checksums, ensaios, contagens e rollback | Pendente |
| `07-testes-aceitacao.md` | Matriz de testes e critérios de aprovação por fase | Pendente |

## Aprovação técnica vs. institucional

São duas aprovações distintas:

| Aprovação | O que valida | Estado |
|---|---|---|
| **Técnica** | Inventário, âmbito, lacunas e critérios de migração | **Aprovada em 12/11/2026** — ver `APROVACAO-FASE-0.md` |
| **Institucional** | Privacidade, CDA Verify, denúncias, OCR, domínio, alojamento e retenção | Pendente; ver secção 13 da matriz |

A aprovação técnica permitiu fechar a auditoria e abrir a Fase 1. Não autoriza
tratar dados de membros, activar o CDA Verify, publicar denúncias, executar OCR
em massa nem contratar alojamento.

## Baseline verificado

Executado em 12/11/2026, no commit `a102920`:

```bash
cd ~/cda-digital
bash tests/run_tests.sh          # suíte completa: OK
python3 tools/verify_datasets.py # PASS (4/4)
```

| Indicador | Valor |
|---|---:|
| Páginas HTML | 23 |
| Ficheiros JS | 18 |
| PDFs | 266 |
| Documentos curados | 58 (subconjunto dos 266; não somar) |
| Registos de membros | 218 |
| Carteiras únicas | 217 |
| Notícias | 18 |
| Actividades | 8 |
| Órgãos | 15 pessoas (fonte canónica a confirmar) |
| Cronologia | 19 |
| Presidentes | 3 |
| PDFs com texto extraído | 34/266 |
| Chunks BM25 | 1031 |

> Os 218 são registos profissionais do directório, não 218 contas de utilizador.
> O universo documental a importar é **266**, não 324.

## Decisões já tomadas

- **Backend principal:** Laravel 13 (PHP 8.3–8.5; suporte de segurança até 2028).
- **Base de dados:** PostgreSQL 16+.
- **Frontend:** Blade + Tailwind/CSS actual; sem Vue/React nesta fase.
- **Administração:** Filament 5, a validar na instalação (requer Laravel 11.28+,
  Livewire 4 e Tailwind 4.1+).
- **IA:** serviço Python/FastAPI independente, com APIs autenticadas.
- **Repositório:** `git@github.com:cleitonsimiaondonac2-cyber/cda-digital.git`.
- **Documentação interna:** nesta pasta; `docs/` continua a ser apenas o deploy
  gerado por `build.sh`.

## Regras do projecto

1. Não eliminar funcionalidades, documentos, notícias ou registos sem decisão
   explícita.
2. Não misturar dados reais com dados de demonstração.
3. Não colocar credenciais ou chaves de IA no frontend.
4. Validar uploads no servidor (extensão, MIME, magic bytes, tamanho, malware).
5. Não publicar sem testes, backup e plano de rollback.
6. Cada fase termina com um resultado verificável e aprovado.
7. A versão estável em `main` permanece intacta durante a migração.
8. PostgreSQL é a fonte de verdade dos metadados; JSON/JS antigos são fontes de
   importação, não destinos.
9. Membro institucional, utilizador, operador e administrador são entidades
   distintas; permissões vêm de papéis, não do registo de membro.
10. A IA recebe apenas o corpus e as operações autorizadas pelo Laravel.
11. O website é um módulo do CDA Digital 3.0; não existe versão provisória nem
    segunda reconstrução.
12. O CDA Digital 2.0 permanece como baseline e rollback até o 3.0 ser validado.

## Revisão da Fase 0 — checklist

Estado após aprovação técnica de 12/11/2026:

- [x] A matriz cobre todas as 23 páginas e todas as funcionalidades conhecidas.
- [x] O destino CDA Digital 3.0 e a proibição de website provisório estão
      registados no ADR-0001 e reflectidos na Fase 3.
- [x] Os 266 PDFs (58 curados como subconjunto), 218 registos de membros (217
      carteiras únicas), 18 notícias, 8 actividades, 15 pessoas nos órgãos, 19
      entradas de cronologia e 3 presidentes estão contabilizados.
- [x] As lacunas P0 (upload invisível, RAG incompleto, auth duplicada, autorização
      binária, upload pouco validado, privacidade, sessões, força bruta, auditoria,
      backups, carteira duplicada, membro/utilizador, duplicação documental) estão
      aceites como âmbito.
- [x] As decisões pendentes da secção 13 da matriz têm responsável e fase-limite.
- [x] A aprovação técnica está registada e separada das decisões institucionais.
- [ ] O alojamento suporta PHP 8.3+, PostgreSQL, filas e armazenamento.
- [ ] A política de privacidade do directório e do CDA Verify está definida.
- [ ] O OCR dos 232 PDFs em falta está autorizado e calendarizado.
- [ ] O bundle foi copiado para armazenamento externo e a cópia foi verificada.

## Próximos passos

1. [x] **Aprovar tecnicamente** a matriz v1.0 e congelá-la com a tag
   `fase-0-aprovada` (commit de aprovação).
2. [ ] **Copiar o bundle** `~/backups/cda-digital-a102920.bundle` para
   armazenamento externo e verificar a integridade. Bloqueado: não há
   armazenamento externo montado no ambiente actual.
3. [x] **Abrir a Fase 1** com os sete documentos. `01-arquitectura.md` está em
   rascunho; `02`–`07` seguem por ordem de dependência.
4. [ ] **Só depois** criar o projecto Laravel 13 e a fundação da Fase 2, com
   alojamento, domínio e âmbito institucional decididos.

## Notas

- `RELATORIO_TECNICO_COMPLETO.md` é útil como contexto, mas está desactualizado:
  refere 11 páginas e 57 documentos; o sistema actual tem 23 páginas e 266 PDFs.
- `site/data/README.md` documenta a proveniência dos datasets e a política de
  privacidade aplicada ao directório.
- `ia/indice.json`, `ia/texto/`, `ia/.env`, `ia/.auth_secret`, `*.db` e `ia/venv/`
  são artefactos locais ignorados pelo Git; não devem ser commitados.
- `docs/` é uma cópia de deploy; não editar manualmente nem colocar aqui
  documentação interna.
