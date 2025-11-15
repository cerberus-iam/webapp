Step 1 — Research sync: finish skimming key Express route handlers/tests to confirm payload shapes, required headers, error formats; note RBAC scopes for each admin endpoint.
Step 2 — Foundation: add env config, API client, shared error types, problem+json parser, auth-aware fetch helper, typed Result<T> utilities.
Step 3 — Session bootstrap: wire \_app.tsx to load current user via getServerSideProps (or per-page wrapper), provide AuthContext, add ProtectedPage HOC/utility.
Step 4 — Login/Register flows: connect existing UI to /v1/auth/login and /v1/auth/register (or /v1/auth/onboard), handle MFA challenge, show server validation errors, implement “Forgot password” POST + success states, add logout button.
Step 5 — Dashboard skeleton: on /dashboard, fetch organisation summary (/v1/admin/organisation), current user, high-level stats; add loading/error states, ensure SSR auth guard.
Step 6 — User management module: list users (/v1/admin/users), detail drawer, create/update forms, suspend/reactivate actions; add client-side validation mirroring server.
Step 7 — Teams & roles: repeat pattern for /v1/admin/teams and /v1/admin/roles; include assignment UX, permission matrix.
Step 8 — Invitations & credentials: add flows for invitations, OAuth clients, API keys; leverage modal forms with mutation hooks.
Step 9 — Observability & polish: add toast system for success/error, global loading indicators, audit log viewer, pagination/filter utilities, responsive tweaks.
Step 10 — Testing & docs: integrate Cypress/Playwright smoke (optional) plus React Testing Library for forms; document environment variables and deployment prerequisites.
