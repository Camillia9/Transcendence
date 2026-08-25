#!/bin/sh
# Dump Postgres + rotation. Destiné au conteneur `backup` (réseau Docker).
set -eu

BACKUP_DIR="${BACKUP_DIR}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS}"
PGHOST="${PGHOST}"
PGPORT="${PGPORT}"
PGUSER="${PGUSER}"
PGDATABASE="${PGDATABASE}"
PGPASSWORD="${PGPASSWORD}"

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
FILE="${BACKUP_DIR}/transcendence_${STAMP}.sql.gz"
TMP="${FILE}.tmp"

echo "Starting backup : ${FILE}"

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
echo "[backup] Content at the time of the dump:"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -At -c \
	"SELECT 'User=' || (SELECT count(*) FROM \"User\") || ' Project=' || (SELECT count(*) FROM \"Project\") || ' Task=' || (SELECT count(*) FROM \"Task\") || ' Organisation=' || (SELECT count(*) FROM \"Organisation\");" \
	|| echo "[backup] (table counting unavailable)"

# Rotation : supprimer les dumps plus vieux que RETENTION_DAYS
DELETED="$(find "$BACKUP_DIR" -type f -name 'transcendence_*.sql.gz' -mtime "+${RETENTION_DAYS}" -print -delete | wc -l | tr -d ' ')"
if [ "${DELETED}" != "0" ]; then
	echo "[backup] rotation: ${DELETED} old dump(s) deleted (>${RETENTION_DAYS}j)"
fi

# Liste courte des dumps restants
echo "[backup] Available dumps:"
ls -1t "$BACKUP_DIR"/transcendence_*.sql.gz 2>/dev/null | head -n 10 || echo "  (none)"
