# CallesVivas - Complete Design Specification

## Overview

CallesVivas ("Living Streets") is a civic reporting web app integrated with eldiario.es. Citizens report neighborhood issues on an interactive map, vote on priorities, and journalists investigate the top concerns. The design is **map-first** — the map dominates every public-facing screen.

Target audience: Spanish citizens (25-55), mobile-first usage. The UI language is Spanish.

---

## 1. Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1A56DB` | Headers, CTAs, links, active filters |
| `primary-dark` | `#1E3A5F` | Header background, hover states |
| `accent` | `#E63946` | Vote buttons, urgency indicators, alerts |
| `success` | `#2D9F4F` | Resolved status, positive feedback |
| `warning` | `#F59E0B` | In-progress statuses, deadlines approaching |
| `error` | `#EF4444` | Errors, awaiting response status |
| `purple` | `#8B5CF6` | Moderation status, housing category |
| `orange` | `#F97316` | Admin contact status |
| `cyan` | `#06B6D4` | Measures announced status |
| `bg` | `#F8FAFC` | Page background |
| `card` | `#FFFFFF` | Cards, inputs, panels |
| `border` | `#E2E8F0` | Card borders, dividers |
| `text` | `#334155` | Body text |
| `heading` | `#0F172A` | Headings |
| `muted` | `#94A3B8` | Placeholder text, captions |

### Typography

Font: **Inter** (Google Fonts). Fallback: system-ui, sans-serif.

| Token | Size | Weight | Line-height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 32px | 700 | 1.2 | Hero titles (reports page) |
| `h1` | 28px | 700 | 1.3 | Page titles |
| `h2` | 22px | 600 | 1.3 | Section headings |
| `h3` | 18px | 600 | 1.4 | Card titles, incident titles |
| `body` | 16px | 400 | 1.5 | Body text, descriptions |
| `small` | 14px | 400 | 1.4 | Secondary text, filter labels |
| `caption` | 12px | 400 | 1.4 | Timestamps, vote counts, badges |
| `button` | 14px | 600 | 1 | Button labels |

### Spacing Scale

4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Inputs, small elements |
| `md` | 8px | Cards, buttons |
| `lg` | 12px | Modals, panels |
| `full` | 9999px | Pills, badges, avatars, FAB |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `md` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards |
| `lg` | `0 4px 12px rgba(0,0,0,0.15)` | Modals, FAB, popovers |
| `fab` | `0 4px 12px rgba(26,86,219,0.4)` | FAB specific |

### Icons

Lucide icon set. Size: 20px inline, 24px standalone. Stroke: 1.5px.

---

## 2. Category Visual System

Each macro-category has a unique color and icon, used on map markers, filter chips, and cards.

| Category | Color | Hex | Map Marker Icon | Filter Chip Icon |
|----------|-------|-----|-----------------|------------------|
| Accessibility & Mobility | Blue | `#3B82F6` | Wheelchair | Footprints |
| Noise | Red | `#EF4444` | Volume2 | VolumeX |
| Street Furniture | Amber | `#F59E0B` | Lamp | Wrench |
| Housing | Purple | `#8B5CF6` | Home | Building2 |
| Health | Green | `#10B981` | HeartPulse | Bug |

### Subcategories (shown as text labels under category, no unique icons)
- **Accessibility**: Sidewalks, Pedestrian crossings, Braille signage, Bike lanes, Traffic lights
- **Noise**: Nightlife bars, Construction, Terraces, Commercial in residential
- **Street Furniture**: Street lights, Benches, Waste containers, Fountains
- **Housing**: Tourist apartments, Ruined buildings, Pending renovations, Illegal facades
- **Health**: Garbage, Pests, Graffiti, Gardens/lawns

---

## 3. Status Visual System

Every incident has a status. Each status has a color, badge style, and timeline icon.

| Status | Spanish Label | Color | Badge | Timeline Icon |
|--------|--------------|-------|-------|---------------|
| Detected | Detectado | `#6B7280` gray | Outline gray pill | Filled gray circle |
| In Moderation | En moderacion | `#8B5CF6` purple | Outline purple pill | Filled purple circle |
| Published | Publicado | `#1A56DB` blue | Solid blue pill | Filled blue circle |
| In Contact | En contacto | `#F59E0B` amber | Solid amber pill | Filled amber circle |
| Admin Contact | Contacto admin. | `#F97316` orange | Solid orange pill | Filled orange circle |
| Measures Announced | Medidas anunciadas | `#06B6D4` cyan | Solid cyan pill | Filled cyan circle |
| Awaiting Response | En espera | `#EF4444` red | Solid red pill with pulse animation | Pulsing red circle |
| Resolved | Resuelto | `#2D9F4F` green | Solid green pill with checkmark icon | Green circle with check |
| Abandoned | Abandonado | `#6B7280` gray | Solid gray pill with strikethrough text | Gray circle with X |

---

## 4. Map Marker Design

### Default Marker
- 32px circle, category color fill, white icon inside (16px)
- 2px white border, shadow-sm
- Small triangle pointer at bottom pointing to exact location

### Selected Marker
- 40px circle, same color, white icon (20px)
- 3px white border, shadow-lg
- Bounces slightly on selection

### Cluster Marker
- Circle sized by count: 40px (2-9), 50px (10-49), 60px (50+)
- `primary-dark` background, white text showing count
- No icon, just number

### Resolved Marker
- Same as default but 40% opacity, desaturated

### Heatmap Mode
- Gradient: transparent -> yellow -> orange -> red
- Replaces individual markers when enabled

---

## 5. Responsive Breakpoints

| Name | Width | Columns | Gutter |
|------|-------|---------|--------|
| Mobile | 0 - 639px | 1 | 16px |
| Tablet | 640 - 1023px | 2 | 24px |
| Desktop | 1024px+ | 3+ | 32px |

---

## 6. Screen-by-Screen Specifications

### SCREEN 01: Home / Map (Public - Level 0)

**Route**: `/`

**Purpose**: Main screen. Full-screen interactive map showing all active incidents. Entry point for everything.

**Mobile Layout** (375px reference):
```
┌─────────────────────────────────────┐
│ [CallesVivas logo]  [Search] [Menu] │ 48px, white bg, border-bottom
├─────────────────────────────────────┤
│ [Accesibilidad] [Ruido] [Mobiliario]│ 40px, horizontal scroll chips
│ [Vivienda] [Salud] [Estado ▼]      │ with category colors
├─────────────────────────────────────┤
│                                     │
│                                     │
│          INTERACTIVE MAP            │ Fills remaining viewport
│       (Mapbox, dark streets style)  │
│                                     │
│    [marker] [marker]                │ Category-colored markers
│         [cluster: 12]              │
│                                     │
│                         ┌───┐       │
│                         │ + │       │ FAB: 56px, primary color
│                         └───┘       │ 16px from bottom-right
├─────────────────────────────────────┤
│ TOP 5 ▸ [Card1] [Card2] [Card3]    │ 88px, horizontal scroll
│         [Card4] [Card5]             │ incident mini-cards
└─────────────────────────────────────┘
```

