# RELATÓRIO DE TRABALHO — SITE INSTITUCIONAL CDA

**Data:** 07 de Outubro de 2026  
**Elaborado para:** Direcção da CDA  
**Projecto:** Site Institucional da Câmara dos Despachantes Aduaneiros de Moçambique (CDA)

## 1. INTRODUÇÃO

Este relatório apresenta, de forma clara e objectiva, o estado actual do projecto de redesenho e desenvolvimento do Site Institucional da CDA. Descreve o que já foi realizado desde o início, o que está em andamento e o que ainda falta executar, com indicação de prioridades.

## 2. OBJECTIVO DO TRABALHO

Desenvolver um site institucional moderno, responsivo, acessível e profissional para a CDA, alinhado com a sua identidade corporativa, com estrutura clara de informação, dados organizados e bom desempenho.

## 3. RESUMO EXECUTIVO

**Estado Geral:** Em desenvolvimento — Fundação sólida concluída (70–75% da estrutura base).

- **Concluído (Base Estrutural):** Design System com cores CDA, tipografia profissional, dados institucionais organizados e validados, componentes interativos funcionais.
- **Em Andamento:** Aplicação do novo design às páginas do site.
- **Por Concluir:** Migração completa das restantes páginas para o novo padrão visual.

## 4. O QUE FOI FEITO (Realizado)

### 4.1 Identidade Visual e Design System
- Criado Design System próprio para o projecto (tokens, sistema e layout).
- Definida paleta oficial com cores da CDA (#B71C1C — Vermelho Institucional, #0F3D56 — Azul Naval).
- Implementada tipografia **Manrope** (variável 400–800), auto-hospedada (sem dependência externa).
- Garantida conformidade com requisitos de contraste (WCAG AA) — verificado por script automatizado.
- Criados estilos para componentes reutilizáveis (botões, cards, avisos, separadores/tabs).

### 4.2 Estrutura, Navegação e Interface
- Desenvolvido novo cabeçalho institucional com mega-menu organizado por secções.
- Desenvolvido rodapé institucional completo com contactos e links organizados.
- Implementada caixa de pesquisa global com acessibilidade (teclado, leitor de ecrã, ESC).
- Adicionadas funcionalidades de animação/reveal com bom desempenho.
- Componentes com foco em acessibilidade (ARIA, navegação por teclado).

### 4.3 Dados Institucionais (Base de Dados do Site)
- **Membros/Despachantes:** 218 registos validados, sem dados sensíveis (PII).
- **Eventos:** 38 registos organizados e categorizados.
- **Cronologia/Historial:** 19 registos com base em documentação oficial da CDA.
- **Documentação/PDFs:** 266 documentos mapeados e organizados.
- Todos os conjuntos de dados validados automaticamente (0 erros).

### 4.4 Funcionalidades Desenvolvidas
- **Directório de Membros**: Listagem, pesquisa, filtros e paginação — testado e funcional.
- **Cronologia Institucional**: Apresentação cronológica dos factos mais relevantes — funcional.
- **Galeria de Imagens**: Mosaico responsivo com lightbox acessível — funcional.
- **Separadores (Tabs)**: Componentes reutilizáveis para organização de conteúdos — funcionais.
- **Lógica de dados unificada**: Garantida uma única fonte de dados para evitar inconsistências.

### 4.5 Qualidade, Testes e Documentação
- Testes de links: **0 falhas** detectadas (208 avisos conhecidos, sem impacto funcional).
- Testes funcionais em navegador (Chromium): **58 testes PASS / 0 falhas**.
- Scripts de validação e verificação de contraste criados e a funcionar.
- Código organizado, modular e documentado.
- Relatório técnico detalhado mantido em repositório.

## 5. O QUE ESTÁ EM ANDAMENTO

- **Migração de Páginas ao Novo Design (M4):** Aplicação do novo cabeçalho/rodapé e estrutura do Design System às restantes páginas do site.
- **Estado actual:** Apenas a **Página Inicial (index.html)** foi migrada para o novo padrão. As restantes **14 páginas** encontram-se ainda com estrutura anterior, aguardando aplicação do novo layout.

## 6. O QUE FALTA FAZER (Por Concluir)

| Item | Prioridade | Descrição |
|---|---|---|
| **1. Migrar 14 páginas restantes** | **ALTA (Mais Urgente)** | Aplicar header/footer + Design System em: Instituição, Órgãos Sociais, Actividades, Notícias, Anúncios, Documentação, Despachantes, Parceiros, Associar-se, Contactos, Galeria, Estatutos, Regulamentos. |
| **2. Garantir estrutura semântica** | ALTA | Aplicar `<main>`, skip-link e estrutura acessível em todas as páginas. |
| **3. Porting seletivo v3** (UX Leitura) | MÉDIA | Melhorias de leitura/editorial (baixo risco, bom valor para o utilizador). |
| **4. Verificação Profissionais (v4)** | MÉDIA | Página de verificação — integrar com backend existente de forma controlada. |
| **5. Completar mapeamento PDFs** | BAIXA–MÉDIA | Reduzir avisos de PDFs não declarados (sem impacto funcional). |
| **6. Acervo Fotográfico** | BAIXA | Integração futura do acervo (865 imagens) na Galeria (fora do repositório por dimensão). |

## 7. CRONOGRAMA POR FASES (Dias Úteis)

| Fase | Actividades | Estado |
|---|---|---|
| **Fase 1 — Fundação** (22–23/09) | Identidade, logos, notícias, parceiros | **Concluída** |
| **Fase 2 — Levantamento** (01–03/10) | Acervo, dados, auditoria técnica | **Concluída** |
| **Fase 3 — Design System + Base Técnica** (06/10) | Tokens, layout, componentes, datasets validados, testes | **Concluída** |
| **Fase 4 — Migração de Páginas** (Pendente) | Aplicar novo design às 14 páginas restantes | **Em Andamento (1/15)** |
| **Fase 5 — Polimento e Homologação** (Após Fase 4) | Revisões, testes finais, build/produção | **A Iniciar** |

*Obs.: Trabalho de Sábado foi consolidado em Sexta-feira. Sábado e Domingo não considerados dias de trabalho.*

## 8. INDICADOR DE CONCLUSÃO

| Critério | Progresso |
|---|---|
| **Estrutura Base (Design System + Dados + Componentes)** | **100% Concluído** |
| **Páginas Migradas para Novo Design** | **1 de 15 (6,7%)** |
| **Progresso Global Estimado** | **~75% Concluído** |

## 9. RECOMENDAÇÃO

**Prioridade Imediata:** Concluir **Fase 4 (Migração das 14 páginas restantes)**. Esta é a tarefa mais urgente para uniformizar todo o site com o novo padrão visual e identidade da CDA, permitindo avançar para polimento final e disponibilização.

## 10. CONCLUSÃO

O projecto encontra-se numa fase sólida e bem estruturada. A base técnica, os dados e o Design System estão completamente definidos e validados. O trabalho restante é essencialmente de **aplicação do design já aprovado** às páginas existentes, o que permitirá concluir o site de forma consistente e profissional.

**Responsável Técnico:** Equipa de Desenvolvimento  
**Data de Emissão:** 07/10/2026
