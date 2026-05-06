# CallesVivas

Citizen reporting platform integrated with eldiario.es. Users report neighborhood issues via interactive maps, community votes prioritize them, and journalists investigate the top concerns.

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (base-ui)
- **Maps**: Mapbox GL JS (with GeoJSON clustering)
- **Backend**: Next.js API Routes + tRPC v11
- **Database**: PostgreSQL 16 + PostGIS 3.4 + Prisma 7 (Docker Compose)
- **Auth**: NextAuth.js v4 (Google OAuth + email magic link + dev credentials)
- **Storage**: Local filesystem for dev (`public/uploads/`), Cloudflare R2 for production
- **Deployment**: Vercel + Railway/Fly.io

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

## Development Notes

- See PLAN.md for full project plan, phases, and API endpoints
- See DESIGN.md for UI/UX design system and component specs
- Design references in `stitch_design_system_implementation/`
- All code and documentation in English
- Human-based moderation (no AI moderation)
