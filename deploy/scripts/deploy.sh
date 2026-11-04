#!/usr/bin/env bash
# Release and rollback in one command (on the server, /opt/<project>/deploy/scripts/deploy.sh).
#
#   deploy.sh v1.2.3                   cms:v1.2.3 + web:<WEB_TAG_PREFIX>-v1.2.3 (image tags = git tag, built by CI)
#   deploy.sh sha-1a2b3c4              same, by the short commit sha on main
#   deploy.sh --cms <tag> --web <tag>  tags separately (for example, only web was rebuilt)
#   deploy.sh --rollback               restore the tags from .env.prev (images are still on disk - about 30 s)
#   deploy.sh --no-backup ...          skip the database dump before the release
#
# Steps: database dump (backup.sh --db-only) -> tags in .env (previous ones in .env.prev) -> compose pull -> up -d ->
# wait for cms and web to become healthy (up to 3 min) -> status. On failure it prints the rollback command. Log: data/deploy.log.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
ENV_FILE="$ROOT/.env"
PREV_FILE="$ROOT/.env.prev"
COMPOSE="$HERE/compose.sh"
LOG="$ROOT/data/deploy.log"

usage() { sed -n '2,12p' "$0"; exit 2; }
log() { local m; m="$(date '+%F %T') $*"; echo "$m"; mkdir -p "$(dirname "$LOG")"; echo "$m" >> "$LOG"; }
getvar() { grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2-; }
setvar() {
  if grep -qE "^$1=" "$ENV_FILE"; then sed -i "s|^$1=.*|$1=$2|" "$ENV_FILE"; else echo "$1=$2" >> "$ENV_FILE"; fi
}
# wait_healthy <container> <seconds> - wait for healthy (every service has a healthcheck)
wait_healthy() {
  local c="$1" t="$2" s="" i
  for ((i = 0; i < t; i += 5)); do
    s="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$c" 2>/dev/null || echo missing)"
    if [ "$s" = healthy ]; then echo "  $c: healthy (${i}s)"; return 0; fi
    sleep 5
  done
  echo "  $c: $s - timeout ${t}s"
  return 1
}

[ -f "$ENV_FILE" ] || { echo "$ENV_FILE not found (template: deploy/.env.example)" >&2; exit 1; }

CMS_TAG=""; WEB_TAG=""; BACKUP=1; ROLLBACK=0
while [ $# -gt 0 ]; do
  case "$1" in
    --cms) CMS_TAG="$2"; shift 2 ;;
    --web) WEB_TAG="$2"; shift 2 ;;
    --rollback) ROLLBACK=1; shift ;;
    --no-backup) BACKUP=0; shift ;;
    -h|--help) usage ;;
    -*) echo "unknown flag $1" >&2; usage ;;
    *) CMS_TAG="$1"; WEB_TAG="$(getvar WEB_TAG_PREFIX)-$1"; shift ;;
  esac
done

PROJECT="$(getvar COMPOSE_PROJECT_NAME)"
OLD_CMS="$(getvar CMS_TAG)"
OLD_WEB="$(getvar WEB_TAG)"

if [ "$ROLLBACK" = 1 ]; then
  [ -f "$PREV_FILE" ] || { echo "$PREV_FILE not found - nothing to roll back to" >&2; exit 1; }
  CMS_TAG="$(grep -E '^CMS_TAG=' "$PREV_FILE" | cut -d= -f2-)"
  WEB_TAG="$(grep -E '^WEB_TAG=' "$PREV_FILE" | cut -d= -f2-)"
fi
[ -n "$CMS_TAG$WEB_TAG" ] || usage
[ -n "$CMS_TAG" ] || CMS_TAG="$OLD_CMS"
[ -n "$WEB_TAG" ] || WEB_TAG="$OLD_WEB"

if [ "$ROLLBACK" = 1 ]; then
  log "rollback $PROJECT: cms $OLD_CMS → $CMS_TAG, web $OLD_WEB → $WEB_TAG"
else
  log "release $PROJECT: cms $OLD_CMS → $CMS_TAG, web $OLD_WEB → $WEB_TAG"
  if [ "$BACKUP" = 1 ]; then "$HERE/backup.sh" --db-only; fi
fi

printf 'CMS_TAG=%s\nWEB_TAG=%s\n' "$OLD_CMS" "$OLD_WEB" > "$PREV_FILE"
setvar CMS_TAG "$CMS_TAG"
setvar WEB_TAG "$WEB_TAG"

"$COMPOSE" pull --quiet
"$COMPOSE" up -d --remove-orphans

ok=1
wait_healthy "$PROJECT-cms" 180 || ok=0
wait_healthy "$PROJECT-web" 120 || ok=0
"$COMPOSE" ps

if [ "$ok" = 1 ]; then
  log "done: cms $CMS_TAG, web $WEB_TAG"
else
  log "UNHEALTHY after the release (cms $CMS_TAG, web $WEB_TAG). Logs: $COMPOSE logs --tail 100 cms web. Rollback: $0 --rollback"
  exit 1
fi
