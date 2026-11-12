# Migração CDA Digital 2.0 → Plataforma de Gestão Institucional

Esta pasta contém a documentação interna da migração. **Não faz parte do site
publicado** e não deve ser copiada para `docs/`, que é gerado por `build.sh`.

## Estado actual

| Fase | Estado | Resultado |
|---|---|---|
| 0 — Auditoria e preparação | **Em revisão** | Baseline verificado; matriz de migração pronta para aprovação |
| 1 — Arquitectura e modelação | Não iniciada | Depende da aprovação da Fase 0 |
| 2 — Fundação Laravel | Não iniciada | — |
| 3 — CMS e website | Não iniciada | — |
| 4 — CRM e membros | Não iniciada | — |
| 5 — IA | Não iniciada | — |
| 6 — Testes e publicação | Não iniciada | — |

**Referência estável:** `main` em `a102920` — “Ativar área de membro, painel admin
e chat IA”.

**Referência adicional:** tag local `baseline-2.0` e bundle Git
`~/backups/cda-digital-a102920.bundle` (220 MB, verificado com
`git bundle verify`). O bundle é local; deve ser copiado para armazenamento
externo antes do início da Fase 2.

**Branch de trabalho:** `refatoracao/laravel-13`, criada a partir de `a102920`.
A versão estável em `main` não foi alterada.

## Documentos

| Documento | Estado | Conteúdo |
|---|---|---|
| [`00-matriz-migracao.md`](00-matriz-migracao.md) | Em revisão | Inventário de páginas, funcionalidades, APIs, dados, IA, infraestrutura, dívida técnica e critérios de validação |

Documentos previstos para as fases seguintes:

- `01-arquitectura.md` — módulos, contextos, ERD PostgreSQL, papéis/permissões.
- `02-contratos-api.md` — contratos Laravel ↔ Python.
- `03-armazenamento-documental.md` — object storage, retenção, backups.
- `04-plano-migracao-dados.md` — importação, checksums, ensaios e rollback.
- `05-testes-aceitacao.md` — matriz de testes por fase.

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
| Documentos curados | 58 |
| Membros | 218 |
| Notícias | 18 |
| Actividades | 8 |
| Órgãos | 15 |
| Cronologia | 19 |
| Presidentes | 3 |
| PDFs com texto extraído | 34/266 |
| Chunks BM25 | 1031 |

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

## Revisão da Fase 0 — checklist

Antes de iniciar a Fase 1, confirmar:

- [ ] A matriz cobre todas as 23 páginas e todas as funcionalidades conhecidas.
- [ ] Os 266 PDFs, 218 membros, 18 notícias, 8 actividades, 15 órgãos, 19 entradas
      de cronologia e 3 presidentes estão contabilizados.
- [ ] As lacunas P0 (upload invisível, RAG incompleto, auth duplicada, autorização
      binária, upload pouco validado, privacidade, sessões, força bruta, auditoria,
      backups) estão aceites como âmbito.
- [ ] As decisões pendentes da secção 13 da matriz têm responsável e prazo.
- [ ] O alojamento suporta PHP 8.3+, PostgreSQL, filas e armazenamento.
- [ ] A política de privacidade do directório e do CDA Verify está definida.
- [ ] O OCR dos 232 PDFs em falta está autorizado e calendarizado.

## Próximos passos

1. **Rever e aprovar** `00-matriz-migracao.md`.
2. **Copiar o bundle** `~/backups/cda-digital-a102920.bundle` para armazenamento
   externo (a tag `baseline-2.0` já existe localmente).
3. **Iniciar a Fase 1**: arquitectura, modelo de dados PostgreSQL, papéis e
   permissões, contratos Laravel ↔ Python e estratégia de armazenamento.
4. **Só depois** criar o projecto Laravel 13 e a fundação da Fase 2.

## Notas

- `RELATORIO_TECNICO_COMPLETO.md` é útil como contexto, mas está desactualizado:
  refere 11 páginas e 57 documentos; o sistema actual tem 23 páginas e 266 PDFs.
- `site/data/README.md` documenta a proveniência dos datasets e a política de
  privacidade aplicada ao directório.
- `ia/indice.json`, `ia/texto/`, `ia/.env`, `ia/.auth_secret`, `*.db` e `ia/venv/`
  são artefactos locais ignorados pelo Git; não devem ser commitados.
- `docs/` é uma cópia de deploy; não editar manualmente nem colocar aqui
  documentação interna.
