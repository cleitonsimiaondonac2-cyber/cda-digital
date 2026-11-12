# Aprovação técnica — Fase 0

- **Data:** 12 de Novembro de 2026
- **Estado:** Aprovada
- **Âmbito:** matriz de migração v1.0, ADR-0001 e âmbito das sete fases
- **Aprovador:** CDA
- **Documento aprovado:** [`00-matriz-migracao.md`](00-matriz-migracao.md) v1.0
- **Decisão de arquitectura:** [`ADR-0001`](ADR-0001-cda-digital-3.0.md)
- **Commit de referência:** `9a43d69`
- **Tag de congelamento:** `fase-0-aprovada`

## O que foi aprovado

- O inventário da Fase 0 e o âmbito das sete fases.
- O destino **CDA Digital 3.0 — Plataforma de Gestão Institucional**.
- Laravel 13 como núcleo; PostgreSQL como fonte de verdade; Blade/Tailwind;
  Filament a validar na instalação; Python/FastAPI independente para IA, OCR e RAG.
- A separação entre membro institucional, utilizador, operador, administrador e
  superadministrador.
- A regra de que o website é um módulo Laravel, sem website provisório nem segunda
  reconstrução.
- A preservação do CDA Digital 2.0 como baseline e rollback até o 3.0 ser validado.

## Ressalvas

A aprovação é **técnica**. Não substitui as decisões institucionais da secção 13
da matriz, nomeadamente:

- privacidade do directório e política do CDA Verify;
- canal de denúncias;
- autorização de OCR dos 232 PDFs;
- domínio, subdomínio e alojamento de produção;
- retenção documental e política de backup/restauro;
- resolução da carteira duplicada `011801160313`;
- confirmação da fonte canónica dos órgãos sociais.

## Gates que continuam activos

- A **Fase 2** não começa sem alojamento, domínio e âmbito institucional decididos.
- A **Fase 4** não importa membros sem privacidade, CDA Verify, autenticação e
  carteira duplicada resolvidas.
- A **Fase 5** não fecha sem autorização de OCR e cumprimento do gate G5.
- A **Fase 6** não publica sem teste de restauro documentado.
- A cópia do bundle para armazenamento externo continua pendente; não há
  armazenamento externo montado no ambiente actual.

## Consequência

A Fase 1 está aberta. O primeiro entregável é
[`01-arquitectura.md`](01-arquitectura.md); a instalação Laravel continua proibida
até a Fase 1 estar concluída e a Fase 2 autorizada.
