# ADR-0001 — CDA Digital 3.0 como destino definitivo

- **Estado:** Aceite
- **Data:** 12 de Novembro de 2026
- **Decisores:** CDA
- **Consulta técnica:** GigaSystems
- **Âmbito:** identidade do produto, arquitectura e sequência de migração
- **Relacionado:** [`00-matriz-migracao.md`](00-matriz-migracao.md), [`README.md`](README.md)

## Contexto

O CDA Digital 2.0 é a implementação actual: website estático, dados em JSON/JS e
um backend Python/FastAPI para membros, administração e IA. A migração foi
apresentada como “CDA Digital 2.0 → Plataforma de Gestão Institucional”. Essa
formulação é ambígua: pode sugerir duas entregas independentes — um website e uma
plataforma — ou uma reconstrução posterior do website.

A CDA decidiu que o destino é uma única plataforma integrada. O website oficial
não é um produto separado nem uma etapa provisória.

## Decisão

1. O destino definitivo é **CDA Digital 3.0 — Plataforma de Gestão
   Institucional**.
2. **Laravel 13** é o núcleo da plataforma: website, CMS, membros, administração,
   documentos, autenticação, permissões, auditoria e APIs.
3. O **website oficial é um módulo da plataforma**, desenvolvido directamente em
   Laravel/Blade. Não é construído fora do Laravel para depois ser migrado.
4. **Não haverá website provisório nem segunda reconstrução.** A implementação
   actual não é descartada: é inventariada, migrada e validada.
5. **PostgreSQL** é a fonte de verdade dos metadados e relações institucionais.
   Os ficheiros documentais vivem em armazenamento gerido com checksum.
6. **Python/FastAPI** continua independente para IA, OCR e RAG, integrado por
   APIs autenticadas. Não é um segundo backend geral nem tem acesso irrestrito à
   plataforma.
7. O **CDA Digital 2.0 permanece preservado** como baseline e referência de
   recuperação até o 3.0 estar validado e pronto para assumir a produção.
8. A sequência mantém-se: Fase 0 (auditoria e aprovação), Fase 1 (arquitectura e
   modelação), Fase 2 (fundação Laravel), Fase 3 (CMS e website), Fase 4 (CRM e
   membros), Fase 5 (IA) e Fase 6 (testes e publicação).

## Consequências

- A Fase 1 começa pela arquitectura, modelo de dados, RBAC, contratos API e
  armazenamento — não pelas páginas do website.
- A Fase 3 implementa o website directamente no Laravel, reutilizando o
  inventário e os conteúdos da Fase 0.
- O inventário da Fase 0 é a lista de paridade funcional e editorial; nenhuma
  funcionalidade é descartada sem decisão registada.
- A publicação do 3.0 só acontece depois dos critérios de qualidade, segurança,
  migração e aceitação.
- O rollback para o 2.0 continua possível enquanto o 3.0 não assumir a produção.
- Novas páginas, menus e conteúdos entram no CMS da plataforma; não são criados
  como HTML estático paralelo.

## Não-objectivos

- Manter o 2.0 como produto paralelo depois da entrada em produção do 3.0.
- Construir um website “provisório” fora do Laravel.
- Começar pelas páginas antes de decidir membros, documentos, autenticação,
  permissões e modelo de dados.
- Dar à IA acesso directo à base de dados ou permissão para alterar registos
  institucionais.
- Duplicar documentos ou membros em fontes de verdade concorrentes.

## Verificação

- A documentação do projecto usa “CDA Digital 3.0” como destino definitivo.
- A Fase 1 produz os sete documentos de arquitectura e modelação antes de
  qualquer instalação Laravel.
- A Fase 3 tem como critério a construção directa do website no Laravel.
- O baseline `a102920`, a tag `baseline-2.0` e o bundle continuam preservados.
- Nenhuma decisão deste ADR altera `main` nem inicia a Fase 2.
