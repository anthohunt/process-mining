# Technical Plan — Process Mining Research Cartography

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Build tool** | Vite 5+ | Fast HMR, ESM-native, excellent DX |
| **Framework** | React 18+ | Component model, ecosystem, hooks |
| **Language** | TypeScript | Type safety, refactoring confidence |
| **Styling** | CSS Modules + design tokens | Scoped styles, maps to design-profile.json |
| **Routing** | React Router v6 | Client-side navigation matching mockup screens |
| **State** | Zustand | Lightweight global state (auth, lang, settings) |
| **i18n** | i18next + react-i18next | Bilingual FR/EN, runtime switching |
| **Data fetching** | TanStack Query (React Query) | Caching, refetching, loading/error states |
| **Charts** | D3.js (lightweight) | SVG charts matching mockup (bar, line, histogram) |
| **Map visualization** | D3.js + custom SVG | Cluster map with zoom/pan (d3-zoom) |
| **NLP similarity** | Server-side Python or edge function | TF-IDF / Word2Vec / BERT via API |
| **Backend/DB** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) | Auth, DB, file storage, real-time subscriptions, row-level security |
| **File parsing** | Papa Parse (CSV) + SheetJS (Excel) | Client-side parsing for import preview |
| **Testing (unit)** | Vitest | Vite-native, fast, compatible with React Testing Library |
| **Testing (e2e)** | Playwright | Cross-browser, network interception, screenshots |
| **Deployment** | Vercel | Git-push deploy, preview URLs, edge functions |
| **CI** | GitHub Actions | Lint, test, build, deploy on push |

---

## Data Models

### `researchers`
```sql
CREATE TABLE researchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  lab TEXT NOT NULL,
  bio TEXT DEFAULT '',
  keywords TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  map_x FLOAT,
  map_y FLOAT,
  cluster_id UUID REFERENCES clusters(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `publications`
```sql
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID REFERENCES researchers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  coauthors TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  year INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `clusters`
```sql
CREATE TABLE clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sub_themes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `similarity_scores`
```sql
CREATE TABLE similarity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_a UUID REFERENCES researchers(id) ON DELETE CASCADE,
  researcher_b UUID REFERENCES researchers(id) ON DELETE CASCADE,
  score FLOAT NOT NULL CHECK (score >= 0 AND score <= 1),
  algorithm TEXT DEFAULT 'tfidf',
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(researcher_a, researcher_b, algorithm)
);
```

### `app_settings`
```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Keys: 'language', 'similarity_threshold', 'nlp_algorithm'
```

### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `invitations`
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'researcher',
  invited_by UUID REFERENCES auth.users(id),
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Contracts

### Public endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stats` | Returns `{ researchers, themes, clusters, publications }` counts |
| GET | `/api/activity` | Returns last 20 activities `[{ id, user_name, action, detail, created_at }]` |
| GET | `/api/researchers` | Returns list `[{ id, full_name, lab, keywords, publication_count, status }]` with query params `?q=&lab=&theme=` |
| GET | `/api/researchers/:id` | Returns full profile `{ id, full_name, lab, bio, keywords, publications, map_x, map_y, cluster_id }` |
| GET | `/api/clusters` | Returns `[{ id, name, color, sub_themes, researcher_count, members }]` |
| GET | `/api/similarity/:idA/:idB` | Returns `{ score, algorithm, common_themes }` |
| GET | `/api/stats/detailed` | Returns `{ theme_distribution, temporal_trends, similarity_histogram }` |

### Authenticated endpoints (researcher)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/researchers` | Create own profile `{ full_name, lab, bio, keywords, publications }` -> status:pending |
| PUT | `/api/researchers/:id` | Update own profile (same fields) -> status:pending |

### Authenticated endpoints (admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List all users with roles and statuses |
| PUT | `/api/admin/users/:id/role` | Change user role `{ role: 'admin' | 'researcher' }` |
| POST | `/api/admin/invitations` | Send invitation `{ email, role }` |
| DELETE | `/api/admin/users/:id` | Revoke user access |
| PUT | `/api/admin/researchers/:id/approve` | Approve pending profile |
| PUT | `/api/admin/researchers/:id/reject` | Reject pending profile `{ reason }` |
| POST | `/api/admin/import/csv` | Upload CSV, returns preview `{ rows, errors }` |
| POST | `/api/admin/import/scholar` | Import from Google Scholar URL |
| POST | `/api/admin/import/confirm` | Confirm previewed import |
| GET | `/api/admin/settings` | Get all settings |
| PUT | `/api/admin/settings` | Update settings `{ language, similarity_threshold, nlp_algorithm }` |
| GET | `/api/admin/logs` | Get audit logs with `?from=&to=&page=&limit=` |

### Auth endpoints (Supabase built-in)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/v1/token?grant_type=password` | Login with email/password |
| POST | `/auth/v1/signup` | Register (via invitation link) |
| POST | `/auth/v1/logout` | Logout, invalidate session |

---

## Component Architecture

