import React, { useRef } from 'react';
import { Outlet, Navigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActorReady } from '../hooks/useActorReady';
import { useGetProfile } from '../hooks/useQueries';
import ProfileSetupModal from './ProfileSetupModal';
import { Shield } from 'lucide-react';

function FullPageLoader({ message = 'Initializing Secure Connection...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-surface-darkest flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated shield */}
        <div className="relative">
          <Shield className="w-16 h-16 text-gold-accent opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="font-rajdhani text-2xl font-bold tracking-widest text-gold-accent uppercase">
            AstraVault
          </h1>
          <p className="font-inter text-surface-light/40 text-xs tracking-widest uppercase mt-1">
            {message}
          </p>
        </div>

        {/* Progress dots */}
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

function FullPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-surface-darkest flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
        <Shield className="w-16 h-16 text-destructive opacity-60" />
        <div>
          <h2 className="font-rajdhani text-xl font-bold text-surface-light tracking-wider uppercase">
            Connection Failed
          </h2>
          <p className="font-inter text-surface-light/50 text-sm mt-2">
            Unable to load your profile. Please check your connection and try again.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="bg-military-green-primary hover:bg-military-green-light border border-gold-accent/30 hover:border-gold-accent/60 text-surface-light font-rajdhani font-semibold tracking-widest uppercase py-3 px-8 transition-all duration-200"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isActorReady } = useActorReady();

  // Track whether initialization has ever settled
  const hasEverSettledRef = useRef(false);
  if (!isInitializing) {
    hasEverSettledRef.current = true;
  }

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
  } = useGetProfile();

  // 1. Still in the very first initialization pass — show loader
  if (!hasEverSettledRef.current) {
    return <FullPageLoader message="Securing Connection..." />;
  }

  // 2. Actor not ready yet (but init has settled) — show loader
  if (!isActorReady && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isActorReady) {
    return <FullPageLoader message="Loading Vault Systems..." />;
  }

  // 3. Profile query is loading
  if (profileLoading) {
    return <FullPageLoader message="Loading Profile..." />;
  }

  // 4. Profile query errored
  if (profileError) {
    return <FullPageError onRetry={refetch} />;
  }

  // 5. New user — show profile setup
  if (profile === null || profile === undefined) {
    return <ProfileSetupModal />;
  }

  // 6. Authenticated with profile — render protected content
  return <Outlet />;
}
