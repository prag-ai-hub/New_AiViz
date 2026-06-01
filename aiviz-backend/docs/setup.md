# Setup — aiviz-backend

## Prerequisites

- Python 3.12+ (Ubuntu 22.04: `sudo apt install python3.12 python3.12-venv`)
- Docker Engine + **Compose v2 plugin** (NOT the legacy `docker-compose` v1 — it's incompatible with Docker Engine 25+ on this machine)

## One-time install (Ubuntu 22.04)

```bash
# Docker engine (apt repo)
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker $USER
newgrp docker            # apply group without re-login

# Compose v2 plugin — the `docker-compose-plugin` apt package isn't in 22.04 repos,
# so install the binary directly into the user CLI-plugins dir:
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# Verify (note the SPACE between "docker" and "compose")
docker --version
docker compose version   # → v5.x or v2.x
```

If you previously installed the apt `docker-compose` v1.29.2: ignore it. On Docker
Engine 25+ it dies with `KeyError: 'ContainerConfig'` whenever it tries to recreate
a container. Use the plugin (`docker compose`, space) for everything.

## Project bootstrap

```bash
cd aiviz-backend

# 1. venv  (Suyog's workspace puts .venv at the workspace root, one level up;
#     you can also create it per-repo at aiviz-backend/.venv — either works)
python3.12 -m venv .venv
source .venv/bin/activate

# 2. deps
pip install -r requirements/dev.txt

# 3. env
cp .env.example .env       # .env is gitignored
# Note: DATABASE_URL is set to localhost:5433 because we map the Postgres
# container to host port 5433 (the host already runs a local Postgres on 5432).
# If you don't have a local Postgres, you can change docker-compose.yml back
# to "5432:5432" and update DATABASE_URL accordingly.

# 4. infra (postgres + redis)
docker compose -f docker/docker-compose.yml up -d db redis
docker ps                  # expect 2 healthy containers

# 5. migrate
python manage.py makemigrations accounts
python manage.py migrate

# 6. (optional) superuser
python manage.py createsuperuser

# 7. run
python manage.py runserver
```

## Smoke checks

```bash
python manage.py check                     # → System check identified no issues
curl -i http://localhost:8000/api/v1/      # → 404 wrapped in { "error": { "code", "detail", "request_id" } }
curl -is http://localhost:8000/admin/login/ | head -5   # → 200 OK
```

## Running tests

```bash
pytest -q
```

## Running celery (when you actually need async work)

```bash
celery -A config worker -l info
celery -A config beat   -l info
```

## Docker-only run

```bash
docker compose -f docker/docker-compose.yml up
# web on :8000, worker, beat, db, redis all stand up together
```

## Common issues

- **`docker-compose: KeyError: 'ContainerConfig'`** → you're using legacy v1.29. Switch to the v2 plugin (above) and use `docker compose` with a space.
- **`bind 0.0.0.0:5432: address already in use`** → the host has its own Postgres. Either `sudo systemctl stop postgresql` to free it, or use the 5433 mapping that's already in `docker-compose.yml`.
- **`anymail` install fails with "no matching distribution"** → the PyPI package is `django-anymail`, not `anymail`. `requirements/base.txt` already has the right name.
- **`(admin.E403) A 'django.template.backends.django.DjangoTemplates' instance must be configured`** → `TEMPLATES` setting missing. Already wired in `config/settings/base.py`.
- **`ModuleNotFoundError: apps.accounts`** → you're not running from `aiviz-backend/`. `cd` there and re-run.
- **`No migrations to apply` but tables missing** → run `python manage.py makemigrations accounts` first.
- **CORS rejection in dev** → set `CORS_ALLOW_ALL_ORIGINS=True` in `.env`.
- **`bash: /home/hp/Desktop/AiViz: No such file or directory`** → workspace path has a space (`"AiViz New"`); quote it (`"AiViz New"`) or use a tab-completed escaped path (`AiViz\ New`). Don't `cd` into unquoted paths.

---

## Auth (Day 2)

Five endpoints under `/api/v1/auth/*`:

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/signup`  | none   | `{ email, password, phone?, role?, first_name?, last_name? }` |
| POST | `/login`   | none   | `{ identifier, password }` — identifier = email OR E.164 phone |
| POST | `/refresh` | none   | `{ refresh }` |
| GET  | `/me`      | Bearer | — |
| POST | `/google`  | none   | `{ id_token }` |

JWT lifetimes: **30 min access, 30 day refresh**, rotated + blacklisted on every refresh.
Tokens are issued by `apps.accounts.services.issue_tokens` and verified by simplejwt's
`JWTAuthentication`.

### curl roundtrip

```bash
BASE=http://localhost:8000/api/v1

# 1. Signup
curl -s -X POST $BASE/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"Pa55word!","role":"student"}' | jq

# 2. Login (save the access token)
ACCESS=$(curl -s -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"a@b.com","password":"Pa55word!"}' | jq -r .tokens.access)

# 3. Me
curl -s $BASE/auth/me -H "Authorization: Bearer $ACCESS" | jq

# 4. Refresh — take the refresh from step 2's response
curl -s -X POST $BASE/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refresh":"<refresh from login>"}' | jq
```

### Google "Continue with Google"

Backend verifies Google ID tokens via `google-auth`. **Setup once:**

1. Go to [console.cloud.google.com → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create OAuth client IDs for each platform the Expo app runs on (web, iOS, Android).
3. Paste them comma-separated into `.env`:
   ```
   GOOGLE_CLIENT_IDS=12345-abc.apps.googleusercontent.com,67890-xyz.apps.googleusercontent.com
   ```
4. Restart `runserver`.

`POST /api/v1/auth/google` accepts `{ id_token }`. Resolution:
- If a `SocialAccount(provider=google, subject=<sub>)` already exists → return that user.
- Else if a User with the same email exists → attach the SocialAccount, return that user.
- Else → create User (+ Profile via signal) + SocialAccount, return `created=true`.

`is_email_verified` is set `True` for Google-created users (Google has verified it).

The Postman collection in `docs/postman/` covers all 5 endpoints and auto-saves
`access` / `refresh` into the environment on signup/login/refresh/google success.

### Migration recipe (one-time, after pulling Day 2)

Day 2 rewrites the User model to use email-as-username. Day 1's `0001_initial` migration
is incompatible. Drop & recreate (local DB has no real users):

```bash
python manage.py migrate accounts zero
rm apps/accounts/migrations/0001_initial.py
python manage.py makemigrations accounts
python manage.py migrate
```

### Tests

```bash
pytest apps/accounts -q
```

Coverage: models (manager, uniqueness, signal-created profile), signup, login (email + phone),
refresh (rotation + blacklist replay), me (auth + anon envelope), google (5 paths via mocked
`verify_id_token`).

