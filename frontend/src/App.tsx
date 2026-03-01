import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Loading screen used by AuthGuard ─────────────────────────────────────────
function FullPageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <img
              src="/assets/generated/astravault-shield-logo.dim_256x256.png"
              alt="AstraVault"
              className="w-10 h-10 object-contain opacity-60"
            />
          </div>
          <Loader2
            className="absolute -top-1 -left-1 w-[72px] h-[72px] text-primary animate-spin"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase">
          Initializing secure connection...
        </p>
      </div>
    </div>
  );
}

// ── Auth guard for the login route ────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  // Never redirect while the identity client is still starting up
  if (isInitializing) {
    return <FullPageLoader />;
  }

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

// ── Root layout ───────────────────────────────────────────────────────────────
function RootLayout() {
  return <Outlet />;
}

// ── Routes ────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <AuthGuard>
      <LoginPage />
    </AuthGuard>
  ),
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedRoute,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const vaultRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/vault',
  component: VaultPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/settings',
  component: SettingsPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/dashboard" />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  protectedRoute.addChildren([dashboardRoute, vaultRoute, settingsRoute]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