**Desktop Layout** (1440px reference):
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]        [____Search incidents...__]      [Iniciar sesion] │ 56px header
├──────────────────────────────────────────────────────────────┤
│ Filtros: [Accesibilidad] [Ruido] [Mobiliario] [Vivienda]     │ 44px filter bar
│          [Salud] [Estado ▼] [Barrio ▼]     [Top 5 semana ▸] │
├───────────────────────────────────────────┬──────────────────┤
│                                           │                  │
│                                           │  SIDE PANEL      │
│                                           │  380px width     │
│            INTERACTIVE MAP                │                  │
│            (75% width)                    │  Shows either:   │
│                                           │  - Incident list │
│                                           │  - Incident detail│
│    [markers with clustering]              │  - Neighborhood  │
│                                           │    stats         │
│                       [+ Anadir]          │                  │
│                                           │  [Close X]       │
├───────────────────────────────────────────┴──────────────────┤
│ TOP 5 SEMANAL: 1.[Card] 2.[Card] 3.[Card] 4.[Card] 5.[Card]│ 80px
└──────────────────────────────────────────────────────────────┘
```

**Elements on this screen**:
- **Header**: Logo left, search center/right, auth button right. White bg, `border` bottom.
- **Filter bar**: Horizontal scroll of pill-shaped chips. Each chip shows category icon + name. Active = filled with category color + white text. Inactive = white bg + `border` outline. Additional dropdown for "Status" and "Neighborhood" on desktop.
- **Map**: Mapbox GL JS. Default center: Madrid (40.4168, -3.7038), zoom 13. Dark streets base style. Markers use category colors. Clusters show count. Tap marker = open incident detail. Long-press = start new incident at that location.
- **FAB** (mobile only): 56px circle, `primary` bg, white Plus icon, `fab` shadow. Bottom-right corner, 16px margin. Tapping opens the new incident form.
- **Top 5 Bar**: Fixed at bottom. `card` background, `shadow-lg` top. Horizontal scroll of mini incident cards (240px wide, 72px tall each). Shows: thumbnail 48x48, title (1 line truncated), neighborhood name, vote count. Tapping a card opens incident detail. Label "TOP 5" on the left.
- **Desktop side panel**: Initially hidden. Opens when user clicks a marker or list item. Slides in from right, 380px, white bg, `shadow-lg`. Has close (X) button top-right. Content changes contextually.

**User interactions**:
- Tap filter chip -> toggle filter on map, URL updates with query param
- Tap marker -> open incident detail (mobile: full screen / desktop: side panel)
- Tap cluster -> zoom in to expand cluster
- Long-press map -> open new incident form with that location pre-filled
- Tap FAB (+) -> navigate to `/incidents/new`
- Tap Top 5 card -> open incident detail
- Tap search -> open search overlay
- Tap "Iniciar sesion" -> navigate to `/signin`
- Pinch/scroll -> zoom map
- Tap GPS button (bottom-left of map) -> center on user's location

**Empty state**: If no incidents in current view, show translucent overlay on map center: "No hay incidencias en esta zona. Se el primero en reportar un problema." with a CTA button "Anadir incidencia".

---

### SCREEN 02: Search Overlay

**Route**: `/search?q=...`

**Purpose**: Search incidents by text query. Shows results as a list with map preview.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ [←] [____Search..._____________] [X]│ 48px, auto-focus input
├─────────────────────────────────────┤
│ Recientes: ruido chueca, farola...  │ Recent searches (gray chips)
├─────────────────────────────────────┤
│ Resultados (23)                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [img] Acera rota C/ Mayor       │ │ Incident card
│ │       Chueca · Accesibilidad    │ │ thumbnail + title + meta
│ │       23 votos · Publicado      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [img] Ruido bar nocturno        │ │
│ │       Malasana · Ruido          │ │
│ │       45 votos · En contacto    │ │
│ └─────────────────────────────────┘ │
│ ...                                 │
└─────────────────────────────────────┘
```

**Desktop**: Search results appear in the side panel with matching markers highlighted on map.

**Elements**:
- Search input: auto-focused, debounced 300ms, shows results as user types
- Recent searches: row of gray pill chips, tapping fills search input
- Result list: incident cards (full-width), each showing thumbnail, title, neighborhood, category badge, vote count, status badge. Tapping navigates to incident detail.
- Result count shown at top

**Empty state**: "No se encontraron resultados para '{query}'. Intenta con otros terminos."

---

### SCREEN 03: Top 5 Page

**Route**: `/top/week` or `/top/today`

**Purpose**: Dedicated page for the weekly/daily Top 5 ranked incidents.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Top 5 Semanal                     │ 48px header
├─────────────────────────────────────┤
│ [Hoy] [Esta semana] [Este mes]      │ Tab toggle
├─────────────────────────────────────┤
│ Semana 12 · 17-23 Mar 2026          │ Period label
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 1  [LARGE PHOTO]                │ │ #1 incident - featured
│ │    Acera rota en C/ Mayor       │ │ large card with big photo
│ │    Chueca · 23 votos            │ │ 200px photo height
│ │    Estado: En contacto          │ │
│ │    [Votar] [Ver detalle →]      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 2  [img] Ruido bar Sol          │ │ #2-5: regular cards
│ │    Sol · 18 votos · Publicado   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 3  [img] Farola rota Lavapies  │ │
│ │    Lavapies · 15 votos          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 4  [img] Basura acumulada       │ │
│ │    Tetuan · 12 votos            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 5  [img] Paso peatones roto     │ │
│ │    Chamberi · 10 votos          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Desktop**: Two-column. Left: Top 5 list. Right: Map showing only the 5 locations with numbered markers.

**Elements**:
- Period tabs: Today / This week / This month
- Rank number: large, bold, `primary` color, left of each card
- #1 card: featured layout with large photo (200px), title h2, full description preview, vote button, and "View detail" CTA
- #2-5 cards: standard incident cards with rank number
- Each card shows: rank, thumbnail, title, neighborhood, vote count, status badge

---

### SCREEN 04: Sign In

**Route**: `/signin`

**Purpose**: User authentication. Clean, minimal.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver                            │
├─────────────────────────────────────┤
│                                     │
│         [CallesVivas Logo]          │ Centered, 64px
│                                     │
│   Inicia sesion para participar     │ h2, centered
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [G] Continuar con Google        │ │ OAuth button, outline
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [Apple] Continuar con Apple     │ │ OAuth button, black
│ └─────────────────────────────────┘ │
│                                     │
│ ────── o ──────                     │ Divider with "or"
│                                     │
│ Email                               │
│ ┌─────────────────────────────────┐ │
│ │ tu@email.com                    │ │ Input field
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │     Enviar enlace magico        │ │ Primary button, full-width
│ └─────────────────────────────────┘ │
│                                     │
│ No tienes cuenta? Registrate        │ Link to /signup
│                                     │
└─────────────────────────────────────┘
```

**Desktop**: Centered card (440px max-width), map visible blurred in background.

**Elements**:
- Logo: centered, 64px
- Title: "Inicia sesion para participar"
- Google OAuth button: white bg, border, Google icon left
- Apple OAuth button: black bg, white text, Apple icon left
- Divider: line with "o" centered
- Email input: standard text input, placeholder "tu@email.com"
- Magic link button: `primary` bg, full-width, "Enviar enlace magico"
- Footer link: "No tienes cuenta? Registrate" -> `/signup`

---

### SCREEN 05: Sign Up

**Route**: `/signup`

**Purpose**: New user registration.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver                            │
├─────────────────────────────────────┤
│         [CallesVivas Logo]          │
│                                     │
│   Unete a tu comunidad              │ h2
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [G] Registrarse con Google      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [Apple] Registrarse con Apple   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ────── o ──────                     │
│                                     │
│ Nombre                              │
│ ┌─────────────────────────────────┐ │
│ │ Tu nombre                       │ │
│ └─────────────────────────────────┘ │
│ Email                               │
│ ┌─────────────────────────────────┐ │
│ │ tu@email.com                    │ │
│ └─────────────────────────────────┘ │
│ Tu barrio                           │
│ ┌─────────────────────────────────┐ │
│ │ Seleccionar barrio ▼            │ │ Dropdown
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │       Crear cuenta              │ │ Primary button
│ └─────────────────────────────────┘ │
│                                     │
│ Ya tienes cuenta? Inicia sesion     │
└─────────────────────────────────────┘
```

