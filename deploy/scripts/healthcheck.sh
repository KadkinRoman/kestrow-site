#!/usr/bin/env bash
# Site check every 5 minutes. Cron (root): */5 * * * * /opt/<project>/deploy/scripts/healthcheck.sh
#
# Checks: SITE_URL/api/health -> 200 and "ok":true (503 = leads waiting in the queue > 15 min or the queue is not writable);
# CMS_URL/_health -> 204; db/cms/web containers are running and not unhealthy; disk / is below DISK_WARN_PCT (85 %).
# Result: data/monitor.log (problems and state changes only) and data/monitor.state. A Telegram alert
# (ALERT_TG_BOT_TOKEN, ALERT_TG_CHAT_ID in env/monitor.env) on failure, a reminder every hour and a recovery message;
# without a token - journal only. If the site is behind basic auth: BASIC_AUTH=user:password in monitor.env.
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
ENV_FILE="$ROOT/.env"
getvar() { grep -E "^$2=" "$1" 2>/dev/null | tail -n1 | cut -d= -f2-; }
PROJECT="$(getvar "$ENV_FILE" COMPOSE_PROJECT_NAME)"
ENV_DIR="$(getvar "$ENV_FILE" ENV_DIR)"; ENV_DIR="${ENV_DIR:-$ROOT/env}"
MON="$ENV_DIR/monitor.env"
SITE_URL="$(getvar "$MON" SITE_URL)"
CMS_URL="$(getvar "$MON" CMS_URL)"
BASIC_AUTH="$(getvar "$MON" BASIC_AUTH)"
TG_TOKEN="$(getvar "$MON" ALERT_TG_BOT_TOKEN)"
TG_CHAT="$(getvar "$MON" ALERT_TG_CHAT_ID)"
DISK_WARN="$(getvar "$MON" DISK_WARN_PCT)"; DISK_WARN="${DISK_WARN:-85}"
REMIND_SEC=3600

DATA="$ROOT/data"; mkdir -p "$DATA"
LOG="$DATA/monitor.log"; STATE="$DATA/monitor.state"
log() { echo "$(date '+%F %T') $*" >> "$LOG"; }
notify() {
  [ -n "$TG_TOKEN" ] && [ -n "$TG_CHAT" ] || return 0
  curl -sS -m 15 -o /dev/null -X POST "https://api.telegram.org/bot$TG_TOKEN/sendMessage" \
    --data-urlencode "chat_id=$TG_CHAT" --data-urlencode "text=$1" || log "telegram: not sent"
}

problems=()
tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT

if [ -n "$SITE_URL" ]; then
  code="$(curl -sS -o "$tmp" -w '%{http_code}' --max-time 20 ${BASIC_AUTH:+-u "$BASIC_AUTH"} "$SITE_URL/api/health" 2>/dev/null || echo 000)"
  if [ "$code" != 200 ] || ! grep -q '"ok":true' "$tmp"; then
    problems+=("site /api/health: HTTP $code $(head -c 200 "$tmp" | tr -d '\n')")
  fi
fi
if [ -n "$CMS_URL" ]; then
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$CMS_URL/_health" 2>/dev/null || echo 000)"
  [ "$code" = 204 ] || problems+=("CMS /_health: HTTP $code")
fi
for s in db cms web; do
  st="$(docker inspect -f '{{.State.Status}}{{if .State.Health}}/{{.State.Health.Status}}{{end}}' "$PROJECT-$s" 2>/dev/null || echo missing)"
  case "$st" in running|running/healthy|running/starting) ;; *) problems+=("container $PROJECT-$s: $st") ;; esac
done
use="$(df -P / | awk 'NR==2 {gsub("%", "", $5); print $5}')"
[ "${use:-0}" -lt "$DISK_WARN" ] || problems+=("disk / is ${use}% full")

# State: status|since|notified (unix time)
prev_status=ok; prev_since=0; prev_notified=0
if [ -f "$STATE" ]; then IFS='|' read -r prev_status prev_since prev_notified < "$STATE"; fi
now="$(date +%s)"
host="$(hostname -s 2>/dev/null || hostname)"

if [ "${#problems[@]}" -gt 0 ]; then
  text="⛔ $PROJECT ($host): $(printf '%s; ' "${problems[@]}")"
  if [ "$prev_status" != fail ]; then
    log "PROBLEM: $text"; notify "$text"; printf 'fail|%s|%s\n' "$now" "$now" > "$STATE"
  elif [ $((now - prev_notified)) -ge "$REMIND_SEC" ]; then
    log "still failing: $text"; notify "$text (since $(date -d "@$prev_since" '+%H:%M' 2>/dev/null))"; printf 'fail|%s|%s\n' "$prev_since" "$now" > "$STATE"
  fi
  exit 1
fi

if [ "$prev_status" = fail ]; then
  mins=$(( (now - prev_since) / 60 ))
  log "recovered (downtime ${mins} min)"; notify "✅ $PROJECT ($host): all good (downtime ${mins} min)"
fi
printf 'ok|%s|%s\n' "$now" "$prev_notified" > "$STATE"
exit 0
