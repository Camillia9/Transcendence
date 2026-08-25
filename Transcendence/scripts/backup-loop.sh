#!/bin/sh
# Boucle de backups automatiques pour le service Compose `backup`.
set -eu

INTERVAL="${BACKUP_INTERVAL_SECONDS}"
PGHOST="${PGHOST}"
PGPORT="${PGPORT}"
PGUSER="${PGUSER}"
PGDATABASE="${PGDATABASE}"

echo "[backup-loop] Waiting for Postgres (${PGHOST})…"
i=0
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" >/dev/null 2>&1; do
	i=$((i + 1))
	if [ "$i" -ge 60 ]; then
		echo "[backup-loop] Error: Postgres still unreachable" >&2
		exit 1
	fi
	sleep 2
done

echo "[backup-loop] Postgres OK — initial backup"
/scripts/backup.sh || echo "[backup-loop] initial backup failed (will retry)"

echo "[backup-loop] interval = ${INTERVAL}s"
while true; do
	sleep "$INTERVAL"
	echo "[backup-loop] backup scheduled $(date -Iseconds 2>/dev/null || date)"
	/scripts/backup.sh || echo "[backup-loop] backup failed, next attempt in ${INTERVAL}s"
done
