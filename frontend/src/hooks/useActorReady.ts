import { useMemo, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';

/**
 * Returns `isActorReady: true` only when:
 *  1. isInitializing has settled to false at least once
 *  2. identity is non-null and non-anonymous
 *  3. actor is non-null
 *
 * Uses a ref-based "has ever settled" flag so that brief re-initialization
 * flashes from the authClient dependency loop don't reset readiness.
 */
export function useActorReady() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor();

  // Track whether initialization has ever completed
  const hasEverSettledRef = useRef(false);
  if (!isInitializing) {
    hasEverSettledRef.current = true;
  }

  const isActorReady = useMemo(() => {
    // Must have settled at least once
    if (!hasEverSettledRef.current) return false;

    // Identity must be present and non-anonymous
    if (!identity) return false;
    try {
      if (identity.getPrincipal().isAnonymous()) return false;
    } catch {
      return false;
    }

    // Actor must be present
    if (!actor) return false;

    return true;
  }, [identity, actor, isInitializing]); // eslint-disable-line react-hooks/exhaustive-deps

  const principalText = useMemo(() => {
    if (!identity) return '';
    try {
      return identity.getPrincipal().toString();
    } catch {
      return '';
    }
  }, [identity]);

  return { isActorReady, principalText };
}