**Elements**:
- Same structure as sign in, plus name and neighborhood fields
- Neighborhood dropdown: searchable, lists all neighborhoods alphabetically
- Footer link to `/signin`

---

### SCREEN 06: New Incident - Step 1: Location

**Route**: `/incidents/new/step1`

**Purpose**: Select the exact location of the problem on the map.

**Requires auth**: Yes. If not signed in, redirect to `/signin` with return URL.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Cancelar      Paso 1 de 3        │ Header
├─────────────────────────────────────┤
│ [===-------] Step progress bar      │ 33% filled, primary color
├─────────────────────────────────────┤
│ Donde esta el problema?             │ h2
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [Search] Buscar direccion...    │ │ Address search input
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│                                     │
│                                     │
│           MAP (70% height)          │
│                                     │
│              [+]  <- crosshair      │ Fixed center crosshair
│                   marker            │ (moves with map pan)
│                                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [GPS] Usar mi ubicacion        │ │ GPS button, outline
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Ubicacion: C/ Mayor 15, Chueca     │ Auto-resolved address
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     Confirmar ubicacion →       │ │ Primary button, full-width
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Desktop**: Map takes 60% left, address/confirm panel on right.

**Elements**:
- Progress bar: 3 steps, step 1 active. Thin bar (`primary` fill) at top.
- Title: "Donde esta el problema?"
- Address search: autocomplete input using Mapbox Geocoding
- Map: Interactive, user pans to position. Fixed crosshair icon (+) at exact center. As user pans, address auto-resolves via reverse geocoding and updates below map.
- GPS button: "Usar mi ubicacion" — centers map on device GPS
- Resolved address text: shows current address under map, updates live
- Confirm button: "Confirmar ubicacion" -> navigates to step 2

---

### SCREEN 07: New Incident - Step 2: Category & Description

**Route**: `/incidents/new/step2`

**Purpose**: Select category/subcategory and describe the problem.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Atras         Paso 2 de 3        │
├─────────────────────────────────────┤
│ [======----] Step progress bar      │ 66%
├─────────────────────────────────────┤
│ Que tipo de problema es?            │ h2
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │ Category grid
│ │  ♿  │ │  🔊  │ │  🏗  │         │ 2 or 3 columns
│ │Acces.│ │Ruido │ │Mobil.│         │ Tappable cards
│ └──────┘ └──────┘ └──────┘         │ 80x80px each
│ ┌──────┐ ┌──────┐                  │ Icon + label
│ │  🏠  │ │  🏥  │                  │ Selected: primary
│ │Vivien│ │Salud │                  │ border + bg tint
│ └──────┘ └──────┘                  │
├─────────────────────────────────────┤
│ Subcategoria                        │ Appears after category
│ ┌─────────────────────────────────┐ │ selection
│ │ Aceras ▼                        │ │ Dropdown
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Titulo                              │
│ ┌─────────────────────────────────┐ │
│ │ Acera rota en C/ Mayor          │ │ 80 char max
│ └─────────────────────────────────┘ │ Character counter
│                              45/80  │
├─────────────────────────────────────┤
│ Descripcion                         │
│ ┌─────────────────────────────────┐ │
│ │ La acera lleva 3 meses rota...  │ │ Textarea
│ │                                 │ │ 500 char max
│ │                                 │ │ 120px min-height
│ └─────────────────────────────────┘ │
│                             120/500 │
├─────────────────────────────────────┤
│ [← Atras]        [Siguiente →]     │ Two buttons
└─────────────────────────────────────┘
```

**Elements**:
- Category grid: 5 cards in 2-3 column grid. Each 80x80px. Shows category icon (Lucide, 32px) + name. Unselected: white bg, `border`. Selected: category color bg at 10% opacity + category color border + category color icon.
- Subcategory dropdown: appears after category selection. Lists relevant subcategories.
- Title input: text input, 80 char max, live character counter (right-aligned, `muted` color, turns `error` at 75+)
- Description textarea: 500 char max, live counter, min-height 120px
- Navigation: "Atras" (outline button) left, "Siguiente" (primary button) right

---

### SCREEN 08: New Incident - Step 3: Media & Submit

**Route**: `/incidents/new/step3`

**Purpose**: Attach photos/video/audio and submit.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Atras         Paso 3 de 3        │
├─────────────────────────────────────┤
│ [=========] Step progress bar       │ 100%
├─────────────────────────────────────┤
│ Anade fotos o videos                │ h2
├─────────────────────────────────────┤
│ Fotos (max 5)                       │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │ Photo grid
│ │img1│ │img2│ │ +  │ │    │       │ 80x80px thumbnails
│ └────┘ └────┘ └────┘ └────┘       │ + button to add
│                                     │ X to remove each
├─────────────────────────────────────┤
│ Video (opcional, max 30s)           │
│ ┌─────────────────────────────────┐ │
│ │ [Camera] Grabar o subir video   │ │ Upload area
│ └─────────────────────────────────┘ │ Dashed border
├─────────────────────────────────────┤
│ Audio (opcional, max 30s)           │
│ ┌─────────────────────────────────┐ │
│ │ [Mic] Grabar nota de voz       │ │ Record button
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ── Vista previa ──                  │ Preview section
│ ┌─────────────────────────────────┐ │
│ │ [Photo] Acera rota C/ Mayor     │ │ Shows how the
│ │ Chueca · Accesibilidad          │ │ incident card
│ │ "La acera lleva 3 meses..."     │ │ will look
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │       Enviar incidencia         │ │ Primary button
│ └─────────────────────────────────┘ │ full-width
└─────────────────────────────────────┘
```

**Elements**:
- Photo grid: horizontal row of 80x80 thumbnails. "+" button to add. X overlay on each to remove. Max 5 photos, 5MB each. Opens device camera/gallery.
- Video upload: dashed border area, camera icon + text. Opens camera or file picker. Shows video thumbnail + duration after upload. Max 30s, 20MB.
- Audio recording: microphone icon button. Tap to start recording, tap again to stop. Shows waveform + duration after recording. Max 30s.
- Preview card: read-only incident card showing first photo, title, neighborhood, category, and description truncated. Shows exactly how it will appear on the map.
- Submit button: "Enviar incidencia" — primary, full-width. Shows loading spinner during upload. On success, navigates to the new incident's detail page.

**Success state**: Brief success toast "Incidencia enviada. Esta en revision." then redirect to incident detail.

---

### SCREEN 09: Incident Detail

**Route**: `/incidents/[id]`

