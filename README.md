# R2 — Discord Bot

A Discord bot with a soundboard, scheduled jobs, and modular command system. This repository contains the bot backend, a soundboard web panel, and supporting Docker/nginx configuration.

## Repository layout

- `bot/` — main TypeScript bot service (Prisma, soundboard, modules)
- `soundboard-panel/` — frontend for the soundboard panel (Vite + Vue)
- `nginx/` — nginx config and Dockerfile for reverse proxy

## Requirements

- Node.js (18+)
- npm (or yarn/pnpm)
- Docker & docker-compose (for containerized deployment)
- SQLite or other DB configured via Prisma (see `prisma/`)

## Quick start (local)

1. Install dependencies for the bot:

```bash
cd bot
npm install
```

2. Build the project (generates Prisma client and compiles TypeScript):

```bash
npm run build
```

3. Start the bot (run compiled output):

```bash
npm start
```

Notes:
- During development you can run TypeScript directly with your preferred runner (this repo includes `tsx` as a dev dependency).
- `bot/package.json` defines these scripts: `build`, `start`, `dev-deploy`, and `global-deploy`.

## Docker (recommended for production)

Build and run with docker-compose (project root):

```bash
docker-compose up --build
```

See `docker-compose.yml` and the Dockerfiles under `bot/`, `nginx/`, and `soundboard-panel/` for service details.

## Configuration

- Bot configuration is in `bot/config.json` and environment variables under `bot/.env` if used.
- Prisma config is in `prisma/schema.prisma` (database URL set via environment or local file).

## Soundboard

- The backend serves a soundboard HTTP and WebSocket interface (see `bot/src/modules/soundboard/`).
- The frontend panel is in `soundboard-panel/`.

## Contributing

1. Open an issue describing the change.
2. Create a branch, implement, test, and submit a PR.

## License

This project does not include a license file. Add one if you plan to publish or reuse the code.
