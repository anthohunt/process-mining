# Milestone 4 Summary

## Known Limitations
- The `already_pending` warning relies on frontend mock interception — no backend DB constraint enforces single-pending submissions yet (planned for M5 admin approval workflow)
- US-5.2 E3 rejection banner test assertions are stubbed (conditional on DB state) — feature works visually but lacks automated regression protection
- Lab dropdown in edit form queries the researchers table (not a dedicated labs table) — works but new labs require at least one existing researcher entry
- Cancel button navigates to the researcher's profile page instead of the researcher list (minor UX deviation from spec)

## What's Next
- M5 — Administration: User management (roles, invitations, approve/reject pending profiles), bulk import (CSV/Excel + Google Scholar), app settings (language, similarity threshold, NLP algorithm), audit logs with date filters and color-coded action tags
