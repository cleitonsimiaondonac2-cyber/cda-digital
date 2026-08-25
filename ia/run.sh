#!/usr/bin/env bash
# Arranca o Assistente CDA (API) na porta 8765
cd "$(dirname "$0")"
exec ./venv/bin/uvicorn api:app --host 127.0.0.1 --port 8765 "$@"
