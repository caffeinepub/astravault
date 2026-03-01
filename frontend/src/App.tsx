import React from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster theme="dark" />
    </>
  ),
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGuard>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    </AuthGuard>
  ),
});

// Vault route
const vaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vault',
  component: () => (
    <AuthGuard>
      <DashboardLayout>
        <VaultPage />
      </DashboardLayout>
    </AuthGuard>
  ),
});

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <AuthGuard>
      <DashboardLayout>
        <SettingsPage />
      </DashboardLayout>
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  vaultRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/astravault-shield-logo.dim_256x256.png"
            alt="AstraVault"
            className="w-16 h-16 object-contain animate-pulse"
          />
          <p className="text-muted-foreground font-rajdhani tracking-widest text-sm uppercase">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    // Redirect to login
    router.navigate({ to: '/login' });
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <p className="text-muted-foreground font-rajdhani tracking-widest text-sm uppercase">
          Redirecting...
        </p>
      </div>
    );
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}

// Root App component
function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();

  // On the login page, if already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (!isInitializing && identity) {
      const currentPath = window.location.pathname;
      if (currentPath === '/login') {
        router.navigate({ to: '/' });
      }
    }
    if (!isInitializing && !identity) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        router.navigate({ to: '/login' });
      }
    }
  }, [identity, isInitializing]);

  return <RouterProvider router={router} />;
}

export default function App() {
  return <AppInner />;
}
