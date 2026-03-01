import React, { useRef, useState, useEffect } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import DashboardLayout from './components/DashboardLayout';
import { Shield } from 'lucide-react';

// ── Full-page loader ──────────────────────────────────────────────────────────
function InitializingLoader() {
  return (
    <div className="min-h-screen bg-surface-darkest flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Shield className="w-16 h-16 text-gold-accent opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-rajdhani text-2xl font-bold tracking-widest text-gold-accent uppercase">
            AstraVault
          </h1>
          <p className="font-inter text-surface-light/40 text-xs tracking-widest uppercase mt-1">
            Securing Connection...
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold-accent/40 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Auth guard for root layout ────────────────────────────────────────────────
function RootLayout() {
  const { isInitializing } = useInternetIdentity();

  // Use a ref-based settled flag so brief re-initialization flashes
  // from the authClient dependency loop don't re-show the loader.
  const hasSettledRef = useRef(false);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    if (!isInitializing && !hasSettledRef.current) {
      hasSettledRef.current = true;
      setHasSettled(true);
    }
  }, [isInitializing]);

  if (!hasSettled) {
    return <InitializingLoader />;
  }

  return <Outlet />;
}

// ── Routes ────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: RootLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedRoute,
});

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => protectedRoute,
  id: 'dashboard-layout',
  component: DashboardLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/',
  component: DashboardPage,
});

const vaultRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/vault',
  component: VaultPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardLayoutRoute.addChildren([
      indexRoute,
      vaultRoute,
      settingsRoute,
    ]),
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
