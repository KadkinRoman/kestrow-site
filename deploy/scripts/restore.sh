#!/usr/bin/env bash
# Restore the site from a backup (cms and web are stopped during the restore, ~1-3 min).
#
#   restore.sh <stamp | path to *-db.dump> [--uploads auto | <path to *-uploads.tgz>] [--yes]
#   stamp - the part of the file name before "-db.dump", e.g. 20261026-033001 (looked up in backups/daily, then monthly);
#   --uploads auto - the media archive with the same stamp; without --uploads the media library is left untouched.
#
# Database: the public schema is recreated and loaded with pg_restore (--no-owner) - independent of schema differences.
# Media library: the cms-uploads volume contents are replaced by the archive. The site cache is reset afterwards.
# Dry run: restore a fresh dump on a non-production instance and compare the /api/kitchens?pagination[pageSize]=1 counters before and after.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
ENV_FILE="$ROOT/.env"
COMPOSE="$HERE/compose.sh"
getvar() { grep -E "^$2=" "$1" 2>/dev/null | tail -n1 | cut -d= -f2-; }
PROJECT="$(getvar "$ENV_FILE" COMPOSE_PROJECT_NAME)"
ENV_DIR="$(getvar "$ENV_FILE" ENV_DIR)"; ENV_DIR="${ENV_DIR:-$ROOT/env}"
log() { echo "$(date '+%F %T') [restore] $*"; }

SRC="${1:-}"; [ -n "$SRC" ] || { sed -n '2,11p' "$0"; exit 2; }
shift
UPLOADS=""; YES=0
while [ $# -gt 0 ]; do
  case "$1" in
    --uploads) UPLOADS="$2"; shift 2 ;;
    --yes) YES=1; shift ;;
    *) echo "unknown argument $1" >&2; exit 2 ;;
  esac
done

# Dump: a path or a stamp
if [ -f "$SRC" ]; then
  DUMP="$SRC"
else
  DUMP=""
  for d in "$ROOT/backups/daily" "$ROOT/backups/monthly"; do
    [ -f "$d/$SRC-db.dump" ] && { DUMP="$d/$SRC-db.dump"; break; }
  done
  [ -n "$DUMP" ] || { echo "no dump found for stamp $SRC" >&2; exit 1; }
fi
TGZ=""
if [ "$UPLOADS" = auto ]; then
  TGZ="${DUMP%-db.dump}-uploads.tgz"
  [ -f "$TGZ" ] || { echo "media archive $TGZ not found" >&2; exit 1; }
elif [ -n "$UPLOADS" ]; then
  TGZ="$UPLOADS"; [ -f "$TGZ" ] || { echo "file $TGZ not found" >&2; exit 1; }
fi

echo "Project:       $PROJECT"
echo "Database:      $DUMP"
echo "Media library: ${TGZ:-untouched}"
if [ "$YES" = 0 ]; then
  read -r -p "Replace the data of $PROJECT with this backup? Type yes: " a
  [ "$a" = yes ] || { echo "cancelled"; exit 1; }
fi

log "stopping cms and web"
"$COMPOSE" stop web cms

log "recreating the public schema and loading the dump"
docker exec "$PROJECT-db" sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -q -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"'
docker exec -i "$PROJECT-db" sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges --exit-on-error' < "$DUMP"
log "database restored"

if [ -n "$TGZ" ]; then
  log "replacing the media library"
  docker run --rm -v "${PROJECT}_cms-uploads:/dst" -v "$(cd "$(dirname "$TGZ")" && pwd):/src:ro" alpine:3.21 \
    sh -c "find /dst -mindepth 1 -delete && tar xzf /src/$(basename "$TGZ") -C /dst"
  log "media library restored"
fi

log "starting cms and web"
"$COMPOSE" up -d cms web
for c in "$PROJECT-cms" "$PROJECT-web"; do
  for i in $(seq 1 36); do
    s="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$c" 2>/dev/null || echo missing)"
    [ "$s" = healthy ] && break
    sleep 5
  done
  echo "  $c: $s"
done

# The page cache may hold old content for up to an hour - reset it through the webhook
SECRET="$(getvar "$ENV_DIR/web.env" REVALIDATE_SECRET)"
if [ -n "$SECRET" ]; then
  docker exec "$PROJECT-web" wget -qO /dev/null --post-data '' --header "x-revalidate-secret: $SECRET" http://127.0.0.1:3000/api/revalidate \
    && log "site cache reset" || log "WARNING: site cache not reset (it refreshes itself within an hour)"
fi
log "done"
