# Datasets do site da CDA

Dados estruturados que alimentam as páginas dinâmicas do portal. **Nenhum
ficheiro desta pasta é escrito à mão** — todos são gerados por scripts em
`tools/`, a partir das fontes do levantamento. Editar à mão aqui é uma forma
guaranteida de perder o trabalho no próximo `build`.

## Inventário

| Ficheiro | Registos | Gerador | O que é |
|----------|---------:|---------|---------|
| `membros.json` | 218 | `tools/build_datasets.py` | Directório de despachantes (pessoas singulares) |
| `eventos.json` | 38 | `tools/build_datasets.py` | Assembleias, reuniões, workshops, cerimónias |
| `timeline.json` | 19 | `tools/build_datasets.py` | Cronologia institucional, 1960–2026 |
| `documentos.json` | 266 | `tools/build_documentos.py` | Índice dos PDFs de `site/docs/` |

Validação: `python3 tools/verify_datasets.py` (saída != 0 se algo falhar).

## Fontes

Todas em `/home/cleiton/Área de Trabalho/Site CDA - Levantamento/`:

| Fonte | Usada para |
|-------|-----------|
| `CDA_membros.csv` | `membros.json` — 219 linhas, das quais 1 é junk (ver D17 abaixo) |
| `CDA_eventos.md` | `eventos.json` — tabela `## 1. TABELA DE EVENTOS` |
| `CDA_RELATORIO_MASTER_SITE.md` (ANEXO A, cronologia) | `timeline.json` |
| `site/docs/*.pdf` | `documentos.json` — metadados derivados **do nome do ficheiro** |

`build_datasets.py` procura as fontes em vários candidatos (`~`, `/home/cleiton`)
porque o `~` do utilizador que corre o script nem sempre é a casa do dono do
projecto.

## Campos

### `membros.json`
`nome` · `nCarta` · `empresa` · `situacao` · `provincia` · `delegacao` · `activo`

- **`nCarta`** é o número da **carteira profissional** — identificador público,
  válido por 12 dígitos. Não confundir com BI.
- `situacao`: Independente · Sócio de Sociedade · Administrador de Empresa ·
  Assalariado (só mercadoria consignada) · Empregado (não submete declarações).
- `delegacao`: Sul (164) · Centro (30) · Norte (24).

### `eventos.json`
`data` (ISO, ou `null`) · `ano` · `dataTxt` (legível, **sempre preenchido**) ·
`tipo` (código) · `tipoLabel` (rótulo em pt-MZ) · `titulo` · `fonte` · `local`

- **`tipoLabel`** existe para que a UI nunca mostre o código cru (`REU`, `AGO`).
  Mapa aplicado: `AGO`→Assembleia Geral Ordinária · `AGE`→Assembleia Geral
  Extraordinária · `AG`→Assembleia Geral · `SES`→Sessão Extraordinária ·
  `REU`→Reunião · `WORK`→Workshop · `WORK/REU`→Reunião / Workshop ·
  `ELE`→Eleições · `COM`→Comemorativo · `INSTITUCIONAL`→Institucional.
- **`local`** só é preenchido quando a fonte o diz (7 de 38 eventos). Nos
  restantes é `null` — preferimos `null` a um palpite.
- **14 eventos não têm data exacta.** Nesses casos `data` é `null`, `ano` pode
  estar preenchido e `dataTxt` explica a situação tal como a fonte a explica
  (ex.: `"Workshop — data a fixar"`, `"Ano de 2025 (dia por definir)"`).
  **Nunca se inventa uma data** para preencher um campo.

### `timeline.json`
`ano` · `data` (ISO ou `null`) · `titulo` · `descricao` · `categoria`

- `categoria`: `legal` · `organizacional` · `actividade` · `digital`.
- Ordenado cronologicamente. Datas só-parciais vão em `ano` com `data: null`.
- Duas entradas partilham o título `Circular 001/CDA` — são eventos distintos e
  legítimos: a circular **fundacional (2013)** e a do **subsídio funerário
  (2022)**. As `descricao` distinguem-nos; a UI deve mostrar sempre o `ano`.

### `documentos.json`
`ficheiro` · `titulo` (normalizado) · `tipo` · `numero` · `ano` · `emissor` ·
`tituloOriginal` (nome exacto em disco)

- **Os metadados são derivados do nome do ficheiro** — sem OCR, sem leitura do
  conteúdo. Quando o nome não diz, o campo é `null`.
  Ex.: `circular-n-002-at-dga-439-2019.pdf` → tipo `Circular`,
  numero `002/AT/DGA/2019`, ano `2019`, emissor `DGA`.
- `tipo` ∈ {Circular, Ordem de Serviço, Comunicado, Estatuto, Regulamento,
  Decreto, Lei, Boletim, Ata, Convocatória, Acta, Relatório, Outro}.
- Distribuição actual: 141 Circular · 67 Ordem de Serviço · 34 Outro ·
  8 Boletim · 8 Convocatória · 2 Lei · 2 Relatório · 1Comunicado ·
  1 Decreto · 1 Estatuto · 1 Regulamento.
- `emissor` vem do nome: `DGA` 173 (173 dos 174 ficheiros com "dga" no nome) ·
  `CDA` 31 · `AT` 2 · `Outro` 1 · `null` 59.

## Política de privacidade

**Publicamos o directório de empresas e sociedades. Não publicamos dados
pessoais de pessoas singulares.**

`CDA_membros.csv` tem 14 colunas. **Sete nunca são publicadas**, e
`verify_datasets.py` falha se alguma delas aparecer:

`Cod_Cedula` (BI) · `NUIT` · `Endereco` · `Tel_Movel` · `Tel_Fixo` · `Fax` ·
`Email`

Motivo: o relatório master (§9.4) é explícito — *«publicar apenas o directório
de empresas/sociedades, nunca dados pessoais de pessoas singulares (NUIT,
moradas, e-mails privados) sem consentimento»*. E-mails e moradas são dados
pessoais; o NUIT é fiscal. Nenhum dos três foi consentido pelos titulares.

O `nCarta` **fica**, por ser a carteira profissional — o identificador que o
despachante apresenta ao cliente e que é o assunto do serviço.

Isto corrige o defeito **D20**, em que e-mails de associados eram publicados
num `.js` servido publicamente.

## Como regenerar

```bash
cd /home/cleiton/projetos-software/cda
python3 tools/build_datasets.py      # membros, eventos, timeline
python3 tools/build_documentos.py    # documentos
python3 tools/verify_datasets.py     # PASS esperado, exit 0
```

Os geradores são determinísticos e reexecutáveis: correm duas vezes, dão o
mesmo resultado.

## Defeitos já corrigidos

- **D17** — a última linha do CSV (`Actualização de Endereço`, todos os campos
  vazios) não é uma pessoa: é um cabeçalho de secção de folha Excel copiado
  para o JSON. Removida. Por isso o número real é **218**, e não 219.
- **D18** — a carteira `011801160313` aparece em **duas** pessoas (Madalena dos
  Anjos Chambul e Sheila Albertina Hassan Mahomed). **Não corrigido
  deliberadamente**: é um erro na fonte, não no código. **Requer decisão do
  cliente.**
- **D21** — `tipo` era um código cru (`REU`, `AGO`, `WORK`…) sem mapa. Corrigido
  com `tipoLabel` nos 38 eventos.