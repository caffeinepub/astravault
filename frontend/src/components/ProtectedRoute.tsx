import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ProfileSetupModal from './ProfileSetupModal';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
    isError,
    refetch,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Still initializing the Internet Identity session
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-gold animate-pulse" />
          <p className="text-muted-foreground font-rajdhani tracking-widest text-sm uppercase">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated — App.tsx routing will redirect to /login
  if (!isAuthenticated) {
    return null;
  }

  // Actor is initializing or profile query is in-flight
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-gold animate-pulse" />
          <p className="text-muted-foreground font-rajdhani tracking-widest text-sm uppercase">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Genuine network/canister error (not an auth trap — those are converted to null)
  if (isError) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="font-rajdhani text-xl font-bold text-foreground tracking-wide uppercase mb-2">
              Connection Error
            </h2>
            <p className="text-muted-foreground text-sm">
              Unable to load your profile. Please check your connection and try again.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-military-green hover:bg-military-green-bright text-white font-rajdhani font-semibold tracking-widest uppercase px-6 py-2.5 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Profile has been fetched and is null — show setup modal for new users
  // Use (userProfile === null || userProfile === undefined) to handle both cases
  const showProfileSetup = isAuthenticated && isFetched && !userProfile;

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  return <>{children}</>;
}
