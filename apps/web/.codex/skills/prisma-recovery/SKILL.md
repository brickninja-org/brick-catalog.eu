---
name: prisma-recovery
description: Recover local database state for Prisma when migrations, tables, or schema engine checks fail.
---

# Prisma Recovery Skill

Use this skill when Prisma commands fail with errors like:
- `P1001` cannot reach DB
- `P2021` table does not exist
- `P3018` failed migration
- generic schema engine failures

## Recovery Flow

1. Verify DB container/process is running.
2. Confirm `DATABASE_URL` is loaded from `apps/web/.env`.
3. Run migration status.
4. If migration history is corrupt in non-production:
- reset `public` schema
- rerun `prisma migrate deploy`
5. Re-check required tables (`Element`, `Design`, `Color`, `Post`, `Job`).

## Safety

- Only do destructive schema reset when explicitly allowed and in non-production.
- Keep Timescale/pgvector extension assumptions in mind.