**Purpose**: Full detail view of a single incident. Most important content screen.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver al mapa    #1234          │ 48px header, incident ID
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ Photo gallery
│ │      [Photo 1 of 3]            │ │ Full-width, 240px height
│ │                                 │ │ Swipeable dots below
│ │  ←                          →  │ │
│ └─────────────────────────────────┘ │
│  ● ○ ○                             │ Dot indicators
├─────────────────────────────────────┤
│ [Publicado]  ⭐ 23 votos  👁 156   │ Status + votes + views
├─────────────────────────────────────┤
│ Acera rota en C/ Mayor 15          │ h2 title
│ Chueca · Accesibilidad > Aceras    │ Neighborhood + category
├─────────────────────────────────────┤
│ La acera del numero 15 de la       │ Description
│ Calle Mayor lleva rota desde       │ body text
│ hace 3 meses. Varios vecinos...    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │         [MINI MAP]              │ │ Static mini-map
│ │           [pin]                 │ │ 150px height
│ │  C/ Mayor 15, Chueca, Madrid   │ │ Centered on incident
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ── Evolucion ──                     │ Status timeline
│                                     │
│ ● 20/04/2026  Detectado            │ Vertical timeline
│ │  Reportado por @usuario123       │ with connecting line
│ │                                   │
│ ● 22/04/2026  Publicado            │ Filled circles =
│ │  Aprobado por moderacion         │ completed steps
│ │                                   │
│ ● 25/04/2026  En contacto          │
│ │  Periodista asignado             │
│ │                                   │
│ ○ Siguiente: Contacto admin.       │ Empty circle =
│                                     │ pending step
├─────────────────────────────────────┤
│ ── Contenido periodistico ──       │ Media section
│                                     │ (only if content exists)
│ ┌─────────────────────────────────┐ │
│ │ ▶  Reportaje: Aceras rotas     │ │ Video player card
│ │    en Chueca (3:45)             │ │ Thumbnail + play icon
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📰 "Las aceras de Chueca..."   │ │ Article link card
│ │    eldiario.es · 26/04/2026    │ │ Opens in new tab
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ── Contacto administrativo ──      │ Admin contact log
│                                     │ (only if contacts exist)
│ 📧 25/04 Email a Junta Distrito   │
│    Respuesta: Pendiente            │
│ 📞 28/04 Llamada a Concejalia     │
│    Respuesta: "En tramite"         │
├─────────────────────────────────────┤
│ ── Comentarios (8) ──              │
│                                     │
│ [@maria] Yo tambien lo he visto,   │ Comment list
│ es peligroso para sillas de rueda  │ Avatar + name + text
│ hace 2 dias · 3 likes              │ + timestamp + likes
│                                     │
│ [@pedro] Llevo meses quejandome   │
│ al ayuntamiento sin respuesta      │
│ hace 1 dia · 5 likes               │
│                                     │
│ Ver todos los comentarios →         │ Link to full comments
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Escribe un comentario...        │ │ Comment input
│ │                        [Enviar] │ │
│ └─────────────────────────────────┘ │
├═════════════════════════════════════┤
│ [⭐ Votar] [❤️ Seguir] [💬] [📤]  │ STICKY bottom bar
│            12 siguiendo             │ 56px, white, shadow-lg top
└─────────────────────────────────────┘
```

**Desktop**: Two-column. Left: photo gallery + description + timeline + media. Right: mini-map + actions + comments. Side panel or full page.

**Elements**:
- **Photo gallery**: full-width swipeable. Dots below. 240px height mobile. If no photos, show category color gradient with large icon.
- **Status + metrics row**: status badge (colored pill), vote count with star icon, view count with eye icon. All in `small` text.
- **Title**: h2, `heading` color
- **Location**: neighborhood name (link to neighborhood page) + category > subcategory in `muted` color
- **Description**: body text, full content
- **Mini-map**: 150px height, static Mapbox map centered on incident location with single marker. Address text below. Tapping opens in full map.
- **Status timeline**: vertical line with circles. Completed steps: filled circle in status color + date + description. Pending: empty circle, dashed line. Most recent at bottom.
- **Journalistic content**: only shown if content exists. Video player card (thumbnail + play icon + title + duration). Article link card (newspaper icon + title + source + date). Tapping video opens embedded player. Tapping article opens eldiario.es in new tab.
- **Admin contact log**: only shown if contacts exist. Chronological list. Each entry: icon (email/phone/visit), date, agency name, response status.
- **Comments**: last 3 shown with "View all" link. Each: avatar (32px circle), username, text, timestamp, like count + like button.
- **Comment input**: text input + send button. Requires auth.
- **Sticky bottom bar** (mobile): 56px, white bg, `shadow-lg` top. Four action buttons evenly spaced:
  - Vote (star icon + "Votar" + count) — `accent` color when voted
  - Follow (heart icon + "Seguir" + count) — `primary` when following
  - Comment (speech bubble icon) — scrolls to comment input
  - Share (share icon) — opens native share sheet or copy link

---

### SCREEN 10: Incident Comments (Full)

**Route**: `/incidents/[id]/comments`

**Purpose**: Full paginated comment list for an incident.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver    Comentarios (47)        │
├─────────────────────────────────────┤
│ Ordenar por: [Recientes ▼]          │ Sort dropdown
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [avatar] @maria · hace 2h      │ │
│ │ Yo tambien lo he visto, es     │ │
│ │ peligroso para sillas de rueda │ │
│ │ ♡ 3                            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [avatar] @pedro · hace 1d      │ │
│ │ Llevo meses quejandome al      │ │
│ │ ayuntamiento sin respuesta     │ │
│ │ ♡ 5                            │ │
│ └─────────────────────────────────┘ │
│ ... more comments ...               │
│                                     │
│ [Cargar mas]                        │ Pagination
├═════════════════════════════════════┤
│ [Escribe un comentario...] [Enviar] │ Sticky input
└─────────────────────────────────────┘
```

**Elements**:
- Sort dropdown: "Recientes" (newest first) or "Populares" (most liked)
- Comment cards: avatar (32px), username link, relative timestamp, text, like button + count
- Pagination: "Cargar mas" button (load 20 more)
- Sticky comment input at bottom

---

### SCREEN 11: Incident Status History

**Route**: `/incidents/[id]/history`

