# CallesVivas - Development Plan

## Project Summary

CallesVivas is a web application integrated with eldiario.es that enables citizens to report, through an interactive map system, issues affecting quality of life in their neighborhoods (noise, accessibility, street furniture, housing, health, etc.). Through community voting, the most relevant issues are investigated and published by the journalism team, creating a cycle of citizen reporting, media coverage, and follow-up until resolution.

---

## 1. Technical Architecture

### Proposed Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR for SEO, dynamic routes, map integration |
| Maps | Mapbox GL JS | Clustering, heatmaps, performance with thousands of points |
| UI | Tailwind CSS + shadcn/ui | Fast responsive design, accessible components |
| Backend/API | Next.js API Routes + tRPC | End-to-end type-safety, same codebase |
| Database | PostgreSQL + PostGIS | Native geospatial queries (neighborhoods, proximity) |
| ORM | Prisma | Migrations, type-safety, PostGIS support via extension |
| Authentication | NextAuth.js | OAuth (Google, Apple), email magic link |
| Media Storage | Cloudflare R2 or AWS S3 | Photos, videos, audio from incidents |
| Task Queue | BullMQ + Redis | Async processing: moderation, notifications, reports |
| Notifications | Web Push + Email (Resend) | Alerts to users, journalists, coordinators |
| Deployment | Vercel (frontend) + Railway/Fly.io (DB, Redis) | Scalable, continuous deployment |

### Architecture Diagram

```
                        Citizens / Journalists / Moderators
                                      |
                              [Next.js Frontend]
                             /         |         \
                    [Mapbox GL]   [tRPC API]   [NextAuth]
                                      |
                    +-----------------+-----------------+
                    |                 |                 |
              [PostgreSQL         [Redis/          [Cloudflare R2
               + PostGIS]         BullMQ]           Storage]
                    |                 |
              Geo queries       Task queue:
              Incidents, votes  - Moderation
              Rankings          - Notifications
                                - Monthly reports
```

---

## 2. Data Model

### Main Entities

```
User
  id, email, name, avatar, role (citizen|moderator|journalist|coordinator)
  neighborhood_id (FK), activity_points, created_at

Neighborhood (Barrio)
  id, name, slug, city, geometry (PostGIS POLYGON)
  population, postal_code

Incident (Ficha)
  id, title, description (500 chars max)
  location (PostGIS POINT), address_text
  category_id (FK), neighborhood_id (FK), author_id (FK)
  status (enum: detected|moderation|published|in_contact|
          admin_contact|measures_announced|
          awaiting_response|resolved|abandoned)
  response_deadline, votes_count, followers_count
  visits_count, urgency_score, created_at, updated_at

Category
  id, name, slug, macro_category (enum: accessibility|noise|
    street_furniture|housing|health), icon, color

Media
  id, incident_id (FK), type (photo|video|audio)
  url, thumbnail_url, size, duration

Vote
  id, incident_id (FK), user_id (FK)
  type (severity|resolved), value, created_at

Comment
  id, incident_id (FK), user_id (FK)
  text, created_at, moderated (bool)

Follow
  incident_id (FK), user_id (FK), notifications (bool)

JournalisticContent
  id, incident_id (FK), journalist_id (FK)
  type (video_report|article|radio_spot)
  title, newspaper_url, content_url, duration
  created_at

AdminContact
  id, incident_id (FK), journalist_id (FK)
  agency, contact_person, contact_date
  type (email|call|visit|official_filing)
  summary, response, document_url

StatusHistory
  id, incident_id (FK), previous_status, new_status
  author_id (FK), note, created_at

MonthlyReport
  id, neighborhood_id (FK), month, year
  summary, resolved_incidents, new_incidents
  management_ranking, comparison_json, published (bool)
```

---

## 3. Route Structure (Frontend)

### Level 0: Home
```
/                                     Home - Interactive map (80% screen)
/map?filters=accessibility            Map filtered by category
/map?neighborhood=chueca              Map centered on neighborhood
/map?heatmap=density                  Heatmap view
/map?gps=true                         Center on user location
/search?q=noise                       Search incidents
/top/today                            Top 5 incidents today
/top/week                             Top 5 weekly
```

### Level 1: Incidents & Detail
```
/incidents/new                        3-step form
/incidents/new/step1                  Step 1: Location (GPS or map)
/incidents/new/step2                  Step 2: Category and description
/incidents/new/step3                  Step 3: Media and submit
/incidents/[id]                       Full incident detail
/neighborhoods/[slug]                 Map filtered by neighborhood
/user/[id]/my-incidents               User's incidents
```

### Level 2: Multimedia Content
```
/content/[id]                         Embedded video player
/admin-contacts/[incident_id]         Official contact history
/reports/neighborhoods/[slug]/[period] Monthly neighborhood report
/reports/monthly/[period]             Global monthly report
```

