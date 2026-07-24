COMPOSE_FILE := ./docker-compose.yml

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

fclean:
	$(COMPOSE_CMD) down -v --rmi --remove-orphans
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

.PHONY: all up down fclean stop start ps logs re rebuild