**Purpose**: Full timeline of all status changes with details.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver    Historial #1234         │
├─────────────────────────────────────┤
│                                     │
│ ● 20/04/2026 09:15                  │ Each entry:
│ │ Estado: Detectado                 │ date/time
│ │ Por: @usuario123                  │ status badge
│ │ "Incidencia creada"               │ actor
│ │                                   │ note
│ ● 20/04/2026 14:30                  │
│ │ Estado: Publicado                 │
│ │ Por: @moderador_ana               │
│ │ "Aprobado, categoria correcta"    │
│ │                                   │
│ ● 25/04/2026 11:00                  │
│ │ Estado: En contacto               │
│ │ Por: @periodista_luis             │
│ │ "Asignado para investigacion"     │
│ │                                   │
│ ● 28/04/2026 16:45                  │
│ │ Estado: Contacto admin.           │
│ │ Por: @periodista_luis             │
│ │ "Email enviado a Junta Distrito   │
│ │  Centro, ref: JDC-2026-0456"     │
│ │                                   │
│ ○ Pendiente                         │
│   Esperando respuesta               │
│   Fecha limite: 12/05/2026          │
│                                     │
└─────────────────────────────────────┘
```

---

### SCREEN 12: Neighborhood Page

**Route**: `/neighborhoods/[slug]`

**Purpose**: Map filtered to a single neighborhood with stats.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver         Chueca             │ Neighborhood name
├─────────────────────────────────────┤
│ [Accesibilidad] [Ruido] [Mobiliario]│ Category filters
├─────────────────────────────────────┤
│                                     │
│        MAP (zoomed to Chueca)       │ Map bounded to
│        [markers within area]        │ neighborhood geometry
│                                     │
│                         [+]         │
├─────────────────────────────────────┤
│ ── Estadisticas ──                  │
│                                     │
│ Incidencias activas:  34            │ Stats summary
│ Resueltas este mes:   5             │
│ Tiempo medio resol.: 21 dias       │
│ Categoria top: Ruido (12)           │
├─────────────────────────────────────┤
│ ── Incidencias recientes ──        │
│                                     │
│ [Incident card 1]                   │ List of incidents
│ [Incident card 2]                   │ in this neighborhood
│ [Incident card 3]                   │
│ Ver todas (34) →                    │
├─────────────────────────────────────┤
│ ── Informes mensuales ──           │
│                                     │
│ [📊 Abril 2026] [📊 Marzo 2026]    │ Monthly report links
└─────────────────────────────────────┘
```

**Desktop**: Map left (60%), stats + incident list right (40%).

**Elements**:
- Map: bounded/zoomed to neighborhood polygon. Polygon outline visible. Only shows incidents within this neighborhood.
- Stats section: key numbers in a 2x2 grid. Active incidents, resolved this month, average resolution time, top category.
- Recent incidents: list of latest incident cards
- Monthly reports: horizontal scroll of report cards linking to neighborhood reports

---

### SCREEN 13: User Profile

**Route**: `/user/[id]/profile`

**Purpose**: Public user profile with activity summary.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver        Perfil              │
├─────────────────────────────────────┤
│                                     │
│        [Avatar 80px]                │ Centered
│        @usuario123                  │ Username
│        Chueca, Madrid               │ Neighborhood
│        Miembro desde Ene 2026       │ Join date
│                                     │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │ Stats cards
│ │  12  │ │  45  │ │  8   │         │ 3 columns
│ │Incid.│ │Votos │ │Coment│         │
│ └──────┘ └──────┘ └──────┘         │
├─────────────────────────────────────┤
│ Ranking ciudadano: #23              │ Activity ranking
│ ████████████░░░░ 340 puntos         │ Progress bar
├─────────────────────────────────────┤
│ [Mis incidencias] [Mis votos]       │ Tab toggle
│ [Siguiendo]                         │
├─────────────────────────────────────┤
│ [Incident card 1]                   │ Filtered list
│ [Incident card 2]                   │ per active tab
│ [Incident card 3]                   │
│ ...                                 │
└─────────────────────────────────────┘
```

**Elements**:
- Avatar: 80px circle, initials fallback if no image
- Username, neighborhood, join date
- Stats: 3-column grid showing incident count, vote count, comment count
- Ranking: position number + progress bar toward next level + total points
- Tabs: "Mis incidencias" (my incidents), "Mis votos" (my votes), "Siguiendo" (following). Each shows relevant incident list.

---

### SCREEN 14: My Incidents

**Route**: `/user/[id]/my-incidents`

**Purpose**: User's own incidents with status tracking.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver    Mis incidencias (12)    │
├─────────────────────────────────────┤
│ [Todas] [Activas] [Resueltas]       │ Status filter tabs
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [img] Acera rota C/ Mayor       │ │ Incident card with
│ │ Chueca · 23 votos               │ │ prominent status badge
│ │ [En contacto 🟡] hace 3 dias   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [img] Farola apagada            │ │
│ │ Chueca · 5 votos                │ │
│ │ [Publicado 🔵] hace 1 semana   │ │
│ └─────────────────────────────────┘ │
│ ...                                 │
└─────────────────────────────────────┘
```

---

### SCREEN 15: Citizen Ranking

**Route**: `/ranking/citizens`

**Purpose**: Leaderboard of most active citizens.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver    Ranking ciudadanos      │
├─────────────────────────────────────┤
│ [Esta semana] [Este mes] [Total]    │ Period tabs
├─────────────────────────────────────┤
│ 🥇 1. @maria_lopez     1,240 pts   │ Top 3: special
│ 🥈 2. @pedro_garcia      980 pts   │ styling with medal
│ 🥉 3. @ana_martinez      870 pts   │ icons
├─────────────────────────────────────┤
│  4. [av] @luis_sanchez    650 pts   │ Rest: numbered list
│  5. [av] @carmen_ruiz     590 pts   │ with avatar + name
│  6. [av] @jose_diaz       540 pts   │ + points
│  7. [av] @elena_garcia    510 pts   │
│  ...                                │
│ 100. [av] @pablo_vega     120 pts   │
├─────────────────────────────────────┤
│ ── Tu posicion ──                   │ Sticky section
│ #23 @tu_usuario  340 pts            │ if user is logged in
└─────────────────────────────────────┘
```

**Elements**:
- Period tabs: This week / This month / All time
- Top 3: large text, medal icons, highlighted background
- Rest: standard list rows with rank number, avatar, username, points
- Points breakdown: incidents created (10pts), votes cast (1pt), comments (2pts), incident resolved (50pts)
- Current user's position: sticky at bottom if logged in

---

### SCREEN 16: Neighborhood Ranking

**Route**: `/ranking/neighborhoods`

**Purpose**: Ranking of best/worst managed neighborhoods by admin responsiveness.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver    Ranking barrios         │
├─────────────────────────────────────┤
│ [Abril 2026 ▼]                      │ Month selector
├─────────────────────────────────────┤
│ Mejor gestionados                   │ Section header (green)
│                                     │
│ 1. Salamanca  ████████░░ 82%        │ Bar chart style
│    12 resueltas / 15 totales        │ Percentage = resolved
│                                     │
│ 2. Retiro     ███████░░░ 71%        │
│    10 resueltas / 14 totales        │
│                                     │
│ 3. Chamberi   ██████░░░░ 65%        │
├─────────────────────────────────────┤
│ Peor gestionados                    │ Section header (red)
│                                     │
│ 1. Tetuan     ██░░░░░░░░ 18%       │
│    3 resueltas / 17 totales         │
│                                     │
│ 2. Villaverde ███░░░░░░░ 22%        │
│    2 resueltas / 9 totales          │
├─────────────────────────────────────┤
│ [Ver informe completo →]            │ Link to monthly report
└─────────────────────────────────────┘
```

---

### SCREEN 17: Monthly Report

**Route**: `/reports/monthly/[period]` or `/reports/neighborhoods/[slug]/[period]`

