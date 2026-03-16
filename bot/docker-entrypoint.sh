#!/bin/sh
set -e

# Ensure Prisma client is generated (safe no-op if already generated)
npx prisma generate

# Apply migrations (creates tables in the SQLite DB)
npx prisma migrate deploy || true

npx prisma db push

# Run the app
exec node dist/app/app.js