```
src/
  components/
    layout/
      AppNavbar.tsx          # Brand, nav tabs, login/user area, lang toggle
      AppLayout.tsx           # Wrapper: navbar + main content area
      Breadcrumb.tsx          # "Dashboard > Statistiques" breadcrumbs
    dashboard/
      StatCard.tsx            # Single stat card (number + label)
      StatGrid.tsx            # 4-card grid
      ActivityFeed.tsx        # Recent activity list
      ActivityItem.tsx        # Single activity row
      MiniMap.tsx             # Clickable SVG preview
    researchers/
      ResearcherList.tsx      # Table + search bar + filters
      ResearcherRow.tsx       # Single table row
      SearchBar.tsx           # Search input + filter dropdowns
      ResearcherProfile.tsx   # Full profile layout
      ProfileSidebar.tsx      # Avatar, name, lab, bio
      KeywordsCard.tsx        # Keyword tags display
      PublicationsList.tsx    # Publications list
      ProfileForm.tsx         # Add/edit form with all fields
      TagInput.tsx            # Keyword tag input component
      PublicationBlock.tsx    # Single publication input group
      ComparisonView.tsx      # Side-by-side layout
      SimilarityGauge.tsx     # Circular gauge component
    map/
      ThematicMap.tsx         # Full SVG map with zoom/pan
      MapFilterPanel.tsx      # Floating filter panel
      MapLegend.tsx           # Color legend
      ClusterRegion.tsx       # SVG cluster shape
      ResearcherDot.tsx       # SVG clickable dot
      ClusterPopover.tsx      # Click-to-see-members popover
    themes/
      ThemeExplorer.tsx       # Grid of cluster cards
      ClusterCard.tsx         # Expandable cluster card
    stats/
      DetailedStats.tsx       # Stats screen container
      ThemeBarChart.tsx       # D3 bar chart
      TrendLineChart.tsx      # D3 line chart
      SimilarityHistogram.tsx # D3 histogram
    auth/
      LoginScreen.tsx         # Login card with form + demo buttons
      UserDropdown.tsx        # Navbar user area + dropdown
    admin/
      AdminPanel.tsx          # Tabbed admin container
      UserManagement.tsx      # User table + invite
      PendingProfiles.tsx     # Pending approval table
      BulkImport.tsx          # Upload zone + Scholar + preview
      AppSettings.tsx         # Language, threshold, NLP
      AuditLogs.tsx           # Log table with filters
    common/
      Tag.tsx                 # Reusable colored tag
      Badge.tsx               # Role/status badge
      Button.tsx              # Styled button variants
      EmptyState.tsx          # "No data" placeholder
      ErrorState.tsx          # Error with retry
      LoadingSpinner.tsx      # Loading indicator
      Toast.tsx               # Success/error notifications
      ConfirmDialog.tsx       # Confirmation modal
  hooks/
    useAuth.ts               # Auth state and actions
    useResearchers.ts        # React Query hooks for researcher API
    useClusters.ts           # React Query hooks for cluster API
    useStats.ts              # React Query hooks for stats
    useSimilarity.ts         # React Query hook for similarity score
    useAuditLogs.ts          # React Query hooks for logs
    useSettings.ts           # React Query hooks for settings
    useImport.ts             # File parsing + import logic
  stores/
    authStore.ts             # Zustand store for auth state
    langStore.ts             # Zustand store for language preference
  i18n/
    index.ts                 # i18next config
    fr.json                  # French translations
    en.json                  # English translations
  lib/
    supabase.ts              # Supabase client init
    api.ts                   # API helper functions
    nlp.ts                   # NLP utility (calls server-side)
    csv-parser.ts            # CSV/Excel parsing
    formatting.ts            # Number formatting, date formatting
  pages/
    DashboardPage.tsx
    StatsPage.tsx
    ResearchersPage.tsx
    ProfilePage.tsx
    EditProfilePage.tsx
    ComparisonPage.tsx
    MapPage.tsx
    ThemesPage.tsx
    LoginPage.tsx
    AdminPage.tsx
  App.tsx                    # Router + layout
  main.tsx                   # Entry point
  index.css                  # Global styles + design tokens as CSS vars
```

---

## File Structure (Full)

```
process-mining/
  docs/
    pipeline/                # All pipeline artifacts (this file, spec, etc.)
  public/
    favicon.svg
    fallback-map.png         # Static fallback if SVG fails
  src/                       # (see Component Architecture above)
  tests/
    features/
      registry.json          # Feature test registry
      FT-001-dashboard-stats.test.js
      FT-002-activity-feed.test.js
      ...
    e2e/
      tests/
        ft-001.js            # Playwright scripts
        ft-002.js
        ...
      use-cases/
        m1-use-case.md
        m2-use-case.md
        m3-use-case.md
        m4-use-case.md
        m5-use-case.md
  supabase/
    migrations/
      001_initial_schema.sql # All tables
      002_rls_policies.sql   # Row Level Security
      003_seed_data.sql      # Sample data (offline fallback)
    functions/
      compute-similarity/    # Edge function for NLP
      import-scholar/        # Edge function for Google Scholar
  .env.example
  .gitignore
  index.html
  package.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  tsconfig.json
  vercel.json
```

---

## Key Technical Decisions

1. **Supabase for everything backend** — Auth, PostgreSQL, real-time subscriptions (for live stat updates), Edge Functions (for NLP computation and Google Scholar import), and file storage (for CSV uploads). No custom backend server needed.

2. **NLP computation server-side** — TF-IDF runs in a Supabase Edge Function (Deno). Word2Vec and BERT require a separate Python microservice deployed as a Vercel serverless function or external API. The algorithm choice in settings determines which endpoint is called.

3. **SVG-based map with D3** — The cluster map uses D3 force layout for positioning and d3-zoom for interactions. No heavy mapping library (Leaflet, Mapbox) is needed since this is a conceptual/thematic map, not geographic.

4. **Client-side CSV/Excel parsing** — Papa Parse and SheetJS handle file parsing in the browser so the preview is instant. Only confirmed imports hit the server.

5. **Real-time stats** — Supabase real-time subscriptions on the `researchers` and `publications` tables push updates to the dashboard stat cards without polling.

6. **Row Level Security** — Researchers can only update their own profiles. Admins can read/write everything. Anonymous users can read approved profiles only.

7. **Offline fallback** — A `seed_data.sql` file provides sample researchers, clusters, and publications for development and demo purposes. The app loads from the real database first; if the API is unreachable, it falls back to bundled JSON seed data.
