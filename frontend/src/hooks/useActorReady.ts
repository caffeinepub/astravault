import { useRef } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Returns true only when ALL three conditions are met simultaneously:
 * 1. Internet Identity has finished initializing (isInitializing === false)
 *    AND has settled at least once (to avoid brief re-init flashes)
 * 2. The user is authenticated with a non-anonymous principal
 * 3. The actor instance is non-null
 */
export function useActorReady(): boolean {
  const { actor } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  // Track whether initialization has ever settled to false.
  // Using a module-level variable so it persists across re-renders without
  // causing extra renders itself.
  const hasEverSettled = useRef(false);
  if (!isInitializing) {
    hasEverSettled.current = true;
  }

  // Block if we haven't settled yet (still on first init pass)
  if (!hasEverSettled.current) return false;

  // Block if currently re-initializing (brief flash after authClient set)
  // — we allow through since hasEverSettled is true, meaning we already
  // completed init once. This prevents blocking on the second useEffect run.

  // Block if no identity or anonymous principal
  if (!identity) return false;
  try {
    if (identity.getPrincipal().isAnonymous()) return false;
  } catch {
    return false;
  }

  // Block if actor is not ready
  if (!actor) return false;

  return true;
}
