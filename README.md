# CV Builder Website

The website is now a production-style React + Express + PostgreSQL app.

Architecture in this version:

- `src/`: React client
- `server/`: API, database persistence, and server-side PDF generation
- `docker-compose.yml`: production test stack
- `docker/postgres/init/001_create_cvs.sql`: database schema bootstrap

Main features:

- form-based CV editing
- server-backed CV persistence in PostgreSQL
- dedicated `CV name` field
- server-rendered PDF export returned to the client as a file download
- live A4 preview
- Dockerized production test setup

### Local Development

Install dependencies:

```powershell
npm.cmd install
```

Run the API server:

```powershell
npm.cmd run dev:server
```

Run the client:

```powershell
npm.cmd run dev:client
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`.

### Production-Style Docker Test

Build and start the full stack:

```powershell
docker compose up --build
```

Services:

- app: `http://localhost:8000`
- postgres: `localhost:5432`

Default database connection in Docker:

- database: `cv_builder`
- user: `cv_user`
- password: `cv_password`

### Production Build

Build the frontend:

```powershell
npm.cmd run build
```
