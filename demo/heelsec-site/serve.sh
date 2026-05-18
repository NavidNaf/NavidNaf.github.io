#!/usr/bin/env sh

PORT="${PORT:-8000}"

cd "$(dirname "$0")" || exit 1

echo "Serving http://localhost:${PORT}"
python3 -m http.server "$PORT"
