# Installation

This guide walks you through deploying a complete Helm instance from scratch, including the backend, frontend, database, and task queue.

## Prerequisites

| Dependency | Minimum Version | Notes |
|------------|----------------|-------|
| Python | 3.12+ | Backend runtime |
| Node.js | 18+ | Frontend build |
| PostgreSQL | 14+ | Primary database |
| Redis | 6+ | Celery Broker / cache |
| Git | — | Source code checkout |

## Step 1: Get the Source Code

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/helm.git
cd helm
```

## Step 2: Configure Environment Variables

Create a `.env` file in the project root (based on the example):

```bash
cp .env.example .env
```

Edit `.env` and fill in at least the following required fields:

```env
# Database
DATABASE_URL=postgresql+asyncpg://helm:yourpassword@localhost:5432/helm

# Redis
REDIS_URL=redis://localhost:6379/0

# Secret key (random string — must be changed in production)
SECRET_KEY=your-very-long-random-secret-key-here

# EVE SSO (apply at the CCP Developer Portal)
EVE_CLIENT_ID=your_eve_client_id
EVE_CLIENT_SECRET=your_eve_client_secret
EVE_CALLBACK_URL=http://your-domain/api/v1/auth/callback

# Runtime mode
APP_ENV=production
```

See [Configuration Reference](configuration.md) for the full list of options.

## Step 3: Create the Database

```bash
# Run as a PostgreSQL superuser
psql -U postgres -c "CREATE USER helm WITH PASSWORD 'yourpassword';"
psql -U postgres -c "CREATE DATABASE helm OWNER helm;"
```

## Step 4: Install Backend Dependencies

```bash
cd backend
pip install -e ".[dev]"     # development mode
# or
pip install .               # production mode
```

## Step 5: Run Database Migrations

```bash
cd backend
alembic upgrade head
```

## Step 6: Build the Frontend

```bash
cd frontend
npm install
npm run build
```

The build output is placed in `frontend/dist/`.

## Step 7: Start the Services

=== "Development Mode"

    Open three terminals and run:

    **Terminal 1 — Backend API**
    ```bash
    cd backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

    **Terminal 2 — Celery Worker**
    ```bash
    cd backend
    celery -A app.tasks.celery_app worker --loglevel=info
    ```

    **Terminal 3 — Frontend Dev Server**
    ```bash
    cd frontend
    npm run dev
    # → http://localhost:5173
    ```

=== "Production Mode (Uvicorn)"

    ```bash
    # Backend
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

    # Celery Worker (background)
    celery -A app.tasks.celery_app worker --loglevel=info --detach

    # Frontend: serve frontend/dist/ with Nginx or Caddy
    ```

=== "Docker Compose (recommended for production)"

    A `docker-compose.yml` is provided in the project root (if present):

    ```bash
    docker compose up -d
    ```

    This starts PostgreSQL, Redis, Uvicorn, Celery Worker, and Nginx together.

## Step 8: Create the First Admin Account

Helm uses EVE SSO for authentication. The first user to log in (or the character ID specified via `FIRST_SUPERUSER_CHAR_ID` in `.env`) automatically receives admin privileges.

Open your browser and go to `http://localhost:5173`, then click **Login with EVE SSO** to authenticate.

## Verify the Deployment

```bash
# Check API health
curl http://localhost:8000/health

# Check the plugin system
curl http://localhost:8000/api/v1/plugins/ \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

!!! tip "Next Steps"
    - Review the [Configuration Reference](configuration.md) for all environment variables
    - Head to the [Admin Guide](../admin-guide/index.md) to configure user permissions
    - Install your first plugin via [Plugin Management](../admin-guide/plugins.md)
