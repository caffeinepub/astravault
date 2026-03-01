import React from 'react';
import { Navigate, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActorReady } from '../hooks/useActorReady';
import { useGetProfile } from '../hooks/useQueries';
import ProfileSetupModal from './ProfileSetupModal';
import { Loader2, ShieldAlert, RefreshCw } from 'lucide-react';

function FullPageLoader({ message = 'Initializing secure connection...' }: { message?: string }) {
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
          <Loader2 className="absolute -top-1 -left-1 w-[72px] h-[72px] text-primary animate-spin" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function FullPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Connection Failed</h2>
          <p className="text-sm text-muted-foreground">
            Unable to load your profile. Please check your connection and try again.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isActorReady } = useActorReady();
  const { data: userProfile, isLoading, isFetched, isError, refetch, profileNotFound } = useGetProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // 1. Still initializing the identity client — never redirect yet
  if (isInitializing) {
    return <FullPageLoader message="Initializing secure connection..." />;
  }

  // 2. Identity resolved but user is not authenticated — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 3. Authenticated but actor not ready yet, or profile still loading
  if (!isActorReady || isLoading || !isFetched) {
    return <FullPageLoader message="Loading your vault..." />;
  }

  // 4. Profile fetch errored — show retry screen
  if (isError) {
    return <FullPageError onRetry={() => refetch()} />;
  }

  // 5. Profile is null (new user) — show setup modal
  if (profileNotFound) {
    return <ProfileSetupModal />;
  }

  // 6. Profile exists — render the protected content
  if (userProfile) {
    return <Outlet />;
  }

  // Fallback: still loading
  return <FullPageLoader message="Loading your vault..." />;
}