### Level 3: Community
```
/incidents/[id]/comments              Structured comments
/incidents/[id]/history               Status evolution timeline
/user/[id]/profile                    Profile with activity ranking
/ranking/citizens                     Top 100 active citizens
/ranking/neighborhoods                Neighborhood management ranking
```

### Auth & Admin
```
/signin                               Sign in
/signup                               Sign up
/admin                                Moderation panel
/admin/incidents                      Moderation queue
/admin/reports                        Report generation
/journalist                           Journalist panel
/journalist/assigned                  Assigned Top 5 incidents
```

---

## 4. API Endpoints

### Incidents
```
GET    /api/incidents                  List with filters (geo, category, status, neighborhood)
POST   /api/incidents                  Create incident (auth)
GET    /api/incidents/[id]             Incident detail
PATCH  /api/incidents/[id]/status      Change status (moderator/journalist)
GET    /api/incidents/[id]/history     Status timeline
DELETE /api/incidents/[id]             Delete (moderator)
```

### Votes & Follows
```
POST   /api/incidents/[id]/vote        Vote severity (auth)
POST   /api/incidents/[id]/follow      Follow/unfollow incident (auth)
GET    /api/incidents/[id]/votes        Vote history
```

### Comments
```
GET    /api/incidents/[id]/comments    List comments
POST   /api/incidents/[id]/comments    Add comment (auth)
DELETE /api/comments/[id]              Delete (moderator)
```

### Media
```
POST   /api/upload                     Upload photo/video/audio
GET    /api/content/[id]               Journalistic content
```

### Rankings & Top
```
GET    /api/top?period=week            Top 5 incidents
GET    /api/ranking/neighborhoods?month=... Neighborhood ranking
GET    /api/ranking/citizens           Top active citizens
```

### Neighborhoods & Reports
```
GET    /api/neighborhoods              List neighborhoods with geometries
GET    /api/neighborhoods/[slug]       Neighborhood detail
GET    /api/reports/[neighborhood]/[month] Monthly report
```

### Admin/Moderation
```
GET    /api/admin/moderation           Pending incident queue
POST   /api/admin/moderate/[id]        Approve/reject incident
GET    /api/admin/alerts               Journalist alerts (keywords)
```

---

## 5. Project Workflow (Automated Flows)

### Incident Lifecycle

```
Detection (0-24h)
    User creates incident -> Moderation queue (human moderator)
    Filter: spam, illegal content, duplicates
    If approved -> Published on map, tagged by neighborhood + category
    Option: alert journalism team by keywords

Weekly Prioritization (Cron Job)
    Ranking algorithm: votes x 40% + visits x 20% + urgency x 20% + repetition x 20%
    Generate weekly Top 5
    Notify assigned journalists

Investigation (Week 2)
    Journalist visits Top 5 locations
    Investigation: official data + admin contact
    Video production 3-5 min
    Publication on eldiario.es
    Incident updated: status + hyperlinks to newspaper

Follow-up (Weeks 3-10)
    If official response -> Status: Measures announced
    If no response -> Status: Awaiting response (deadline)
    Physical verification by journalist
    Closure: Resolved or Abandoned (with admin contact archive)
    Final citizen rating

Monthly Impact (Cron Job)
    Report: what changed on the map
    Before/after comparisons (photos, data)
    Neighborhood ranking: best/worst managed by administration
```

### Cron Jobs

| Job | Frequency | Function |
|-----|-----------|----------|
| Weekly ranking | Monday 08:00 | Calculate Top 5, notify journalists |
| Monthly report | 1st of month, 09:00 | Generate reports per neighborhood |
| Check deadlines | Daily 10:00 | Escalate incidents without response |
| Media cleanup | Weekly | Delete orphaned uploads |

---

## 6. Moderation (Human-Based)

### Moderation Flow

```
New incident -> Moderation queue -> Human moderator:
  1. Verify category/subcategory is correct
  2. Check for spam (generic text, suspicious links)
  3. Check for illegal content (threats, personal data)
  4. Check for duplicates (similar text + geographic proximity)
  5. Decision:
     - Approve: publish on public map
     - Edit: fix category/tags, then publish
     - Reject: notify user with reason
     - Flag: escalate to coordinator
```

### Moderation Panel Features
- Queue of pending incidents sorted by creation time
- Quick-action buttons: approve, reject, edit, flag
- Duplicate detection: show nearby incidents with similar text
- Keyword alerts: configurable per journalist/topic
- Moderation stats: approved/rejected ratio, average response time

---

## 7. Development Phases

### Phase 1: MVP (Weeks 1-6)

