#!/usr/bin/env bash
# docker compose wrapper for this site instance. The instance root is two levels up (for example /opt/kestrow):
# it holds .env (compose variables) and env/ (service secrets). Example: deploy/scripts/compose.sh ps | logs --tail 100 web
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec docker compose --project-directory "$ROOT" --env-file "$ROOT/.env" -f "$ROOT/deploy/compose.yaml" "$@"
