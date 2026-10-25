#!/usr/bin/env bash
# Gera a pasta /docs (deploy GitHub Pages) a partir de /site (fonte de verdade).
# Mantém site/ como única fonte e evita divergência entre as duas pastas.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Sincronizando site/ → docs/ (deploy)..."
# --delete torna docs/ uma cópia fiel de site/ (remove arquivos órfãos).
# O ambiente de execução nem sempre inclui rsync; nesse caso usa-se a cópia
# equivalente da biblioteca padrão do Python.
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete site/ docs/
else
  python3 - <<'PY_SYNC'
from pathlib import Path
import shutil

src = Path("site")
dst = Path("docs")
dst.mkdir(parents=True, exist_ok=True)
for item in dst.iterdir():
    if item.is_dir() and not item.is_symlink():
        shutil.rmtree(item)
    else:
        item.unlink()
for item in src.iterdir():
    target = dst / item.name
    if item.is_dir() and not item.is_symlink():
        shutil.copytree(item, target)
    else:
        shutil.copy2(item, target)
PY_SYNC
fi

echo "==> Verificação: contagem de páginas e PDFs..."
echo "  páginas: $(ls site/*.html | wc -l) (site) / $(ls docs/*.html | wc -l) (docs)"
echo "  pdfs:    $(ls site/docs/*.pdf 2>/dev/null | wc -l) (site) / $(ls docs/docs/*.pdf 2>/dev/null | wc -l) (docs)"

echo "==> docs/ pronto para publicar (commit e push de docs/)."
