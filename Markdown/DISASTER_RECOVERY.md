# Disaster recovery — TaskBoard / Transcendence

Procédures de **sauvegarde** et de **restauration** de Postgres pour le Minor *Health check / status page / automated backups / disaster recovery*.

## Quoi sauvegarder

| Élément | Où | Comment |
|---|---|---|
| Base Postgres | volume Docker `pgdata` | dumps `pg_dump` → `./backups/*.sql.gz` |
| Secrets | `.env` (hors git) | copie manuelle hors machine si besoin |
| Code / migrations | git | `prisma/migrations` |

Les dumps **ne remplacent pas** le volume Docker : ils permettent de reconstruire la DB après perte / corruption.

## Objectifs (RPO / RTO)

| Métrique | Valeur cible |
|---|---|
| **RPO** (perte de données max) | 15 min (intervalle de backup par défaut) |
| **RTO** (temps de retour) | ~5–15 min (restore + `compose up`) |

Ajustable via `.env` :

```env
BACKUP_INTERVAL_SECONDS=900     # 15 min
BACKUP_RETENTION_DAYS=7         # garde 7 jours de dumps
```

Pour une démo / test plus rapide : `BACKUP_INTERVAL_SECONDS=300` (5 min).

## Backups automatiques

Au `docker compose up`, le service **`backup`** :

1. attend que Postgres soit healthy ;
2. lance un **dump initial** ;
3. boucle ensuite toutes les `BACKUP_INTERVAL_SECONDS` ;
4. **rotate** les fichiers plus vieux que `BACKUP_RETENTION_DAYS`.

Fichiers :

- `scripts/backup.sh` — un dump + rotation  
- `scripts/backup-loop.sh` — boucle du conteneur  
- `backups/` — dumps locaux (gitignorés)

### Commandes utiles

```bash
cd Transcendence

# Dump immédiat
make backup

# Lister les dumps
make backups

# Logs du service backup
docker compose logs -f backup
```

Format des fichiers : `backups/transcendence_YYYYMMDD_HHMMSS.sql.gz`

> `make fclean` / `down -v` **supprime le volume** `pgdata`, mais **conserve** les dumps dans `./backups/` (dossier hôte).

## Restauration (step-by-step)

### Prérequis

- Stack déjà connue (`docker compose` / Makefile)
- Un dump valide dans `./backups/`
- `.env` avec `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`

### Procédure

```bash
cd Transcendence

# 1. Choisir un dump
make backups

# 2. Restaurer (demande confirmation, écrase la DB actuelle)
make restore FILE=backups/transcendence_YYYYMMDD_HHMMSS.sql.gz
```

Le script `scripts/restore.sh` :

1. arrête identity / chat / workspace / nginx / frontend / backup ;
2. s’assure que `db` tourne ;
3. `DROP SCHEMA public CASCADE` + recreate ;
4. importe le dump via `psql` ;
5. relance `docker compose up -d`.

`compose up` relance aussi le service `migrate` (`prisma migrate deploy` + `prisma db seed`). Le seed **n’écrase plus** une base déjà peuplée (sauf `FORCE_SEED=1` / `make seed`).

### Vérifications post-restore

1. `https://localhost:8443/status` → services **up**, base de données **ok**
2. Login + une page projets / chat
3. `docker compose ps` → pas de restart loop

## Scénarios couverts

| Scénario | Action |
|---|---|
| Volume `pgdata` perdu (`down -v`, disque) | `make restore FILE=...` puis vérifier `/status` |
| Corruption / mauvaises données | Même restore depuis un dump sain |
| Mauvaise migration | Restore d’un dump **pré-migration**, ou dump + rejouer migrations si le dump est compatible |
| Machine neuve | Cloner le repo, recopier `.env` + un dump, `make up`, puis `make restore FILE=...` |

## Test de restore (à faire au moins une fois)

Checklist jury / équipe :

**A — le dump conserve bien les nouvelles données**

1. Créer une donnée visible (compte, projet, tâche)
2. `make backup` → noter le fichier le plus récent ; les compteurs `User` / `Task` / `Project` doivent augmenter
3. `make restore FILE=backups/<ce_dump>`
4. Vérifier que la donnée de (1) est **toujours là**

**B — un dump plus ancien rollback bien l’état**

1. `make backup` (dump « avant »)
2. Créer une donnée visible
3. `make restore FILE=backups/<dump_avant>`
4. Vérifier que la donnée créée en (2) a disparu et que l’état du dump est revenu
5. Noter la date du test dans le rapport / soutenance

## Limites (assumer au jury)

- Backups **logiques** (`pg_dump`), pas de PITR / WAL archiving
- Stockage local `./backups/` (pas de cloud) — suffisant pour le scope 42
- `.env` et certificats nginx ne sont pas dans le dump : à sauvegarder à part si besoin
