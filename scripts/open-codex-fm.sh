#!/usr/bin/env bash
set -euo pipefail

SOURCE="${BASH_SOURCE[0]}"
while [[ -L "$SOURCE" ]]; do
  SOURCE_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ "$SOURCE" != /* ]] && SOURCE="$SOURCE_DIR/$SOURCE"
done

ROOT_DIR="$(cd "$(dirname "$SOURCE")/.." && pwd)"
APP_FILE="$ROOT_DIR/index.html"

if [[ ! -f "$APP_FILE" ]]; then
  echo "Codex FM asset not found: $APP_FILE" >&2
  exit 1
fi

FILE_URL="$(python3 - "$APP_FILE" <<'PY'
import pathlib
import sys

print(pathlib.Path(sys.argv[1]).resolve().as_uri())
PY
)"

if command -v open >/dev/null 2>&1; then
  open -a "Google Chrome" "$FILE_URL" >/dev/null 2>&1 || open "$FILE_URL" >/dev/null 2>&1 || true
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome "$FILE_URL" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$FILE_URL" >/dev/null 2>&1 || true
fi

echo "Codex FM opened at $FILE_URL"
