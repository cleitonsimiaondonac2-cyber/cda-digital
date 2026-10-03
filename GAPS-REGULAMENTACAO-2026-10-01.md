# CDA — Análise de Lacunas: Regulamentação no Servidor vs. Site Publicado

**Data:** 2026-10-01
**Fonte do acervo:** `//192.168.100.5/SCAN GERAL` (read-only, `/mnt/scan`)
**Comparado com:** `/home/cleiton/projetos-software/cda/site/docs/` (266 PDFs publicados)
**Inventário de origem:** `/tmp/CDA_comunicados.md`

---

## 1. O que o site JÁ tem (confirmado — bom estado geral)

O site está **significativamente mais desenvolvido** do que a pasta bruta do servidor. Conta com:

| Documento | Ficheiro no site | Estado |
|---|---|---|
| **Estatuto da CDA** | `estatuto-da-cda.pdf` | ✅ presente |
| **Regulamento Interno da CDA** (Ética) | `regulamento-interno-da-cda.pdf` | ✅ presente |
| **Decreto 18/2011** | `decreto-n-18-2011.pdf` | ✅ presente |
| **22 circulares da CDA** | `circular-n-*-cda-*.pdf` | ✅ curadoria bem feita |
| Circulares AT-DGA | ~muitas | ✅ |

### Nota de numeração (verificar!)
O ficheiro **`circularn-12-cda-2015-nova-taxa-de-servio-77mt.pdf`** no site corresponde ao
documento que no servidor está assinado **`Circular nº 015-CDA-2015 — NOVA TAXA DE SERViço 77 MT`**
(`2025 DOCUMENTOS/Circular nº 015-CDA-2015 NOVA TAXA DE SERVICO 77 MT.pdf`).

> ⚠️ **Mesma circular, numeração diferente (012 vs 015).** Confirmar qual é a numeração oficial
> correcta antes de corrigir — o site pode ter normalizado, ou pode haver erro de numeração.
> Há também `circularn-12-cda-2015-nova-taxa.pdf` (possível duplicado do anterior).

---

## 2. LACUNAS CONFIRMADAS (existem no servidor, ausentes no site)

| # | Documento ausente no site | Caminho no servidor | Prioridade |
|---|---|---|---|
| **G1** | **Circular nº 001/CDA/2022 — Subsídio Funerário** | `2025 DOCUMENTOS/CIRCULAR 001CDA 2022-SUBSIDIO FUNERAL CDA.pdf` (+ cópia em `2024 DOCUMENTOS/SCAN/`) | 🔴 **Alta** — benefício social a seluruh o associado |
| **G2** | **Decreto nº 90/2023, de 29 de Dezembro** — Exercício da actividade de Despacho Aduaneiro | `/mnt/scan/Decreto 90-2023 de 29 de Dezembro - Exercicio da actividade de Despacho - Editavel 27.05.doc` (**editável**) | 🔴 **Alta** — regulamento em vigor que regula o acesso à profissão |
| **G3** | **Circular nº 003/CDA/2019 — Crachás** | `2025 DOCUMENTOS/CARTAS CDA/CIRCULAR Nº 03-CDA-2019 CRACHAS.pdf` | 🟠 Média |
| **G4** | **Circular nº 003/CDA/2015 — Taxa de 99 MT** | `2025 DOCUMENTOS/Circular nº 003-CDA-2015 TAXA 99MT.pdf` | 🟠 Média — ⚠️ ver nota de valores em vigor |
| **G5** | **Circular nº 001/CDA/2013** (circular fundacional) | `SCANNER 2025 TODOS OS DOCUMENTOS AQUI/CIRCULAR Nº 001-2013 CDA.pdf` | 🟡 Baixa |

**Verificação negativa (procurado no site, não existe):**
`funeral`/`subsidio` → 0 ficheiros · `honorar` → 0 ficheiros · `decreto` → apenas `decreto-n-18-2011.pdf`

---

## 3. ⛔ NÃO adicionar ao site (decisão deliberada)

| Documento | Motivo |
|---|---|
| **Tabela de Honorários** (proposta 2026) | Ainda em revisão; aguarda parecer da **Autoridade Reguladora da Concorrência**. `Sintese da Reuniao da Tabela de Honorarios dia 30.docx`. **Publicar valores de 2015 como actuais é risco legal/reputacional.** |
| Circulares de taxas 002/2015 (13,5 MT) e 012/2015 (77 MT) | Valores de 2015 — confirmar se ainda vigoram antes de destacar em destaque |
| `Dados Server/Dados Encensiais*.txt` | **CREDENCIAIS** — nunca publicar |
| `Logotipos/`, `Despachantes Falecidos/` | Dados pessoais / direitos de imagem |

---

## 4. Documentos 2026 que VALEM a pena publicar (já extraídos, texto legível)

| Documento | Caminho | Porquê |
|---|---|---|
| **Síntese da Reunião de Revisão dos Estatutos (18/06/2026)** | `SCANNER 2025.../SÍNTESE DA REUNIÃO DE REVISÃO DOS ESTATUTOS DA CDA 18.06.26.docx` | Mostra o Estatuto em revisão — obriga a nota "em revisão" na página do Estatuto |
| **Síntese da Tabela de Honorários (30/06/2026)** | `SCANNER 2025.../Sintese da Reuniao da Tabela de Honorarios dia 30.docx` | Editorial: posição da CDA sobre concurrence desleal, aluguer de senhas |
| **Matriz de Alterações ao Decreto 90/2023** | `/mnt/scan/Matriz Alteracoes Decreto90 (1).docx` | Transparência sobre a negociação com a AT |
| **Proposta de alteração ao Decreto 90/2023** | `/mnt/scan/Proposta de decreto que altera o Decreto 90-2023 ... 08-05-2026 (1).doc` | Antecipa a norma futura |
| **Papel Timbrado (10/06/2026)** | `SCANNER 2025.../PAPEL TIMBRADO,original1 10.06.2026).docx` | Identidade visual oficial |

> 📌 **Ação recomendada:** a página do Estatuto deve exibir um aviso
> *"Estatutos em revisão — ver síntese da reunião de 18/06/2026"*, para não afirmar um diploma
> que a CDA está actively a rever.

---

## 5. 🔴 BLOQUEIO DE IDENTIDADE VISUAL (não resolúvel pelo acervo)

Pesquisa exaustiva em `maxdepth 3` no servidor:

| Padrão | Resultados |
|---|---|
| `*brasao*` | **0** |
| `*selo*` | **0** |
| `*logo*` | apenas logótipos de **associados** + ícones Chrome/Gmail |

> **Não existe ficheiro de logo/brasão da CDA.** O emblema só existe **embutido** no cabeçalho
> do papel timbrado e na capa do `Regulamento Interno da CDA` (pág. 1).
>
> **Acção:** extrair o cabeçalho do `PAPEL TIMBRADO … 10.06.2026).docx` como imagem, ou
> vectorizar a partir da capa do Regulamento Interno. **Isto bloqueia o design do cabeçalho/rodapé
> do site e só se resolve com trabalho de design — não com mais pesquisa no servidor.**

---

## 6. Resumo executivo

| Métrica | Valor |
|---|---|
| Documentos no site | 266 PDFs |
| Circulares CDA no site | 22 (boa curadoria) |
| **Lacunas confirmadas** | **5** (G1–G5) |
| Prioridade alta | **G1** (subsídio funerário), **G2** (Decreto 90/2023) |
| Blockers de conteúdo | OCR em ~80% dos PDFs; **logo/brasão inexistente** |
| Decisões "não publicar" | Tabela de Honorários (em revisão), credenciais, dados pessoais |
