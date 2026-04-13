# Build Rules — Process Mining Research Cartography

## Always Do

1. **Write tests before or alongside code.** Every component and API hook must have at least one Vitest unit test and one Playwright e2e interaction test.
2. **Run the full test suite before committing.** `npm test && npx playwright test` must pass.
3. **Use TypeScript strictly.** No `any` types. Enable `strict: true` in tsconfig.
4. **Follow commit format:** `type(scope): description` — types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Example: `feat(dashboard): add stat cards with real-time updates`.
5. **Check accessibility on every component.** Every interactive element needs: visible focus ring, keyboard activation (Enter/Space), `aria-label` or associated label, minimum 44x44px touch target on mobile.
6. **Use design tokens from CSS custom properties.** Never hardcode colors, fonts, spacing, or shadows. Always reference `--pm-*` variables.
7. **Support bilingual (FR/EN).** All user-facing text goes through `useTranslation()`. No hardcoded strings in JSX.
8. **Handle loading, error, and empty states.** Every data-fetching component must show a loading indicator, an error message with retry, and an empty-state placeholder.
9. **Use real API calls via Supabase.** No mock services, no `setTimeout` simulations, no hardcoded JSON responses in production code. Sample seed data is for the database only.
10. **Validate inputs.** All form fields must validate before submission — required fields, email format, URL format, file type.
11. **Log audit events.** Every create, update, delete, import, and configuration change writes to the `audit_logs` table.
12. **Use semantic HTML.** Headings in order (h1 > h2 > h3), `<button>` for actions, `<a>` for navigation, `<table>` for tabular data.
13. **Keep components small.** Max ~150 lines per component file. Extract sub-components when exceeding.
14. **Write Playwright tests using `page.route()` for edge cases.** Network errors, empty data, timeouts, and malformed responses must be tested via route interception, never skipped.

## Ask First

1. **Adding a new dependency.** Check if existing deps cover the need. Propose the dep with rationale before installing.
2. **Changing the database schema.** All schema changes must be discussed — new tables, column changes, index additions.
3. **Modifying the router structure.** Adding, removing, or renaming routes affects navigation and tests.
4. **Changing the NLP algorithm interface.** The API contract between frontend and similarity computation must be agreed upon.
5. **Adding a new admin feature.** Admin capabilities must be explicitly scoped and approved.
6. **Changing design tokens or color scheme.** Visual changes must reference `design-profile.json` or get explicit approval.
7. **Architecture changes.** Moving from Supabase to another backend, changing state management library, or altering the component hierarchy.
8. **Scope additions.** New user stories or features not in the spec must be discussed before implementation.

## Never Do

1. **Never skip tests.** Do not commit with `--no-verify` or push with failing tests.
2. **Never force push.** No `git push --force` to shared branches (main, develop).
3. **Never deploy without green tests.** CI must pass before merging or deploying.
4. **Never hardcode credentials.** API keys, passwords, tokens go in `.env`, never in source code. Check `.env` is in `.gitignore`.
5. **Never use `any` type in TypeScript.** Use proper types, generics, or `unknown` with type guards.
6. **Never use inline styles for production code.** Use CSS Modules or design token variables. Exception: dynamic values (e.g., D3-computed positions).
7. **Never bypass authentication checks.** Admin routes must verify admin role server-side (RLS). Client-side checks alone are insufficient.
8. **Never commit `node_modules`, `dist`, `.env`, or build artifacts.**
9. **Never use `alert()`, `confirm()`, or `prompt()`.** Use custom Toast and ConfirmDialog components.
10. **Never import sample/seed data in production code paths.** Seed data is for database seeding only. The app fetches from the API.
11. **Never suppress TypeScript or ESLint errors** with `// @ts-ignore` or `// eslint-disable` without a documented reason.
12. **Never modify another researcher's data** without admin approval workflow. The RLS policies enforce this, and the frontend must respect it.
13. **Never use broad process-killing commands** (per global rules). Always kill by specific PID or port.
