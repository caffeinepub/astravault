# Specification

## Summary
**Goal:** Fix the persistent infinite spinner and profile loading race conditions that prevent authenticated users from accessing the AstraVault dashboard.

**Planned changes:**
- Create a `useActorReady.ts` wrapper hook that exposes `isActorReady` as a stable boolean, true only when both the actor is non-null and the principal is authenticated and resolved
- Rewrite `useGetProfile` in `useQueries.ts` to gate on `isActorReady`, include the principal in the cache key, and treat a `null` backend response as "profile not found" rather than an error; gate all other query hooks on `isActorReady` as well
- Rewrite `ProtectedRoute.tsx` with a strict state machine: show a full-page loading skeleton while initializing, show a gold-accented Retry button on fetch error, redirect to login only when definitively unauthenticated, show `ProfileSetupModal` for new users, and render the dashboard for authenticated users with a profile
- Audit `App.tsx` `AuthGuard` to never redirect during identity initialization, showing the loading skeleton until initialization settles
- Audit `backend/main.mo` `getProfile` to return an empty optional (`null`) when no profile exists instead of trapping or returning an error variant

**User-visible outcome:** Authenticated users no longer see an infinite spinner and can access the dashboard normally; new users are shown the profile setup modal; unauthenticated users are only redirected to login after initialization completes.
