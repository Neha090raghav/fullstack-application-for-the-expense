#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$DIR/export"
mkdir -p "$OUT"

CHROME="${CHROME:-google-chrome}"
HTML="file://${DIR}/index.html"

for i in 1 2 3 4 5; do
  echo "Capturing slide $i..."
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size=1920,1080 \
    --virtual-time-budget=4000 \
    --screenshot="${OUT}/slide-0${i}.png" \
    "${HTML}?slide=${i}"
done

echo "Building PDF..."
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --no-pdf-header-footer \
  --print-to-pdf-no-header \
  --print-to-pdf="${OUT}/AI-Incident-Copilot-Airport-Middleware.pdf" \
  "${HTML}?export=1"

echo "Done."
ls -la "$OUT"
