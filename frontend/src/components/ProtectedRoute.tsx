import React, { useRef, useState, useEffect } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActorReady } from '../hooks/useActorReady';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ProfileSetupModal from './ProfileSetupModal';

function MilitaryLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-surface-darkest flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-gold-accent font-rajdhani text-sm tracking-widest uppercase">{message}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-surface-darkest flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <div>
          <h2 className="text-gold-accent font-rajdhani text-xl font-bold tracking-wider uppercase mb-2">
            Connection Error
          </h2>
          <p className="text-gray-400 text-sm">Failed to load your profile. Please try again.</p>
        </div>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-military-green-primary border border-gold-accent text-gold-accent font-rajdhani text-sm tracking-widest uppercase hover:bg-military-green-accent transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const isActorReady = useActorReady();
  const { data: userProfile, isLoading, isFetched, isError, refetch } = useGetCallerUserProfile();

  // Track whether initialization has settled at least once so that brief
  // re-initializing flashes don't cause a redirect to /login.
  const hasSettledRef = useRef(false);
  const [initSettled, setInitSettled] = useState(false);

  useEffect(() => {
    if (!isInitializing && !hasSettledRef.current) {
      hasSettledRef.current = true;
      setInitSettled(true);
    }
  }, [isInitializing]);

  // State 1: Still on the very first initialization pass — show loader
  if (!initSettled) {
    return <MilitaryLoader message="Securing connection..." />;
  }

  // State 2: Actor not ready or profile loading (after init settled)
  if (!isActorReady || isLoading) {
    return <MilitaryLoader message="Loading profile..." />;
  }

  // State 3: Definitively unauthenticated (initialization complete, no identity)
  if (!identity || identity.getPrincipal().isAnonymous()) {
    navigate({ to: '/login' });
    return <MilitaryLoader message="Redirecting..." />;
  }

  // State 4: Profile fetch error
  if (isError) {
    return <ErrorScreen onRetry={refetch} />;
  }

  // State 5: New user — no profile yet
  if (isFetched && userProfile === null) {
    return <ProfileSetupModal />;
  }

  // State 6: Authenticated with profile — render protected content
  if (userProfile) {
    return <Outlet />;
  }

  // Fallback loader while waiting for profile data
  return <MilitaryLoader message="Loading profile..." />;
}
