# CallesVivas

Citizen reporting platform integrated with eldiario.es. Users report neighborhood issues via interactive maps, community votes prioritize them, and journalists investigate the top concerns.

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (base-ui)
- **Maps**: Mapbox GL JS (with GeoJSON clustering)
- **Backend**: Next.js API Routes + tRPC v11
- **Database**: PostgreSQL 16 + PostGIS 3.4 + Prisma 7 (Docker Compose)
- **Auth**: NextAuth.js v4 (Google OAuth + email magic link + dev credentials)
- **Storage**: Local filesystem for dev (`public/uploads/`), DigitalOcean Spaces for production
- **Deployment**: DigitalOcean App Platform + Managed PostgreSQL

## Project Structure

```
src/
  app/                  # Next.js pages and API routes
    (main)/             # Home (map), search, top/[period]
    (auth)/             # signin (with role selection), signup
    incidents/          # [id] detail (with role actions), [id]/comments, new (3-step form)
    ranking/            # Incident ranking with tabs (all/active/finished)
    multimedia/         # Videos, articles, contacts tabs
    admin/              # Moderation panel (queue, approve/reject), users management (coordinator)
    journalist/         # Journalist dashboard (assigned incidents, add content/contacts)
    user/[id]/          # profile, my-incidents
    api/                # trpc, auth, upload routes
  components/
    ui/                 # shadcn/ui base components
    layout/             # Header (role-aware nav), BottomNav, MobileMenu (role-aware), CategoryFilters
    incidents/          # IncidentCard, StatusBadge, Top5Bar
    map/                # InteractiveMap (Mapbox GL with clustering + hover popups)
    media/              # MediaUpload
  server/
    trpc/               # tRPC routers (incidents, votes, comments, neighborhoods, categories, users, moderation, journalist)
    db/                 # Prisma client (PrismaPg adapter), seed script
  lib/                  # auth.ts, trpc.ts, constants.ts, utils.ts
  types/                # TypeScript type definitions, next-auth.d.ts (session with role)
  generated/prisma/     # Generated Prisma client (gitignored)
prisma/                 # schema.prisma
```

## Key Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Run ESLint
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to DB (no migration)
npm run db:seed       # Seed categories and neighborhoods
npm run db:studio     # Open Prisma Studio
docker compose up -d  # Start PostgreSQL + PostGIS
```

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. `docker compose up -d` (starts PostgreSQL 16 + PostGIS 3.4)
3. Run `npm run db:push` to create tables
4. Run `npm run db:seed` to seed categories and neighborhoods
5. Run `npm run dev`

## Architecture Notes

- **Prisma 7** requires a driver adapter (`@prisma/adapter-pg`) — see `src/server/db/index.ts`
- **DATABASE_URL** query params (e.g. `?schema=public`) are stripped before passing to `pg` driver
- **shadcn/ui** uses base-ui (not Radix) — components don't support `asChild` prop
- **tRPC** context is created per-request with session from NextAuth
- Role-based procedures: `publicProcedure`, `protectedProcedure`, `moderatorProcedure`, `journalistProcedure`, `coordinatorProcedure`
- Design tokens defined in `src/app/globals.css` and `src/lib/constants.ts`
- UI language is Spanish, code/docs in English

## Roles & Permissions

| Action | Citizen | Moderator | Journalist | Coordinator |
|--------|---------|-----------|------------|-------------|
| Create incident | Yes | Yes | Yes | Yes |
| Vote/follow/comment | Yes | Yes | Yes | Yes |
| Moderate incidents (approve/reject) | - | Yes | - | Yes |
| Change incident status | - | Yes | Yes | Yes |
| Add journalistic content | - | - | Yes | Yes |
| Register admin contacts | - | - | Yes | Yes |
| Manage user roles | - | - | - | Yes |

- **Citizen** (Ciudadano): Create incidents, upvote, comment, follow progress
- **Journalist** (Periodista): `/journalist` dashboard — view top voted incidents, add articles/videos/radio content, register admin contacts, change incident status
- **Moderator** (Moderador): `/admin` panel — moderation queue, approve/reject incidents, reclassify categories, change status
- **Coordinator** (Coordinador): All moderator + journalist capabilities, plus `/admin/users` for managing user roles

## Incident States

DETECTED → PUBLISHED → IN_CONTACT → ADMIN_CONTACT → MEASURES_ANNOUNCED → AWAITING_RESPONSE → RESOLVED / ABANDONED

- **Detected** (Creado): Pending moderator validation, visible only to author and moderators/coordinators
- **Published** (Publicado): Approved, visible to all
- **In Contact** (En contacto con periódico): Journalist acknowledged
- **Admin Contact** (En contacto administrativo): Public services acknowledged
- **Measures Announced** (Medidas anunciadas): Administration announced measures
- **Awaiting Response** (En espera): Waiting for administration response (deadline)
- **Resolved** (Resuelto): Issue fixed
- **Abandoned** (Abandonado): Public services declined to act

## Deployment Plan (DigitalOcean — Minimal)

**Target: ~$5/mo** using App Platform Basic + included dev database.

PostGIS is declared in the schema but not used in queries (lat/lng stored as Float). Remove the extension before deploying.

### Setup Steps

1. Remove PostGIS from `prisma/schema.prisma` (delete `extensions = [postgis]` and `previewFeatures`)
2. Deploy via App Platform with attached dev database (free with app)
3. Media uploads stored in DigitalOcean Spaces (S3-compatible). Set `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_BUCKET`, `DO_SPACES_REGION` env vars. Falls back to local `public/uploads/` in dev when vars are unset.

### App Platform Spec

```yaml
name: callesvivas
region: fra1
services:
  - name: web
    github:
      repo: notmemayeb/callesVivas
      branch: main
      deploy_on_push: true
    build_command: npm ci && npm run db:generate && npm run build
    run_command: npm start
    http_port: 3000
    instance_size_slug: basic-xxs
    instance_count: 1
    envs:
      - key: DATABASE_URL
        value: "${db.DATABASE_URL}"
        scope: RUN_AND_BUILD_TIME
      - key: NEXTAUTH_SECRET
        value: "<openssl rand -base64 32>"
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: NEXTAUTH_URL
        value: "${APP_URL}"
        scope: RUN_TIME
      - key: NEXT_PUBLIC_MAPBOX_TOKEN
        value: "<mapbox-token>"
        scope: RUN_AND_BUILD_TIME
      - key: DO_SPACES_KEY
        value: "<spaces-access-key>"
        scope: RUN_TIME
        type: SECRET
      - key: DO_SPACES_SECRET
        value: "<spaces-secret-key>"
        scope: RUN_TIME
        type: SECRET
      - key: DO_SPACES_BUCKET
        value: "callesvivas-media"
        scope: RUN_TIME
      - key: DO_SPACES_REGION
        value: "fra1"
        scope: RUN_TIME
databases:
  - name: db
    engine: PG
    production: false
```

### MCP Deployment Commands

```
# 1. apps-create-app-from-spec — with the YAML above
# 2. After first deploy succeeds, run console job:
#      npx prisma db push && npx tsx src/server/db/seed.ts
```

### Post-Deploy Checklist

- [ ] Set NEXTAUTH_SECRET (generate a real one)
- [ ] Set NEXT_PUBLIC_MAPBOX_TOKEN
- [ ] Run schema push + seed via App Platform console
- [ ] Test sign-up and incident creation

## Development Notes

- See PLAN.md for full project plan, phases, and API endpoints
- See DESIGN.md for UI/UX design system and component specs
- Design references in `stitch_design_system_implementation/`
- All code and documentation in English
- Human-based moderation (no AI moderation)
