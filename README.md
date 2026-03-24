# Simple CV Editor

Simple CV Editor is a structured CV/resume builder with a React client and an Express + PostgreSQL backend. Users can sign in, manage a personal CV library, edit CV content through forms, save reusable templates, preview documents live, and export polished PDFs.

The default document direction follows the sample CV files in this repository: compact, professional, print-friendly, and ATS-conscious.

## Features

- local account registration, login, logout, and password change
- per-user CV library with create, rename, preview, edit, and delete flows
- built-in sample CV seeding and blank CV creation
- structured JSON-based CV model with basics, sections, items, language, and theme data
- repeatable and reorderable CV sections/items
- personal templates plus public template browsing
- live preview with A4 pagination and responsive web preview modes
- server-side PDF export using Puppeteer/Chromium

## Tech Stack

- React 18 + Vite
- Express 4
- PostgreSQL
- Puppeteer Core for PDF generation
- Docker Compose for local full-stack runs

## Project Structure

- `src/`: frontend app
- `src/components/editor/`: form editing UI
- `src/components/preview/`: live CV preview
- `src/components/library/`: CV/template library screens
- `src/features/cv-builder/model/`: main state/view-model logic
- `src/utils/`: schema defaults, themes, storage, parsing, formatting, and API helpers
- `server/`: API routes, persistence, auth, and PDF rendering
- `docker/postgres/init/`: database bootstrap SQL

## Local Development

Install dependencies:

```powershell
npm.cmd install
```

Start the API server:

```powershell
npm.cmd run dev:server
```

Start the frontend:

```powershell
npm.cmd run dev:client
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`.

## Environment

Important backend environment variables:

- `PORT`: Express port, defaults to `3000`
- `DATABASE_URL`: PostgreSQL connection string
- `PUPPETEER_EXECUTABLE_PATH`: Chromium executable path used for PDF export
- `SEED_USERNAME`: optional startup seed account username
- `SEED_PASSWORD`: optional startup seed account password

If `SEED_USERNAME` and `SEED_PASSWORD` are set, the server creates that account on startup and seeds a default CV when needed.

## Docker

Run the full stack locally:

```powershell
docker compose up --build
```

Default services:

- app: `http://localhost:8000`
- postgres: `localhost:5432`

Default database settings in Docker:

- database: `cv_builder`
- user: `cv_user`
- password: `cv_password`

The app container sets `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` for PDF export.

## Production Build

Build the frontend bundle:

```powershell
npm.cmd run build
```

Run the production server:

```powershell
npm.cmd start
```

## Implementation Notes

- CV data is stored as structured JSON, not raw HTML.
- Preview and PDF rendering both depend on the same normalized document model.
- Backend normalization is important for compatibility with saved CVs and templates.
- Visual changes should preserve the clean sample-CV design direction unless the product deliberately adds a new template.

## Documentation For Agents

Scoped implementation guidance also exists in:

- `AGENTS.md`
- `src/AGENTS.md`
- `src/components/editor/AGENTS.md`
- `server/AGENTS.md`
