# Specification

## Summary
**Goal:** Fix the AstraVault login page display, Internet Identity verification flow, and related frontend/backend wiring so authentication works end-to-end without blank screens or hangs.

**Planned changes:**
- Restore `LoginPage.tsx` with AstraVault military branding (matte black, gold, military-green), Rajdhani/Inter fonts, a single "Login with Internet Identity" button wired to `useInternetIdentity`, and auto-redirect to `/` for already-authenticated users
- Fix `main.tsx` `InternetIdentityProvider` to use `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943` in dev and `https://identity.ic0.app` in production, removing any hardcoded/broken URL that causes the "Securing Connection" hang
- Restore `useActorReady.ts` so `isActorReady` is `true` only when `isInitializing` is `false`, the principal is non-anonymous, and the actor is non-null
- Restore `useQueries.ts` so `useGetProfile` and all other backend queries are gated on `isActorReady`, the cache key includes the principal string, and a `null` response is treated as "profile not found" rather than an error
- Restore `ProtectedRoute.tsx` as a strict state machine: loading spinner while initializing, error state with Retry on failure, redirect to `/login` only after init completes for unauthenticated users, `ProfileSetupModal` for new users with null profile, and `<Outlet />` for authenticated users with a profile
- Restore `App.tsx` routing with `/login`, `/`, `/vault`, and `/settings` routes and an `AuthGuard` that shows only a loading spinner while `isInitializing` is `true`
- Restore `ProfileSetupModal.tsx` with fields for name, username, optional email, and vault password (SHA-256 hashed client-side), styled with military theme, and cache invalidation on successful registration
- Fix `backend/main.mo` `getProfile` to return `null` (empty optional) for a missing profile instead of trapping or returning an error variant

**User-visible outcome:** Users can navigate to `/login`, click "Login with Internet Identity", complete authentication without the popup hanging, and be routed to the dashboard or profile setup modal as appropriate. Unauthenticated users are redirected to `/login` only after initialization is confirmed complete, with no blank screens or premature redirects.
