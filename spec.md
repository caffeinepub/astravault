# Specification

## Summary
**Goal:** Fix the "Securing Connection" hang in AstraVault by correcting the Internet Identity provider URL and hardening the auth initialization guard logic.

**Planned changes:**
- Set the `identityProvider` prop on `InternetIdentityProvider` to use the correct environment-aware URL (`http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943` for local, `https://identity.ic0.app` for production), selected via `import.meta.env.DEV` or `DFX_NETWORK`
- Update `AuthGuard` in `App.tsx` to render only the full-page military-themed loading spinner while `isInitializing === true`, and defer any redirect or protected content rendering until `isInitializing` has settled to `false`
- Rewrite `useActorReady.ts` to return `true` only when all three conditions are simultaneously met: `isInitializing` is `false`, the principal is non-anonymous, and the actor instance is non-null

**User-visible outcome:** The Internet Identity iframe no longer hangs on "Securing Connection" — users see the loading spinner during initialization, then are correctly redirected to login or their protected content once authentication is fully resolved.