**Purpose**: Monthly summary of what changed, before/after, and stats.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver    Informe Abril 2026      │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [Map showing month's activity]  │ │ Overview map
│ │  with resolved (green) and      │ │ 200px height
│ │  new (blue) markers             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ── Resumen ──                       │
│                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐         │ Stat cards
│ │  67  │ │  12  │ │  89  │         │ 3 columns
│ │Nuevas│ │Resuel│ │Votos │         │
│ └──────┘ └──────┘ └──────┘         │
├─────────────────────────────────────┤
│ ── Antes / Despues ──              │
│                                     │
│ C/ Mayor 15, Chueca                │ Comparison cards
│ ┌───────────┬───────────┐          │ Side-by-side photos
│ │  [Antes]  │ [Despues] │          │
│ │  20/03    │  15/04    │          │
│ └───────────┴───────────┘          │
│ Estado: Resuelto ✓                  │
│                                     │
│ Avda. Gran Via 45, Sol             │
│ ┌───────────┬───────────┐          │
│ │  [Antes]  │ [Despues] │          │
│ └───────────┴───────────┘          │
│ Estado: Resuelto ✓                  │
├─────────────────────────────────────┤
│ ── Ranking barrios ──              │
│                                     │
│ [Neighborhood ranking widget]       │ Embedded from Screen 16
├─────────────────────────────────────┤
│ ── Incidencias destacadas ──       │
│                                     │
│ [Incident card 1 - most voted]     │
│ [Incident card 2]                   │
│ [Incident card 3]                   │
├─────────────────────────────────────┤
│ 📤 Compartir informe               │ Share button
└─────────────────────────────────────┘
```

---

### SCREEN 18: Embedded Video Player

**Route**: `/content/[id]`

**Purpose**: Full-screen video player for journalistic video reports.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver    Reportaje               │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ Video player
│ │           ▶ PLAY                │ │ 16:9 aspect ratio
│ │                                 │ │ Full-width
│ │ ─────●───────── 1:23 / 3:45    │ │ Progress bar
│ │ [⏪] [⏩] [🔊] [⛶ fullscreen]  │ │ Controls
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Aceras rotas en el barrio de Chueca │ h2 title
│ Por: Luis Martinez, eldiario.es    │ Journalist + source
│ 26/04/2026                          │ Date
├─────────────────────────────────────┤
│ Reportaje sobre el estado de las   │ Description
│ aceras del barrio de Chueca...     │
├─────────────────────────────────────┤
│ Incidencia relacionada:             │
│ [Incident card #1234]               │ Link back to incident
├─────────────────────────────────────┤
│ 📰 Ver articulo completo →         │ Link to eldiario.es
└─────────────────────────────────────┘
```

---

### SCREEN 19: Admin Contact History

**Route**: `/admin-contacts/[incidentId]`

**Purpose**: Full log of all official contacts made for an incident.

**Mobile Layout**:
```
┌─────────────────────────────────────┐
│ ← Volver  Contactos oficiales #1234 │
├─────────────────────────────────────┤
│ Incidencia: Acera rota C/ Mayor     │ Incident reference
│ Estado actual: Contacto admin.      │
├─────────────────────────────────────┤
│                                     │
│ 📧 25/04/2026                       │ Contact entry
│ Email a: Junta Distrito Centro      │ Type + date
│ Contacto: Maria Gomez              │ Person
│ Asunto: Solicitud reparacion acera │ Summary
│ Respuesta: Pendiente               │ Response status
│ [📎 Ver documento]                  │ Attachment link
│                                     │
│ ─────────────────────               │ Divider
│                                     │
│ 📞 28/04/2026                       │
│ Llamada a: Concejalia Urbanismo    │
│ Contacto: Juan Lopez               │
│ Resumen: Confirman recepcion.      │
│ Respuesta: "Expediente abierto,    │
│ plazo estimado 2-3 semanas"        │
│                                     │
│ ─────────────────────               │
│                                     │
│ 🏛 02/05/2026                       │
│ Visita a: Oficina atencion ciudadano│
│ Resumen: Registro entrada formal   │
│ Num. registro: REG-2026-4567       │
│ [📎 Ver justificante]              │
│                                     │
├─────────────────────────────────────┤
│ Fecha limite respuesta: 12/05/2026  │ Deadline warning
│ Dias restantes: 10                  │ Red if < 5 days
└─────────────────────────────────────┘
```

---

### SCREEN 20: Moderation Panel (Admin)

**Route**: `/admin`

**Purpose**: Dashboard for moderators. Shows moderation queue and stats.

**Requires role**: Moderator or Coordinator.

**Desktop Layout** (primary — moderators work on desktop):
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] CallesVivas Admin    @moderador_ana    [Cerrar sesion]│
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │  Bienvenida, Ana                                  │
│          │                                                   │
│ Dashboard│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│ Cola     │  │   12   │ │   45   │ │  89%   │ │  2.3h  │     │
│ Alertas  │  │Pendient│ │Hoy apro│ │Tasa apr│ │T.medio │     │
│ Estadist.│  └────────┘ └────────┘ └────────┘ └────────┘     │
│          │                                                   │
│          │  ── Pendientes de revision (12) ──                │
│          │                                                   │
│          │  ┌─────────────────────────────────────────────┐  │
│          │  │ [img] Farola rota en Lavapies               │  │
│          │  │ @carlos · hace 23min · Mobiliario > Farolas │  │
│          │  │ [✓ Aprobar] [✏ Editar] [✗ Rechazar] [⚑ Flag]│ │
│          │  └─────────────────────────────────────────────┘  │
│          │  ┌─────────────────────────────────────────────┐  │
│          │  │ [img] Ruido excesivo bar La Palma           │  │
│          │  │ @elena · hace 45min · Ruido > Bares         │  │
│          │  │ ⚠ Posible duplicado de #1198                │  │
│          │  │ [✓ Aprobar] [✏ Editar] [✗ Rechazar] [⚑ Flag]│ │
│          │  └─────────────────────────────────────────────┘  │
│          │  ...                                              │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

**Elements**:
- Sidebar: navigation links (Dashboard, Queue, Alerts, Statistics)
- Stats cards: Pending count, Today approved, Approval rate, Average review time
- Queue list: incident cards with quick-action buttons
  - Approve (green checkmark): publishes immediately
  - Edit (pencil): opens inline edit for category/title/tags
  - Reject (red X): opens reject reason modal
  - Flag (flag): escalates to coordinator
- Duplicate warning: yellow banner on cards that match existing incidents (similar text + nearby location). Shows link to potential duplicate.

---

### SCREEN 21: Moderation Queue

**Route**: `/admin/incidents`

**Purpose**: Full moderation queue with filtering and bulk actions.

**Desktop Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] CallesVivas Admin                                     │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │  Cola de moderacion (12 pendientes)               │
│          │                                                   │
│          │  Filtrar: [Todas ▼] [Categoria ▼] [Barrio ▼]     │
│          │  Ordenar: [Mas antiguas ▼]                        │
│          │                                                   │
│          │  ☐ Seleccionar todas  [Aprobar seleccion]         │
│          │                                                   │
│          │  ┌──────────────────────────────────────────────┐ │
│          │  │ ☐ [img] Farola rota Lavapies                 │ │
│          │  │   @carlos · 23min · Mobiliario > Farolas     │ │
│          │  │   "La farola de la esquina de C/ Argumosa..." │ │
│          │  │   [✓] [✏] [✗] [⚑]                           │ │
│          │  ├──────────────────────────────────────────────┤ │
│          │  │ ☐ [img] Ruido bar La Palma                   │ │
│          │  │   @elena · 45min · Ruido > Bares             │ │
│          │  │   ⚠ Posible duplicado: #1198 (85% similar)   │ │
│          │  │   [✓] [✏] [✗] [⚑] [Ver duplicado]          │ │
│          │  ├──────────────────────────────────────────────┤ │
│          │  │ ...                                          │ │
│          │  └──────────────────────────────────────────────┘ │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

