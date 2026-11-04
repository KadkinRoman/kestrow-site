#!/usr/bin/env bash
# Site backup: PostgreSQL dump (pg_dump -Fc) and an archive of the media volume -> /opt/<project>/backups/daily/<stamp>-{db.dump,uploads.tgz}.
#
#   backup.sh            full (database + media library)
#   backup.sh --db-only  database only (deploy.sh does this before a release)
#
# Rotation: BACKUP_KEEP_DAILY daily copies (14); on the 1st a copy goes to backups/monthly/, which keeps BACKUP_KEEP_MONTHLY (3).
# Off-site copy: OFFSITE_RCLONE_REMOTE in env/monitor.env (rclone copy); empty - skip.
# The lead queue (web-leads volume) is intentionally excluded: personal data, retention is limited by the site code.
# Cron (root): 30 3 * * * /opt/<project>/deploy/scripts/backup.sh >> /opt/<project>/data/backup.log 2>&1
set -euo pipefail
umask 077

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
ENV_FILE="$ROOT/.env"
getvar() { grep -E "^$2=" "$1" 2>/dev/null | tail -n1 | cut -d= -f2-; }

PROJECT="$(getvar "$ENV_FILE" COMPOSE_PROJECT_NAME)"
ENV_DIR="$(getvar "$ENV_FILE" ENV_DIR)"
MON="${ENV_DIR:-$ROOT/env}/monitor.env"
KEEP_DAILY="$(getvar "$MON" BACKUP_KEEP_DAILY)"; KEEP_DAILY="${KEEP_DAILY:-14}"
KEEP_MONTHLY="$(getvar "$MON" BACKUP_KEEP_MONTHLY)"; KEEP_MONTHLY="${KEEP_MONTHLY:-3}"
OFFSITE="$(getvar "$MON" OFFSITE_RCLONE_REMOTE)"

DB_ONLY=0
[ "${1:-}" = "--db-only" ] && DB_ONLY=1
[ -n "$PROJECT" ] || { echo "COMPOSE_PROJECT_NAME is not set in $ENV_FILE" >&2; exit 1; }

TS="$(date +%Y%m%d-%H%M%S)"
DAILY="$ROOT/backups/daily"
MONTHLY="$ROOT/backups/monthly"
mkdir -p "$DAILY" "$MONTHLY"
log() { echo "$(date '+%F %T') [backup] $*"; }

# Database: pg_dump inside the container (user and database come from its environment); written as .part first
DUMP="$DAILY/$TS-db.dump"
docker exec "$PROJECT-db" sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > "$DUMP.part"
mv "$DUMP.part" "$DUMP"
log "database -> $DUMP ($(du -h "$DUMP" | cut -f1))"

TGZ=""
if [ "$DB_ONLY" = 0 ]; then
  TGZ="$DAILY/$TS-uploads.tgz"
  docker run --rm -v "${PROJECT}_cms-uploads:/src:ro" -v "$DAILY:/dst" alpine:3.21 \
    tar czf "/dst/$TS-uploads.tgz.part" -C /src .
  mv "$TGZ.part" "$TGZ"
  chmod 600 "$TGZ" # the archive is created by a container - the host umask does not apply to it
  log "media library -> $TGZ ($(du -h "$TGZ" | cut -f1))"
fi

# Rotate daily copies
ls -1t "$DAILY"/*-db.dump 2>/dev/null | tail -n +"$((KEEP_DAILY + 1))" | xargs -r rm -f
ls -1t "$DAILY"/*-uploads.tgz 2>/dev/null | tail -n +"$((KEEP_DAILY + 1))" | xargs -r rm -f

# Monthly copy - on the 1st, from a full backup
if [ "$DB_ONLY" = 0 ] && [ "$(date +%d)" = "01" ]; then
  cp "$DUMP" "$TGZ" "$MONTHLY/"
  ls -1t "$MONTHLY"/*-db.dump 2>/dev/null | tail -n +"$((KEEP_MONTHLY + 1))" | xargs -r rm -f
  ls -1t "$MONTHLY"/*-uploads.tgz 2>/dev/null | tail -n +"$((KEEP_MONTHLY + 1))" | xargs -r rm -f
  log "monthly copy -> $MONTHLY"
fi

# Off-site copy
if [ -n "$OFFSITE" ] && [ "$DB_ONLY" = 0 ]; then
  if command -v rclone >/dev/null 2>&1; then
    rclone copy "$DUMP" "$OFFSITE/" && rclone copy "$TGZ" "$OFFSITE/" && log "off-site copy -> $OFFSITE"
  else
    log "WARNING: rclone is not installed - off-site copy skipped"
  fi
fi

log "done; daily copies: $(ls -1 "$DAILY"/*-db.dump 2>/dev/null | wc -l), disk usage: $(du -sh "$ROOT/backups" | cut -f1)"
