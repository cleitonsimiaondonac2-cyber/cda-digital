#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_contrast.py — auditoria de contraste WCAG 2.x do design system da CDA.

Lê `site/css/tokens.css`, extrai as custom properties (resolvendo referências
`var()`) e calcula o rácio de contraste real de cada par texto/fundo definido em
PARES. Imprime uma tabela e sai com código != 0 se algum par de TEXTO NORMAL
(< 18.66px bold) falhar 4.5:1.

Uso:
    python3 tools/verify_contrast.py              # tabela + exit != 0 se falhar
    python3 tools/verify_contrast.py --selftest   # auto-teste (cores sabidas)
    python3 tools/verify_contrast.py --json       # tabela + JSON (para CI)

Referências:
  - WCAG 2.2 §1.4.3 Contrast (Minimum): 4.5:1 texto normal, 3:1 texto grande
    (>= 18.66px bold ou >= 24px) e componente de interface.
  - WCAG 2.2 §1.4.11 Non-text Contrast: 3:1 para indicadores e componentes.
  - WCAG 2.2 §1.4.6 Contrast (Enhanced): 7:1 (AAA).
  - Luminância relativa sRGB conforme a definição WCAG 2.x.
"""

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TOKENS = RAIZ / "site" / "css" / "tokens.css"

# Limiares WCAG
AA_NORMAL = 4.5   # texto normal
AA_LARGE = 3.0    # texto grande (>= 18.66px bold / >= 24px) e UI/componentes
AAA = 7.0

# Profundidade máxima ao resolver var() (evita ciclos infinitos)
MAX_PROFUNDIDADE = 16

# Tolerância de arredondamento dos rácio (2 casas decimais)
TOLERANCIA = 0.005

RE_COMENTARIO = re.compile(r"/\*.*?\*/", re.S)
RE_DECL = re.compile(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+);")
RE_HEX = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")
RE_VAR = re.compile(r"var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,[^()]*)?\)")

NOMES = {
    "white": (255, 255, 255),
    "black": (0, 0, 0),
}


# ---------------------------------------------------------------------------
# 1. LEITURA E RESOLUÇÃO DE VARIÁVEIS
# ---------------------------------------------------------------------------
def varrer_root(css: str) -> dict:
    """Devolve as declarações :root que estão FORA de qualquer @media.

    Percorre a folha carácter a carácter com uma pilha de blocos, para saber a
    que profundidade está cada regra. Um regex não aninhado não serve: o
    `:root` dentro de `@media (prefers-contrast: more)` tem de ser excluído,
    porque o que auditamos é a folha tal como é servida por omissão.
    """
    tokens: dict = {}
    pilha: list = []      # elementos: ("media",) | ("sel", seletor) | ("outro",)
    inicio_corpo = None   # índice da '{' do bloco :root aberto
    buffer = ""

    for i, c in enumerate(css):
        if inicio_corpo is None and c == "{":
            sel = buffer.strip()
            buffer = ""
            dentro_media = any(p[0] == "media" for p in pilha)
            if sel.lower().startswith("@media"):
                pilha.append(("media",))
            elif dentro_media:
                pilha.append(("outro",))
            elif sel == ":root":
                pilha.append(("sel", ":root"))
                inicio_corpo = i
            else:
                pilha.append(("outro",))
        elif c == "}":
            if inicio_corpo is not None:
                corpo = css[inicio_corpo + 1:i]
                for nome, valor in RE_DECL.findall(corpo):
                    tokens[nome] = " ".join(valor.split())
                inicio_corpo = None
                buffer = ""
            if pilha:
                pilha.pop()
            buffer = ""
        elif inicio_corpo is None:
            buffer += c

    return tokens


def ler_tokens(caminho: Path) -> dict:
    css = caminho.read_text(encoding="utf-8")
    return varrer_root(RE_COMENTARIO.sub("", css))


def resolver(tokens: dict, nome: str, profundidade: int = 0, visto=None) -> str:
    """Resolve o valor de `nome`, expandindo var(--x) recursivamente."""
    if profundidade > MAX_PROFUNDIDADE:
        raise RecursionError(f"profundidade de var() excedida em {nome}")
    visto = set() if visto is None else visto
    if nome in visto:
        raise RecursionError(f"ciclo de variáveis em {nome}")
    if nome not in tokens:
        raise KeyError(f"variável não definida: {nome}")

    def sub(m):
        return resolver(tokens, m.group(1), profundidade + 1, visto | {nome})

    return RE_VAR.sub(sub, tokens[nome]).strip()


# ---------------------------------------------------------------------------
# 2. CORES
# ---------------------------------------------------------------------------
def para_rgb(valor: str):
    """Converte '#rgb', '#rrggbb', '#rrggbbaa', 'white', 'black' -> (r, g, b)."""
    v = valor.strip()
    if RE_HEX.match(v):
        h = v[1:]
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    if v.lower() in NOMES:
        return NOMES[v.lower()]
    raise ValueError(f"cor não suportada: {valor!r}")


def luminancia(cor) -> float:
    """Luminância relativa WCAG 2.x (canais sRGB 0..255 -> 0..1)."""
    canais = []
    for c in cor:
        s = c / 255.0
        canais.append(s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4)
    r, g, b = canais
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(cor_a, cor_b) -> float:
    """Rácio de contraste WCAG 2.x entre duas cores opacas."""
    la, lb = luminancia(cor_a), luminancia(cor_b)
    claro, escuro = (la, lb) if la >= lb else (lb, la)
    return (claro + 0.05) / (escuro + 0.05)


# ---------------------------------------------------------------------------
# 3. PARES AUDITADOS
# ---------------------------------------------------------------------------
# (rótulo, foreground, background, tamanho)
#   tamanho "normal" -> 4.5:1  (texto corrente)
#   tamanho "grande" -> 3.0:1  (>= 18.66px bold ou >= 24px)
#   tamanho "ui"     -> 3.0:1  (componente/interface: borda, foco, separador)
# foreground/background: "#fff"/"white" literal, ou "--token" de tokens.css.
PARES = [
    # --- Corpo de texto sobre superfícies claras ----------------------------
    ("texto principal sobre página (branco)", "--text-primary", "--surface-page", "normal"),
    ("texto principal sobre secção subtle", "--text-primary", "--surface-subtle", "normal"),
    ("texto principal sobre secção muted", "--text-primary", "--surface-muted", "normal"),
    ("texto secundário sobre página (branco)", "--text-secondary", "--surface-page", "normal"),
    ("texto secundário sobre secção subtle", "--text-secondary", "--surface-subtle", "normal"),
    ("texto secundário sobre secção muted", "--text-secondary", "--surface-muted", "normal"),
    ("ink-900 sobre fundo branco", "--cda-ink-900", "--surface-page", "normal"),
    ("ink-800 sobre fundo branco", "--cda-ink-800", "--surface-page", "normal"),
    ("ink-700 sobre fundo branco", "--cda-ink-700", "--surface-page", "normal"),
    ("ink-600 (texto secundário) sobre branco", "--cda-ink-600", "--surface-page", "normal"),
    ("ink-600 sobre navy-50", "--cda-ink-600", "--cda-navy-50", "normal"),
    ("ink-600 sobre navy-100", "--cda-ink-600", "--cda-navy-100", "normal"),
    ("ink-500 (placeholder) sobre branco", "--cda-ink-500", "--surface-page", "normal"),
    ("ink-400 (separador breadcrumb) sobre branco", "--cda-ink-400", "--surface-page", "ui"),

    # --- Texto claro sobre superfícies escuras ------------------------------
    ("texto inverso sobre surface-inverse", "--text-inverse", "--surface-inverse", "normal"),
    ("texto inverso sobre surface-inverse-2", "--text-inverse", "--surface-inverse-2", "normal"),
    ("texto inverso sobre navy-900", "--text-inverse", "--cda-navy-900", "normal"),
    ("texto inverso sobre navy-800", "--text-inverse", "--cda-navy-800", "normal"),
    ("texto inverso sobre navy-700", "--text-inverse", "--cda-navy-700", "normal"),
    ("texto inverso sobre red-800", "--text-inverse", "--cda-red-800", "normal"),
    ("texto inverso sobre red-900", "--text-inverse", "--cda-red-900", "normal"),
    ("texto inverso sobre red-700", "--text-inverse", "--cda-red-700", "normal"),

    # --- Branco sobre a escala vermelha (CTAs, botões, badges) --------------
    ("branco sobre red-500", "#ffffff", "--cda-red-500", "normal"),
    ("branco sobre red-600 (accent)", "--text-on-red", "--cda-red-600", "normal"),
    ("branco sobre red-700 (accent-hover)", "--text-on-red", "--cda-red-700", "normal"),
    ("vermelho red-600 sobre branco (link/accordeão)", "--cda-red-600", "--surface-page", "normal"),
    ("vermelho red-700 sobre branco (hover)", "--cda-red-700", "--surface-page", "normal"),
    ("vermelho red-500 sobre branco", "--cda-red-500", "--surface-page", "normal"),
    ("vermelho red-800 sobre branco", "--cda-red-800", "--surface-page", "normal"),

    # --- Badges -------------------------------------------------------------
    ("badge red-800 sobre red-100", "--cda-red-800", "--cda-red-100", "normal"),
    ("badge green-600 sobre green-100", "--cda-green-600", "--cda-green-100", "normal"),
    ("badge amber-600 sobre amber-100", "--cda-amber-600", "--cda-amber-100", "normal"),
    ("badge navy-800 sobre navy-100", "--cda-navy-800", "--cda-navy-100", "normal"),
    ("badge outline navy-700 sobre branco", "--cda-navy-700", "--surface-page", "normal"),

    # --- Callouts -----------------------------------------------------------
    ("callout warn: ink-900 sobre amber-100", "--cda-ink-900", "--cda-amber-100", "normal"),
    ("callout ok: ink-900 sobre green-100", "--cda-ink-900", "--cda-green-100", "normal"),

    # --- Links --------------------------------------------------------------
    ("link sobre branco", "--link", "--surface-page", "normal"),
    ("link sobre secção subtle", "--link", "--surface-subtle", "normal"),
    ("link sobre secção muted", "--link", "--surface-muted", "normal"),
    ("link-hover sobre branco", "--link-hover", "--surface-page", "normal"),

    # --- Foco (WCAG 2.2 1.4.11 -> 3:1) --------------------------------------
    # O indicador de foco é um anel DUPLO (implementado em sistema.css:66-76):
    #   · fundo claro  -> anel EXTERIOR --cda-ink-900 (5px) + interior amarelo
    #   · fundo escuro (.on-dark / .hero / .footer) -> anel EXTERIOR amarelo (3px) + interior preto
    # Cada anel é medido contra o fundo a que está realmente adjacente — medir o
    # anel exterior contra um fundo onde ele não existe daria um falso negativo.
    ("anel exterior ink-900 sobre fundo claro (branco)", "--cda-ink-900", "--surface-page", "ui"),
    ("anel exterior ink-900 sobre fundo claro (secção)", "--cda-ink-900", "--surface-subtle", "ui"),
    ("anel exterior amarelo sobre fundo escuro (navy-900)", "--focus", "--cda-navy-900", "ui"),
    ("anel exterior amarelo sobre fundo escuro (navy-800)", "--focus", "--cda-navy-800", "ui"),
    ("fronteira entre os dois anéis (amarelo vs ink-900)", "--focus", "--cda-ink-900", "ui"),
    ("focus-text ink-900 sobre foco amarelo", "--focus-text", "--focus", "normal"),

    # --- Bordas / componentes de interface (3:1) ----------------------------
    ("border-strong ink-700 sobre branco", "--border-strong", "--surface-page", "ui"),
    ("border-default navy-400 sobre branco", "--border-default", "--surface-page", "ui"),
    ("border-default navy-400 sobre fundo claro (secção)", "--border-default", "--surface-subtle", "ui"),
    ("border-subtle navy-200 sobre branco (divisores, decorativo)", "--border-subtle", "--surface-page", "ui"),
]


# ---------------------------------------------------------------------------
# 4. AVALIAÇÃO
# ---------------------------------------------------------------------------
def valor_de(ref: str, tokens: dict) -> str:
    """Valor de `ref`: cor literal (#fff, white) ou token var(--x) já expandido."""
    if ref.startswith("#") or ref.lower() in NOMES:
        return ref
    return resolver(tokens, ref)


def avaliar(par, tokens: dict) -> dict:
    rotulo, fg_nome, bg_nome, tamanho = par
    valor_fg = valor_de(fg_nome, tokens)
    valor_bg = valor_de(bg_nome, tokens)
    rgb_fg = para_rgb(valor_fg)
    rgb_bg = para_rgb(valor_bg)
    r = contraste(rgb_fg, rgb_bg)
    limiar = AA_NORMAL if tamanho == "normal" else AA_LARGE
    return {
        "rotulo": rotulo,
        "foreground": fg_nome,
        "background": bg_nome,
        "fg": valor_fg,
        "bg": valor_bg,
        "rgb_fg": rgb_fg,
        "rgb_bg": rgb_bg,
        "tamanho": tamanho,
        "raio": r,
        "limiar": limiar,
        "aa": r >= limiar - TOLERANCIA,
        "aaa": r >= AAA - TOLERANCIA,
    }


def avaliar_todos(tokens: dict) -> list:
    return [avaliar(p, tokens) for p in PARES]


def imprimir(resultados: list):
    print("=" * 100)
    print("CDA — auditoria de contraste WCAG 2.x   (fonte: site/css/tokens.css)")
    print("=" * 100)
    print(f"{'PAR':46} {'FG / BG':21} {'RATIO':>8}  {'AA':5} {'AAA':5}  LIMIAR")
    print("-" * 100)
    for r in resultados:
        cores = f"{r['fg']} / {r['bg']}"
        print(f"{r['rotulo']:46} {cores:21} {r['raio']:7.2f}:1  "
              f"{'PASS' if r['aa'] else 'FALHA':5} {'PASS' if r['aaa'] else 'FALHA':5}  "
              f"{r['limiar']:.1f} ({r['tamanho']})")
    print("-" * 100)

    falhas = [r for r in resultados if not r["aa"]]
    normais = [r for r in resultados if r["tamanho"] == "normal"]
    normais_falha = [r for r in falhas if r["tamanho"] == "normal"]
    ui_falha = [r for r in falhas if r["tamanho"] != "normal"]
    total = len(resultados)

    print(f"RESUMO: {total - len(falhas)}/{total} pares passam AA · "
          f"{sum(1 for r in resultados if r['aaa'])}/{total} passam AAA")
    print(f"        texto normal (< 18.66px bold): {len(normais) - len(normais_falha)}/{len(normais)} passam 4.5:1")
    if normais_falha:
        print(f"        FALHAS AA TEXTO NORMAL ({len(normais_falha)}):")
        for r in normais_falha:
            print(f"          x {r['rotulo']} — {r['raio']:.2f}:1 (min {r['limiar']:.1f}:1) "
                  f"[{r['fg']} sobre {r['bg']}]")
    if ui_falha:
        print(f"        AVISOS 3:1 UI/BORDAS ({len(ui_falha)}):")
        for r in ui_falha:
            print(f"          ! {r['rotulo']} — {r['raio']:.2f}:1 (min {r['limiar']:.1f}:1)")
    if not normais_falha and not ui_falha:
        print("        TODOS OS PARES PASSAM (AA; 3:1 onde é UI).")
    print("=" * 100)
    return normais_falha, ui_falha


# ---------------------------------------------------------------------------
# 5. AUTO-TESTE — prova de que o cálculo e o detector funcionam
# ---------------------------------------------------------------------------
def selftest() -> int:
    """Valida contraste(), resolução de var(), exclusão de @media e o exit code.

    Valores de referência (o 1.º, 2.º e 3.º são widely publicados; os restantes
    foram calculados de forma independente com a mesma fórmula WCAG):
      preto sobre branco     = 21.00:1  (máximo matemático)
      #767676 sobre #ffffff  =  4.54:1  (mínimo AA clássico do GOV.UK)
      #777777 sobre #ffffff  =  4.48:1  -> FALHA (o caso que provamos detectar)
      #949494 sobre #ffffff  =  3.03:1  -> passa 3:1 (UI), falha 4.5:1 (texto)
      #ffffff sobre #b01b21  =  6.94:1  (vermelho institucional red-600)
    """
    import tempfile

    print("=" * 92)
    print("AUTO-TESTE — verify_contrast.py")
    print("=" * 92)
    erros = 0

    def registo(estado, texto):
        nonlocal erros
        if estado == "ERRO":
            erros += 1
        print(f"[{estado:5}] {texto}")

    casos = [
        ("preto sobre branco", (0, 0, 0), (255, 255, 255), 21.00, AA_NORMAL, True),
        ("#767676 sobre #ffffff", (0x76, 0x76, 0x76), (255, 255, 255), 4.54, AA_NORMAL, True),
        ("#777777 sobre #ffffff (FALHA 4.5)", (0x77, 0x77, 0x77), (255, 255, 255), 4.48, AA_NORMAL, False),
        ("#949494 sobre #ffffff (UI 3.0)", (0x94, 0x94, 0x94), (255, 255, 255), 3.03, AA_LARGE, True),
        ("#949494 sobre #ffffff (texto 4.5)", (0x94, 0x94, 0x94), (255, 255, 255), 3.03, AA_NORMAL, False),
        ("#ffffff sobre #b01b21 (red-600)", (255, 255, 255), (0xb0, 0x1b, 0x21), 6.94, AA_NORMAL, True),
    ]
    for rotulo, a, b, esperado, limiar, deve_passar in casos:
        obtido = contraste(a, b)
        passou = obtido >= limiar - TOLERANCIA
        ok = abs(obtido - esperado) <= 0.02 and passou == deve_passar
        registo("OK" if ok else "ERRO",
                f"{rotulo:36} obtido={obtido:5.2f}:1 esperado~{esperado:5.2f}:1 "
                f"limiar={limiar:.1f} veredicto={'PASS' if passou else 'FALHA'} "
                f"(esperado {'PASS' if deve_passar else 'FALHA'})")

    tmpdir = Path(tempfile.mkdtemp())

    # 1) var() encadeado
    f1 = tmpdir / "a.css"
    f1.write_text(":root {\n  --a: #ffffff;\n  --b: var(--a);\n  --c: var(--b);\n}\n", encoding="utf-8")
    obtido = resolver(ler_tokens(f1), "--c")
    registo("OK" if obtido == "#ffffff" else "ERRO",
            f"resolução var() encadeada --c -> {obtido} (esperado #ffffff)")

    # 2) ciclo detectado
    f2 = tmpdir / "b.css"
    f2.write_text(":root {\n  --x: var(--y);\n  --y: var(--x);\n}\n", encoding="utf-8")
    try:
        resolver(ler_tokens(f2), "--x")
        registo("ERRO", "ciclo de var() NÃO foi detectado")
    except RecursionError:
        registo("OK", "ciclo de var() detectado (RecursionError)")

    # 3) :root dentro de @media é ignorado
    f3 = tmpdir / "c.css"
    f3.write_text(
        ":root { --cor: #111111; }\n"
        "@media (prefers-contrast: more) {\n  :root { --cor: #222222; }\n}\n",
        encoding="utf-8")
    tokens3 = ler_tokens(f3)
    registo("OK" if tokens3.get("--cor") == "#111111" else "ERRO",
            f":root fora de @media tem precedência — --cor={tokens3.get('--cor')} (esperado #111111)")

    # 4) detecção de falha AA num par sintético
    f4 = tmpdir / "d.css"
    f4.write_text(":root { --bg: #ffffff; --fg: #777777; }\n", encoding="utf-8")
    tokens4 = ler_tokens(f4)
    r4 = avaliar(("sintetico", "--fg", "--bg", "normal"), tokens4)
    registo("OK" if (not r4["aa"] and abs(r4["raio"] - 4.48) < 0.02) else "ERRO",
            f"par sintético #777777/#ffffff detectado como FALHA AA ({r4['raio']:.2f}:1)")

    f5 = tmpdir / "e.css"
    f5.write_text(":root { --bg: #ffffff; --fg: #767676; }\n", encoding="utf-8")
    r5 = avaliar(("sintetico", "--fg", "--bg", "normal"), ler_tokens(f5))
    registo("OK" if r5["aa"] else "ERRO",
            f"par sintético #767676/#ffffff detectado como PASS AA ({r5['raio']:.2f}:1)")

    # 5) exit code do CLI: um único par sintético que FALHA tem de dar exit 1
    #    (substitui-se a lista global PARES por esse par durante o teste)
    global PARES, TOKENS
    pares_originais, tokens_originais = PARES, TOKENS
    f6 = tmpdir / "f.css"
    f6.write_text(":root { --bg: #ffffff; --fg: #777777; }\n", encoding="utf-8")
    PARES = [("sintetico", "--fg", "--bg", "normal")]
    TOKENS = f6
    try:
        import io
        import contextlib
        buffer = io.StringIO()
        with contextlib.redirect_stdout(buffer):
            saida = main([])
    finally:
        PARES, TOKENS = pares_originais, tokens_originais
    registo("OK" if saida == 1 else "ERRO",
            f"main([]) devolveu {saida} com 1 par de texto normal em falha (esperado 1)")

    f7 = tmpdir / "g.css"
    f7.write_text(":root { --bg: #ffffff; --fg: #767676; }\n", encoding="utf-8")
    PARES = [("sintetico", "--fg", "--bg", "normal")]
    TOKENS = f7
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            saida_ok = main([])
    finally:
        PARES, TOKENS = pares_originais, tokens_originais
    registo("OK" if saida_ok == 0 else "ERRO",
            f"main([]) devolveu {saida_ok} com todos os pares a passar (esperado 0)")

    # 6) limpeza
    for p in tmpdir.glob("*.css"):
        p.unlink()
    tmpdir.rmdir()

    print("=" * 92)
    print(f"AUTO-TESTE: {'PASS' if erros == 0 else f'FALHA ({erros} erro/s)'}")
    print("=" * 92)
    return erros


# ---------------------------------------------------------------------------
# 6. CLI
# ---------------------------------------------------------------------------
def main(argv) -> int:
    if "--selftest" in argv:
        return 1 if selftest() else 0

    try:
        tokens = ler_tokens(TOKENS)
    except FileNotFoundError:
        print(f"ERRO: tokens.css não encontrado em {TOKENS}", file=sys.stderr)
        return 2

    if not tokens:
        print("ERRO: nenhuma custom property :root encontrada", file=sys.stderr)
        return 2

    try:
        resultados = avaliar_todos(tokens)
    except (KeyError, ValueError, RecursionError) as exc:
        print(f"ERRO ao resolver tokens: {exc}", file=sys.stderr)
        return 2

    normais_falha, _ui_falha = imprimir(resultados)

    if "--json" in argv:
        print(json.dumps({
            "ficheiro": str(TOKENS.relative_to(RAIZ)),
            "pares": resultados,
            "falhas_texto_normal": len(normais_falha),
        }, ensure_ascii=False, indent=2))

    return 1 if normais_falha else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))