**Additional elements vs Screen 20**:
- Checkboxes for bulk selection
- Bulk approve button for selected
- Full description preview (not truncated)
- Similarity percentage on duplicate warnings
- "Ver duplicado" link to compare side-by-side

---

### SCREEN 22: Reject Reason Modal

**Triggered from**: Moderation queue reject button

**Purpose**: Moderator provides a reason for rejecting an incident.

```
┌─────────────────────────────────────┐
│        Rechazar incidencia          │ Modal title
├─────────────────────────────────────┤
│ Motivo:                             │
│ ○ Spam o contenido irrelevante     │ Radio options
│ ○ Contenido ilegal o amenazas      │
│ ○ Datos personales expuestos       │
│ ○ Duplicado de otra incidencia     │
│ ○ Informacion insuficiente         │
│ ○ Otro                             │
├─────────────────────────────────────┤
│ Nota al usuario (opcional):        │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ Textarea
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Cancelar]         [Rechazar]       │ Cancel + confirm
└─────────────────────────────────────┘
```

---

### SCREEN 23: Journalist Dashboard

**Route**: `/journalist`

**Purpose**: Journalist's home. Shows assigned Top 5 and investigation tasks.

**Desktop Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] CallesVivas Periodista   @periodista_luis              │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │  Panel periodista                                 │
│          │                                                   │
│ Dashboard│  ── Top 5 esta semana (asignadas) ──             │
│ Asignadas│                                                   │
│ Contactos│  ┌─────────────────────────────────────────────┐  │
│ Contenido│  │ 1. [img] Acera rota C/ Mayor  · 23 votos   │  │
│          │  │    Chueca · Accesibilidad                   │  │
│          │  │    Estado: En contacto                       │  │
│          │  │    [Ver ficha] [Anadir contacto] [Subir video]│ │
│          │  ├─────────────────────────────────────────────┤  │
│          │  │ 2. [img] Ruido bar Sol  · 18 votos          │  │
│          │  │    Sol · Ruido                               │  │
│          │  │    Estado: Publicado                          │  │
│          │  │    [Ver ficha] [Anadir contacto] [Subir video]│ │
│          │  ├─────────────────────────────────────────────┤  │
│          │  │ 3. ...                                       │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
│          │  ── Proximas fechas limite ──                     │
│          │                                                   │
│          │  ⚠ #1234 Acera rota - 12/05 (10 dias)           │
│          │  ⚠ #1198 Ruido bar - 15/05 (13 dias)            │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

**Elements**:
- Sidebar: Dashboard, Assigned, Contacts, Content
- Top 5 list: ranked cards with action buttons per incident
  - "Ver ficha" -> incident detail
  - "Anadir contacto" -> opens admin contact form modal
  - "Subir video" -> opens media upload
- Deadline warnings: list of upcoming response deadlines, sorted by urgency. Red if < 5 days.

---

### SCREEN 24: Add Admin Contact Modal

**Triggered from**: Journalist dashboard or incident detail

**Purpose**: Log an official contact attempt.

```
┌─────────────────────────────────────┐
│     Registrar contacto oficial      │
├─────────────────────────────────────┤
│ Incidencia: #1234 Acera rota C/ M. │
├─────────────────────────────────────┤
│ Tipo de contacto:                   │
│ [📧 Email] [📞 Llamada]            │ Toggle buttons
│ [🏛 Visita] [📄 Registro]          │
├─────────────────────────────────────┤
│ Organismo                           │
│ ┌─────────────────────────────────┐ │
│ │ Junta Distrito Centro           │ │
│ └─────────────────────────────────┘ │
│ Persona de contacto                 │
│ ┌─────────────────────────────────┐ │
│ │ Maria Gomez                     │ │
│ └─────────────────────────────────┘ │
│ Resumen                             │
│ ┌─────────────────────────────────┐ │
│ │ Solicitud formal de reparacion  │ │
│ │ de acera...                     │ │
│ └─────────────────────────────────┘ │
│ Respuesta recibida                  │
│ ┌─────────────────────────────────┐ │
│ │ Pendiente                       │ │
│ └─────────────────────────────────┘ │
│ Adjuntar documento                  │
│ [📎 Seleccionar archivo]            │
├─────────────────────────────────────┤
│ [Cancelar]       [Guardar contacto] │
└─────────────────────────────────────┘
```

---

### SCREEN 25: Upload Content Modal

**Triggered from**: Journalist dashboard

**Purpose**: Upload video report or link article from eldiario.es.

```
┌─────────────────────────────────────┐
│       Subir contenido               │
├─────────────────────────────────────┤
│ Incidencia: #1234 Acera rota C/ M. │
├─────────────────────────────────────┤
│ Tipo:                               │
│ [🎬 Video] [📰 Articulo] [🎙 Radio]│ Toggle
├─────────────────────────────────────┤
│ Titulo                              │
│ ┌─────────────────────────────────┐ │
│ │ Aceras rotas en Chueca          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ IF VIDEO:                           │
│ ┌─────────────────────────────────┐ │
│ │ [Upload] Arrastra video aqui    │ │ Drag & drop
│ │ o haz clic para seleccionar     │ │ area
│ └─────────────────────────────────┘ │
│                                     │
│ IF ARTICLE:                         │
│ URL del articulo                    │
│ ┌─────────────────────────────────┐ │
│ │ https://eldiario.es/madrid/...  │ │
│ └─────────────────────────────────┘ │
│ [Vista previa cargada]              │ Auto-preview
│                                     │
├─────────────────────────────────────┤
│ [Cancelar]         [Publicar]       │
└─────────────────────────────────────┘
```

---

### SCREEN 26: Coordinator Report Generation

**Route**: `/admin/reports`

**Purpose**: Coordinator generates and reviews monthly reports.

**Desktop Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] CallesVivas Admin   @coordinador_carmen               │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │  Generacion de informes                           │
│          │                                                   │
│          │  Periodo: [Abril 2026 ▼]                          │
│          │                                                   │
│          │  ── Informes por barrio ──                        │
│          │                                                   │
│          │  Barrio        Incid. Resuelt. Estado             │
│          │  ─────────────────────────────────                │
│          │  Chueca          34      5    [✓ Publicado]       │
│          │  Malasana         28      3    [✓ Publicado]      │
│          │  Lavapies         22      4    [⏳ Borrador]       │
│          │  Sol              19      2    [⏳ Borrador]       │
│          │  Tetuan           17      1    [— Pendiente]      │
│          │                                                   │
│          │  [Generar todos los pendientes]                    │
│          │  [Publicar borradores]                            │
│          │                                                   │
│          │  ── Informe global ──                             │
│          │                                                   │
│          │  [Vista previa informe global Abril 2026]         │
│          │  [Publicar informe global]                        │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

---

### SCREEN 27: Mobile Menu (Hamburger)

**Triggered from**: Menu icon in mobile header.

**Purpose**: Navigation drawer for mobile.