**Weeks 1-2: Base infrastructure**
- [x] Initialize Next.js + TypeScript + Tailwind + shadcn/ui project
- [~] Configure PostgreSQL + PostGIS + Prisma *(schema done, needs running DB instance)*
- [x] Data model: User, Neighborhood, Incident, Category
- [x] Authentication with NextAuth (email magic link + Google) *(credentials provider for dev, Google/email when keys provided)*
- [x] Basic API: CRUD incidents *(tRPC routers: incidents, votes, comments, neighborhoods)*

**Weeks 3-4: Map and incidents**
- [x] Integrate Mapbox GL JS with Madrid map
- [ ] Load neighborhood geometries (GeoJSON) *(needs GeoJSON files for Madrid barrios)*
- [x] Display incidents as markers with clustering
- [x] Quick filters: category, neighborhood, status *(category filter bar done)*
- [x] Create incident form (3 steps) *(3-step wizard with map picker, category/subcategory selection, review)*
- [x] Photo upload (local dev, R2 for production)
- [x] Incident detail page *(full detail with photos, timeline, vote/follow/comment actions)*

**Weeks 5-6: Voting and Top 5**
- [x] Severity voting system *(tRPC router done, UI buttons pending)*
- [x] Follow incident *(tRPC router done, UI buttons pending)*
- [x] Bottom bar Top 5 on home *(component done, needs data from DB)*
- [x] Incident search (text + filters) *(tRPC endpoint done, search page UI pending)*
- [x] User profile page with my incidents
- [x] Mobile responsive *(layout is responsive, mobile menu done)*

**Still needed before MVP is functional:**
- [x] **PostgreSQL database running** (Docker Compose with PostGIS, schema pushed, seeded)
- [x] **Incident creation form** (3-step wizard UI with map location picker)
- [x] **Incident detail page** (photo gallery, status timeline, comments, actions)
- [x] **Connect map to real data** (fetch incidents from tRPC, display as markers)
- [x] **Search page UI** (uses existing tRPC endpoint)
- [x] **Photo/media upload** (local filesystem for dev, API at /api/upload)
- [ ] **Neighborhood GeoJSON data** (polygon boundaries for Madrid barrios)
- [x] **Marker clustering** (Mapbox GL JS GeoJSON cluster source)
- [x] **Vote/Follow UI buttons** on incident detail page
- [x] **User profile and "my incidents" pages**

### Phase 2: Moderation & Community (Weeks 7-10)

**Weeks 7-8: Moderation**
- [ ] Moderation queue (admin panel)
- [ ] Duplicate detection by proximity + text similarity
- [ ] Keyword alert system for journalists
- [ ] Full status flow (detected -> resolved/abandoned)

**Weeks 9-10: Community**
- [ ] Structured comments on incidents
- [ ] Status evolution timeline
- [ ] Active citizen ranking (points per activity)
- [ ] Push notifications (status changes, replies)
- [ ] Neighborhood page with statistics

### Phase 3: Journalistic Integration (Weeks 11-14)

**Weeks 11-12: Journalist panel**
- [ ] Journalist dashboard: assigned incidents (Top 5)
- [ ] Admin contact registry
- [ ] Upload audiovisual content (video reports)
- [ ] Link eldiario.es articles to incidents
- [ ] Embedded video player on incident page

**Weeks 13-14: Automated weekly ranking**
- [ ] Prioritization algorithm (votes + visits + urgency + repetition)
- [ ] Weekly cron job: generate Top 5, notify team
- [ ] Public weekly Top 5 view
- [ ] Response deadline system for admin replies

### Phase 4: Reports & Impact (Weeks 15-18)

**Weeks 15-16: Monthly reports**
- [ ] Auto-generate report per neighborhood
- [ ] Before/after comparisons
- [ ] Neighborhood management ranking (best/worst)
- [ ] Public reports view

**Weeks 17-18: Polish and launch**
- [ ] Incident density heatmap
- [ ] Share incidents (social media, direct link)
- [ ] SEO: meta tags, sitemap, structured data
- [ ] E2E tests (Playwright)
- [ ] Performance optimization (lazy loading maps, images)
- [ ] API documentation for eldiario.es integration

---

## 8. Roles & Permissions

| Action | Citizen | Moderator | Journalist | Coordinator |
|--------|---------|-----------|------------|-------------|
| Create incident | Yes | Yes | Yes | Yes |
| Vote/follow | Yes | Yes | Yes | Yes |
| Comment | Yes | Yes | Yes | Yes |
| Moderate incidents | - | Yes | - | Yes |
| Tag/reclassify | - | Yes | Yes | Yes |
| Change status | - | Yes | Yes | Yes |
| Investigate/assign | - | - | Yes | Yes |
| Admin contact | - | - | Yes | Yes |
| Publish content | - | - | Yes | Yes |
| Generate reports | - | - | - | Yes |
| Manage users | - | - | - | Yes |

