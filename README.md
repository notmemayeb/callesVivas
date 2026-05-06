# CallesVivas

Citizen reporting platform. Residents report neighborhood issues via interactive maps, community votes prioritize them, and journalists investigate the top concerns.

**Live:** [callesvivas.app](https://callesvivas.app)

## Features

- **Interactive map** with Mapbox GL — report incidents geolocated on a cluster map
- **Community voting** — neighbors upvote issues to surface the most urgent ones
- **Role-based workflow** — citizens report, moderators validate, journalists investigate, coordinators oversee
- **Incident lifecycle** — from detection through admin contact to resolution, fully tracked
- **Multimedia** — photo/video/audio attachments, journalistic articles and video reports
- **Monthly reports** — neighborhood-level stats and management rankings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Maps | Mapbox GL JS with GeoJSON clustering |
| Backend | tRPC v11 via Next.js API routes |
| Database | PostgreSQL 16 + Prisma 7 |
| Auth | NextAuth.js v4 (Google OAuth + email magic link) |
| Deployment | DigitalOcean App Platform |

## Getting Started

### Prerequisites

- Node.js 22+
- Docker (for local PostgreSQL)

### Setup

```bash
# Clone and install
git clone https://github.com/notmemayeb/callesVivas.git
cd callesVivas
npm install

# Configure environment
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, NEXT_PUBLIC_MAPBOX_TOKEN

# Start database
docker compose up -d

# Initialize schema and seed data
npm run db:push
npm run db:seed

# Run dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed categories and neighborhoods
npm run db:studio     # Open Prisma Studio
```

## Roles

| Role | Capabilities |
|------|-------------|
| **Citizen** | Create incidents, vote, comment, follow progress |
| **Moderator** | Approve/reject incidents, reclassify, change status |
| **Journalist** | Add articles/videos, register admin contacts, change status |

## Incident Lifecycle

```
DETECTED → PUBLISHED → IN_CONTACT → ADMIN_CONTACT → RESOLVED
                                                     → ABANDONED
```

## Project Structure

```
src/
  app/            Next.js pages and API routes
  components/     UI components (map, incidents, media, layout)
  server/
    trpc/         tRPC routers (incidents, votes, comments, moderation, journalist)
    db/           Prisma client and seed script
  lib/            Auth, tRPC client, constants, utilities
prisma/           Schema and migrations
```

## License

All rights reserved.
