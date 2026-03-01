import React, { useRef, useState, useEffect } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Shield } from 'lucide-react';

// ── Military Loading Spinner ─────────────────────────────────────────────────
function MilitaryLoader({ message = 'Securing Connection...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-surface-darkest flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-military-green-primary border-t-gold-accent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-8 h-8 text-gold-accent" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-gold-accent font-rajdhani text-lg font-semibold tracking-widest uppercase">
          {message}
        </p>
        <p className="text-military-green-primary font-rajdhani text-sm tracking-wider mt-1 opacity-70">
          AstraVault
        </p>
      </div>
    </div>
  );
}

// ── Root Layout with Auth Guard ──────────────────────────────────────────────
// Shows the military loader while Internet Identity is initializing.
// Uses a "settled" flag so that once initialization completes once, brief
// re-initializing flashes (caused by the authClient dependency loop in the
// provider) do not re-show the loader screen.
function RootLayout() {
  const { isInitializing } = useInternetIdentity();
  // Once initialization has settled to false at least once, we never block again.
  const hasSettledRef = useRef(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!isInitializing && !hasSettledRef.current) {
      hasSettledRef.current = true;
      setSettled(true);
    }
  }, [isInitializing]);

  // Only show the loader on the very first initialization pass.
  if (!settled && isInitializing) {
    return <MilitaryLoader message="Securing Connection..." />;
  }

  return <Outlet />;
}

// ── Route Tree ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: RootLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// ProtectedRoute is a layout component that uses <Outlet /> internally.
// It handles its own auth checks, profile loading, and profile setup modal.
const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedRoute,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/',
  component: DashboardPage,
});

const vaultRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/vault',
  component: VaultPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedLayoutRoute.addChildren([
    dashboardRoute,
    vaultRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
