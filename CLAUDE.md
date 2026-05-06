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

## Deployment Plan (DigitalOcean)

### Infrastructure (via DigitalOcean MCP)

1. **Managed PostgreSQL Database** (`db-cluster-create`)
   - Engine: PostgreSQL 16
   - Region: `fra1` (Frankfurt, closest to Madrid)
   - Size: `db-s-1vcpu-1gb` (starter, scale later)
   - Name: `callesvivas-db`
   - Note: PostGIS extension must be enabled after creation (`CREATE EXTENSION postgis;`)

2. **DigitalOcean Spaces** (Object Storage for media uploads)
   - Create a Space via DO console (Spaces not in MCP)
   - Region: `fra1`
   - Name: `callesvivas-media`
   - CDN enabled for fast image delivery
   - Generate Spaces access keys for S3-compatible API

3. **App Platform** (`apps-create-app-from-spec`)
   - Source: GitHub repo `notmemayeb/callesVivas`, branch `main`
   - Build command: `npm run db:generate && npm run build`
   - Run command: `npm start`
   - Instance size: `basic-xxs` (starter) or `professional-xs`
   - HTTP port: 3000
   - Auto-deploy on push to `main`

### Environment Variables (App Platform)

```
DATABASE_URL=<managed-db-connection-string>?sslmode=require
NEXTAUTH_URL=https://callesvivas.app (or DO app URL)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox public token>
GOOGLE_CLIENT_ID=<google oauth client id>
GOOGLE_CLIENT_SECRET=<google oauth secret>
DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
DO_SPACES_KEY=<spaces access key>
DO_SPACES_SECRET=<spaces secret key>
DO_SPACES_BUCKET=callesvivas-media
```

### Deployment Steps

```bash
# Step 1: Create managed PostgreSQL cluster
# MCP: db-cluster-create (engine: pg, version: 16, size: db-s-1vcpu-1gb, region: fra1, name: callesvivas-db, num_nodes: 1)

# Step 2: Get connection string from cluster info
# MCP: db-cluster-get → connection.uri

# Step 3: Enable PostGIS on the database
# Connect via psql or DB console: CREATE EXTENSION IF NOT EXISTS postgis;

# Step 4: Create App Platform app from spec
# MCP: apps-create-app-from-spec with spec below

# Step 5: Push schema and seed
# Run once after deploy (via App Platform console or job):
#   npx prisma db push
#   npx tsx src/server/db/seed.ts

# Step 6: Set custom domain (optional)
# Configure DNS A record → App Platform IP
```

### App Platform Spec (YAML)

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
    instance_size_slug: basic-xs
    instance_count: 1
    envs:
      - key: DATABASE_URL
        value: "${callesvivas-db.DATABASE_URL}"
        scope: RUN_AND_BUILD_TIME
      - key: NEXTAUTH_SECRET
        value: "<generated-secret>"
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: NEXTAUTH_URL
        value: "${APP_URL}"
        scope: RUN_TIME
      - key: NEXT_PUBLIC_MAPBOX_TOKEN
        value: "<mapbox-token>"
        scope: RUN_AND_BUILD_TIME
databases:
  - name: callesvivas-db
    engine: PG
    version: "16"
    size: db-s-1vcpu-1gb
    num_nodes: 1
```

### Post-Deployment Checklist

- [ ] Verify PostGIS extension is enabled
- [ ] Run `prisma db push` to create tables
- [ ] Run seed script for categories and neighborhoods
- [ ] Configure Google OAuth callback URL to production domain
- [ ] Set up Spaces CORS policy for media uploads
- [ ] Test auth flow (sign up, sign in, role assignment)
- [ ] Test incident creation with photo upload
- [ ] Monitor App Platform logs for errors

### Scaling Notes

- App Platform auto-scales horizontally (increase `instance_count`)
- Database can be resized via `db-cluster-resize`
- Add CDN via Spaces CDN (`spaces-cdn-create`) for static media
- Consider connection pooling if DB connections become a bottleneck

## Development Notes

- See PLAN.md for full project plan, phases, and API endpoints
- See DESIGN.md for UI/UX design system and component specs
- Design references in `stitch_design_system_implementation/`
- All code and documentation in English
- Human-based moderation (no AI moderation)