---

## 9. Macro-categories & Subcategories

### Accessibility & Mobility
- Sidewalks (no ramps, damage)
- Inadequate pedestrian crossings
- Inadequate/missing braille signage
- Blocked bike lanes
- Defective traffic lights
- *Additional content: bike lane maps, ramps by neighborhood*

### Noise
- Nightlife bars
- Construction outside permitted hours
- Terraces without sound insulation
- Commercial venues in residential buildings
- *Additional content: noise zone maps*

### Street Furniture
- Street lights (broken, off, on outside schedule)
- Benches (broken, missing, requested)
- Waste containers (broken, missing, requested)
- Waterless fountains
- *Additional content: "broken neighborhood" ranking*

### Housing
- Illegal tourist apartments
- Buildings in ruins
- Pending renovations
- Illegal advertising/facades

### Health
- Accumulated garbage
- Pest infestations
- Graffiti
- Neglected gardens and lawns

---

## 10. Success Metrics

| Metric | 3-month goal | 6-month goal |
|--------|-------------|-------------|
| Registered users | 1,000 | 5,000 |
| Incidents created/month | 200 | 800 |
| Votes/month | 2,000 | 10,000 |
| Resolved incidents | 10% | 25% |
| Published reports | 20 | 60 |
| Neighborhoods covered | 10 | 30 |
| Admin responses | 5 | 20 |

---

## 11. Folder Structure

```
callesVivas/
  src/
    app/
      (auth)/
        signin/page.tsx
        signup/page.tsx
      (main)/
        page.tsx                    # Home - Map
        search/page.tsx
        top/[period]/page.tsx
      incidents/
        new/
          page.tsx                  # 3-step form
        [id]/
          page.tsx                  # Incident detail
          comments/page.tsx
          history/page.tsx
      neighborhoods/
        [slug]/page.tsx
      user/
        [id]/
          profile/page.tsx
          my-incidents/page.tsx
      content/
        [id]/page.tsx
      admin-contacts/
        [incidentId]/page.tsx
      reports/
        neighborhoods/[slug]/[period]/page.tsx
        monthly/[period]/page.tsx
      ranking/
        citizens/page.tsx
        neighborhoods/page.tsx
      admin/
        page.tsx
        incidents/page.tsx
        reports/page.tsx
      journalist/
        page.tsx
        assigned/page.tsx
      api/
        trpc/[trpc]/route.ts
        upload/route.ts
        auth/[...nextauth]/route.ts
        cron/
          weekly-ranking/route.ts
          monthly-report/route.ts
          check-deadlines/route.ts
    components/
      map/
        InteractiveMap.tsx
        Marker.tsx
        QuickFilters.tsx
        MiniMap.tsx
        Heatmap.tsx
      incidents/
        IncidentForm.tsx
        IncidentDetail.tsx
        StatusTimeline.tsx
        IncidentCard.tsx
        Top5Bar.tsx
      voting/
        VoteButton.tsx
        FollowButton.tsx
        SeverityStars.tsx
      media/
        MediaUpload.tsx
        VideoPlayer.tsx
        PhotoGallery.tsx
      community/
        Comments.tsx
        CitizenRanking.tsx
      layout/
        Header.tsx
        BottomBar.tsx
        CategoryFilters.tsx
      admin/
        ModerationQueue.tsx
        JournalistPanel.tsx
    server/
      trpc/
        router.ts
        incidents.ts
        votes.ts
        comments.ts
        neighborhoods.ts
        ranking.ts
        reports.ts
        admin.ts
      db/
        schema.prisma
        seed.ts
        migrations/
      services/
        moderation.ts
        ranking.ts
        notifications.ts
        reports.ts
        upload.ts
      jobs/
        weekly-ranking.ts
        monthly-report.ts
        check-deadlines.ts
    lib/
      mapbox.ts
      auth.ts
      utils.ts
      constants.ts
    types/
      index.ts
  public/
    icons/
    neighborhoods/                  # GeoJSON neighborhood data
  prisma/
    schema.prisma
  tests/
    e2e/
    unit/
```

---

## 12. Open Technical Decisions

- [ ] Confirm access to eldiario.es API for article integration
- [ ] Source for neighborhood GeoJSON geometries (INE, cadastre, OpenStreetMap)
- [ ] Media retention policy (duration, max resolution)
- [ ] Rate-limiting strategy for votes and incident creation
- [ ] Caching strategy for map tiles and frequent queries
- [ ] Hosting plan and estimated monthly budget
- [ ] Agreement with eldiario.es on integration format (embed, iframe, API)
