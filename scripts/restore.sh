#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

FILE="${1:-}"
if [ -z "$FILE" ]; then
	echo "[restore] Usage: $0 <path/to/dump.sql.gz>" >&2
	echo "[restore] Example: $0 backups/transcendence_[...].sql.gz" >&2
	exit 1
fi

if [ ! -f "$FILE" ]; then
	echo "[restore] ERROR: file doesn't exist: $FILE" >&2
	exit 1
fi

COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
	if command -v docker-compose >/dev/null 2>&1; then
		COMPOSE="docker-compose"
	else
		echo "[restore] ERROR: can't find docker compose" >&2
		exit 1
	fi
fi

if [ -f .env ]; then
	set -a
	. ./.env
	set +a
fi

DB_CONTAINER="${DB_CONTAINER:-transcendence_db}"
PGUSER="${POSTGRES_USER}"
PGDATABASE="${POSTGRES_DB}"

echo "=== Disaster recovery — restore ==="
echo "Dump		: $FILE"
echo "Container	: $DB_CONTAINER"
echo "Database	: $PGDATABASE (user=$PGUSER)"
echo ""
echo "WARNING: this operation WILL ERASE the current data in Postgres."
printf "Continue? [y/N] "
read -r ANSWER
case "$ANSWER" in
	y|Y|yes|YES) ;;
	*) echo "Cancelled."; exit 1 ;;
esac

echo "[restore] stopping services…"
$COMPOSE stop identity-service chat-service workspace-service nginx frontend backup 2>/dev/null || true

echo "[restore] checking Postgres…"
if ! docker exec "$DB_CONTAINER" pg_isready -U "$PGUSER" -d "$PGDATABASE" >/dev/null 2>&1; then
	echo "[restore] starting db…"
	$COMPOSE up -d db
	i=0
	until docker exec "$DB_CONTAINER" pg_isready -U "$PGUSER" -d "$PGDATABASE" >/dev/null 2>&1; do
		i=$((i + 1))
		if [ "$i" -ge 30 ]; then
			echo "Error: db unreachable" >&2
			exit 1
		fi
		sleep 2
	done
fi

echo "[restore] importing dump…"
docker exec -i "$DB_CONTAINER" psql -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 <<'SQL'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO PUBLIC;
SQL

gunzip -c "$FILE" | docker exec -i "$DB_CONTAINER" psql -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 >/dev/null

echo "[restore] restarting stack…"
$COMPOSE up -d

echo "[restore] database restored."
