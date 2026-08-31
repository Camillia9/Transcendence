COMPOSE_FILE := ./docker-compose.yml
BACKUP_DIR := ./backups

COMPOSE := $(shell \
    if docker compose version >/dev/null 2>&1; then \
        echo "docker compose"; \
    elif command -v docker-compose >/dev/null 2>&1; then \
        echo "docker-compose"; \
    elif podman compose version >/dev/null 2>&1; then \
        echo "podman compose"; \
    else \
        exit 1; \
    fi)

COMPOSE_CMD := $(COMPOSE) -f $(COMPOSE_FILE)

all: up

up:
	$(COMPOSE_CMD) up -d --build

down:
	$(COMPOSE_CMD) down

cleanbackups:
	rm -rf ./backups/transcendence_*.sql.gz

fclean:
	$(COMPOSE_CMD) down -v --rmi all --remove-orphans
	docker system prune -af --volumes

stop:
	$(COMPOSE_CMD) stop

start:
	$(COMPOSE_CMD) start

ps:
	$(COMPOSE_CMD) ps

logs:
	$(COMPOSE_CMD) logs -f

re: down up

rebuild: fclean up

backup:
	@mkdir -p $(BACKUP_DIR)
	@$(COMPOSE_CMD) up -d db backup
	@$(COMPOSE_CMD) exec -T backup /bin/sh /scripts/backup.sh

backups:
	@ls -lt $(BACKUP_DIR)/transcendence_*.sql.gz 2>/dev/null | head -n 10 || echo "Aucun dump dans $(BACKUP_DIR)"

restore:
	@test -n "$(FILE)" || (echo "Usage: make restore FILE=backups/transcendence_....sql.gz"; exit 1)
	@chmod +x ./scripts/restore.sh
	./scripts/restore.sh "$(FILE)"

# Réinjecte les comptes démo (alice/bob/charlie) — ÉCRASE les données
seed:
	FORCE_SEED=1 $(COMPOSE_CMD) run --rm -e FORCE_SEED=1 migrate

.PHONY: all up down cleanbackups fclean stop start ps logs re rebuild backup backups restore seed