```
┌─────────────────────────────────────┐
│ [CallesVivas]              [X Close]│
├─────────────────────────────────────┤
│                                     │
│ [avatar] @usuario123                │ User info (if signed in)
│ Chueca · 340 puntos                │
│                                     │
│ ─────────────────────               │
│                                     │
│ 🗺  Mapa                            │ Nav links
│ 📊 Top 5 semanal                   │
│ 🏘  Mi barrio (Chueca)             │
│ 📋 Mis incidencias                 │
│ 🏆 Ranking ciudadanos              │
│ 🏘  Ranking barrios                │
│ 📈 Informes mensuales              │
│                                     │
│ ─────────────────────               │
│                                     │
│ ⚙  Ajustes                         │
│ ❓ Ayuda                            │
│ 🚪 Cerrar sesion                   │
│                                     │
└─────────────────────────────────────┘
```

If not signed in, show "Iniciar sesion" and "Registrarse" buttons instead of user info and settings.

---

### SCREEN 28: Notification / Toast Messages

**Purpose**: Feedback for user actions. Appears top-center, auto-dismisses in 4 seconds.

```
SUCCESS:
┌─────────────────────────────────────┐
│ ✓ Incidencia enviada correctamente  │ Green left border
└─────────────────────────────────────┘

ERROR:
┌─────────────────────────────────────┐
│ ✗ Error al subir la foto            │ Red left border
└─────────────────────────────────────┘

INFO:
┌─────────────────────────────────────┐
│ ℹ Tu incidencia esta en revision    │ Blue left border
└─────────────────────────────────────┘

NOTIFICATION:
┌─────────────────────────────────────┐
│ 🔔 Tu incidencia #1234 ha cambiado │ Primary left border
│    de estado: En contacto           │
└─────────────────────────────────────┘
```

Style: white bg, `shadow-lg`, 4px colored left border, `radius-md`. Max-width 400px. Close X button right side.

---

### SCREEN 29: Empty States

**No incidents in area** (map):
```
┌─────────────────────────────────────┐
│     [illustration: empty street]    │ 120px illustration
│                                     │
│  No hay incidencias en esta zona    │ h3, centered
│  Se el primero en reportar          │ body, muted
│  un problema.                       │
│                                     │
│  [+ Anadir incidencia]              │ Primary button
└─────────────────────────────────────┘
```

**No results** (search):
```
┌─────────────────────────────────────┐
│     [illustration: magnifier]       │
│                                     │
│  No se encontraron resultados       │
│  para "farola rota chamberi"        │
│                                     │
│  Intenta con otros terminos         │
│  o explora el mapa.                 │
│                                     │
│  [Ir al mapa]                       │
└─────────────────────────────────────┘
```

**No comments yet**:
```
┌─────────────────────────────────────┐
│  Se el primero en comentar          │
│  [Escribe un comentario...]         │
└─────────────────────────────────────┘
```

**No journalistic content yet**:
```
┌─────────────────────────────────────┐
│  Aun no hay contenido periodistico  │
│  para esta incidencia.              │
└─────────────────────────────────────┘
```

---

### SCREEN 30: Loading States

**Map loading**:
- Map area shows gray placeholder with CallesVivas logo pulsing in center

**Incident list loading**:
- Skeleton cards: gray shimmer rectangles matching card dimensions (3 placeholder cards)

**Incident detail loading**:
- Skeleton: gray rectangle for photo, gray lines for title/text, gray circle for status badge

**Button loading**:
- Button text replaced with spinning circle, button disabled, slightly transparent

---

## 7. Animations & Transitions

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | Slide left (forward) / right (back) | 200ms | ease |
| Desktop side panel | Slide from right | 250ms | ease-out |
| Mobile bottom sheet | Slide up from bottom | 250ms | ease-out |
| Modal overlay | Fade in bg + scale up content | 200ms | ease-out |
| Map markers appear | Scale from 0 to 1 | 150ms | ease-out |
| Map marker selected | Scale to 1.25 then settle to 1.1 | 200ms | spring |
| Status badge pulse (Awaiting) | Opacity 0.5 to 1 loop | 2s | ease-in-out |
| Vote count change | Number rolls up/down | 300ms | ease-out |
| Card hover (desktop) | translateY(-1px) + shadow increase | 150ms | ease |
| Filter chip toggle | Background color + scale(1.05) | 100ms | ease |
| Toast enter | Slide down + fade in | 300ms | ease-out |
| Toast exit | Fade out + slide up | 200ms | ease-in |
| Skeleton shimmer | Left-to-right gradient sweep | 1.5s | linear loop |
| Progress bar fill | Width increase | 300ms | ease-out |

---

## 8. Accessibility Requirements

- **Touch targets**: minimum 44x44px on all interactive elements
- **Color contrast**: WCAG AA (4.5:1 body text, 3:1 large text/icons)
- **Map markers**: distinguishable by icon shape, not only color
- **Screen reader**: all images have alt text, map has text summary alternative, ARIA labels on all buttons
- **Keyboard**: full navigation via Tab, Enter, Escape. Focus ring visible (2px `primary` outline)
- **Reduced motion**: respect `prefers-reduced-motion` media query, disable all animations
- **Language**: Spanish primary UI, all labels in Spanish

---

## 9. Complete Screen Index

| # | Screen | Route | Auth | Role |
|---|--------|-------|------|------|
| 01 | Home / Map | `/` | No | Public |
| 02 | Search | `/search?q=...` | No | Public |
| 03 | Top 5 | `/top/week` | No | Public |
| 04 | Sign In | `/signin` | No | Public |
| 05 | Sign Up | `/signup` | No | Public |
| 06 | New Incident Step 1 | `/incidents/new/step1` | Yes | Citizen+ |
| 07 | New Incident Step 2 | `/incidents/new/step2` | Yes | Citizen+ |
| 08 | New Incident Step 3 | `/incidents/new/step3` | Yes | Citizen+ |
| 09 | Incident Detail | `/incidents/[id]` | No | Public |
| 10 | Incident Comments | `/incidents/[id]/comments` | No | Public |
| 11 | Incident History | `/incidents/[id]/history` | No | Public |
| 12 | Neighborhood Page | `/neighborhoods/[slug]` | No | Public |
| 13 | User Profile | `/user/[id]/profile` | No | Public |
| 14 | My Incidents | `/user/[id]/my-incidents` | Yes | Citizen+ |
| 15 | Citizen Ranking | `/ranking/citizens` | No | Public |
| 16 | Neighborhood Ranking | `/ranking/neighborhoods` | No | Public |
| 17 | Monthly Report | `/reports/monthly/[period]` | No | Public |
| 18 | Video Player | `/content/[id]` | No | Public |
| 19 | Admin Contact History | `/admin-contacts/[id]` | No | Public |
| 20 | Moderation Dashboard | `/admin` | Yes | Moderator+ |
| 21 | Moderation Queue | `/admin/incidents` | Yes | Moderator+ |
| 22 | Reject Reason Modal | (modal) | Yes | Moderator+ |
| 23 | Journalist Dashboard | `/journalist` | Yes | Journalist+ |
| 24 | Add Contact Modal | (modal) | Yes | Journalist+ |
| 25 | Upload Content Modal | (modal) | Yes | Journalist+ |
| 26 | Report Generation | `/admin/reports` | Yes | Coordinator |
| 27 | Mobile Menu | (drawer) | No | Public |
| 28 | Toast Messages | (overlay) | No | All |
| 29 | Empty States | (inline) | No | All |
| 30 | Loading States | (inline) | No | All |
