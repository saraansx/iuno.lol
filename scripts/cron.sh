#!/bin/sh
# Calls a /api/cron endpoint with the secret from .env, so crontab never holds it.
# Usage: scripts/cron.sh flush-views
set -eu

ROUTE="${1:?usage: cron.sh <route>}"
APP_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
BASE_URL="${CRON_BASE_URL:-http://127.0.0.1:3000}"

CRON_SECRET="$(sed -n 's/^CRON_SECRET=//p' "$APP_DIR/.env" | tr -d '\r' | tr -d "\"'")"
[ -n "$CRON_SECRET" ] || { echo "CRON_SECRET missing from $APP_DIR/.env" >&2; exit 1; }

curl -fsS --max-time 120 \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$BASE_URL/api/cron/$ROUTE"

echo
