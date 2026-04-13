# Milestone 2 Summary — Researchers & Profiles

## What You Can Do Now

1. **Browse Researchers** — Navigate to the Chercheurs tab to see all researchers in a searchable, filterable table. Type a name to search, or use the lab/theme dropdowns to narrow results. Filters combine with AND logic.

2. **View Profiles** — Click "Voir" on any researcher to see their full profile: avatar with initials, lab affiliation, bio, keyword tags, and publication list. Use the breadcrumb to navigate back.

3. **Compare Researchers** — From any profile, click "Comparer" to open the side-by-side comparison view. Select a second researcher to see a Jaccard similarity gauge, highlighted common keywords, and a shared themes summary card.

4. **Navigate to Map** — Click "Voir sur la carte" on any profile to jump to the thematic map, which centers and highlights that researcher's dot with a pulsing animation.

## Domain Perspective

CartoPM now has a functional researcher directory — the core browsing experience for discovering who works on what in the process mining community. The comparison feature surfaces thematic proximity between researchers using keyword overlap (Jaccard similarity), which is the foundation for the full NLP-based similarity computation coming in later milestones.

## What's Coming Next (M3)

- **Interactive Thematic Map** — Full SVG cluster map with zoom/pan, click-to-see-members, and researcher dot navigation
- **Theme Explorer** — Grid of expandable cluster cards showing themes and their member researchers
- **Detailed Statistics** — Bar chart (theme distribution), line chart (temporal trends), histogram (similarity scores)

## Known Limitations

1. Similarity is computed client-side via Jaccard on keywords — server-side NLP (TF-IDF/BERT) deferred to later milestone
2. "Voir sur la carte" button is disabled (not toast) when researcher has no map coordinates
3. Bio truncation uses character count, not word boundaries — may cut mid-word
4. D3.js bundle is 510KB in a single chunk — code-splitting deferred to M5
