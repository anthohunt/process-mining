# Milestone 1 Summary — Setup + Dashboard

## What You Can Do Now

The CartoPM app is live with a fully functional Dashboard at `/`:

1. **See global stats** — 4 stat cards show live counts from Supabase: Chercheurs (8), Themes (4 clusters), Clusters (4), Publications (12). Numbers are formatted with French thousands separators.
2. **Click stat cards** — Each card navigates to its corresponding section (Chercheurs → /researchers, Themes → /themes, etc.).
3. **Browse recent activity** — The activity feed shows the 5 most recent actions with colored avatar initials, researcher names (clickable → profile), action descriptions, and relative timestamps in French.
4. **Preview the thematic map** — The mini-map shows a simplified SVG with colored cluster circles and researcher dots. Click to navigate to the full map view.
5. **Switch languages** — FR/EN toggle in the navbar switches all UI text.

## Domain Perspective

The dashboard gives researchers an at-a-glance view of the process mining community landscape:
- **Stat cards** answer "how big is the community?" — researcher count, theme diversity, cluster structure, publication volume.
- **Activity feed** answers "what's happening?" — new profiles, publications, and changes.
- **Mini-map** answers "what does the landscape look like?" — a visual preview of thematic clusters.

## What's Coming Next (M2 — Researchers & Profiles)

- Searchable/filterable researcher list with lab and theme dropdowns
- Full researcher profiles with bio, keywords, publications, and "View on map" button
- Side-by-side researcher comparison with similarity gauge
- Profile-to-map navigation

## Known Limitations

1. **StatGrid error state unreachable under API abort** — `fetchStats()` returns 0 via `?? 0` null coercion instead of throwing when the API is unreachable. The retry button exists in code but won't appear under network failure. To fix in hardening (Step 5).
2. **Relative timestamps FR-only** — `formatRelativeTime()` outputs "il y a Xh" regardless of language setting. To fix when i18n is fully wired up.
3. **No auth yet** — Login button is visible but non-functional. Auth comes in M4.
