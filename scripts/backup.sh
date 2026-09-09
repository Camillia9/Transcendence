#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
PGHOST="${PGHOST}"
PGPORT="${PGPORT}"
PGUSER="${PGUSER}"
PGDATABASE="${PGDATABASE}"
PGPASSWORD="${PGPASSWORD}"

mkdir -p "$BACKUP_DIR"

STAMP="$(TZ=UTC-2 date +%Y%m%d_%H%M%S)"
FILE="${BACKUP_DIR}/transcendence_${STAMP}.sql.gz"
TMP="${FILE}.tmp"

echo "[backup] Starting backup : ${FILE}"

if ! pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" >/dev/null 2>&1; then
	echo "[backup] Error: Postgres unreachable (${PGHOST}:${PGPORT})" >&2
	exit 1
fi

pg_dump \
	-h "$PGHOST" \
	-p "$PGPORT" \
	-U "$PGUSER" \
	-d "$PGDATABASE" \
	--no-owner \
	--no-acl \
	| gzip -c > "$TMP"

mv "$TMP" "$FILE"
echo "[backup] OK → ${FILE}"

DELETED="$(find "$BACKUP_DIR" -type f -name 'transcendence_*.sql.gz' -mtime "+${RETENTION_DAYS}" -print -delete | wc -l | tr -d ' ')"
if [ "${DELETED}" != "0" ]; then
	echo "[backup] rotation: ${DELETED} old dump(s) deleted (>${RETENTION_DAYS}j)"
fi
