import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Derives a stable `isActorReady` boolean that is `true` only when:
 * 1. The Internet Identity client has finished initializing
 * 2. The user is authenticated (identity is non-null, principal is not anonymous)
 * 3. The actor instance is non-null and not currently being fetched
 */
export function useActorReady() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated =
    !!identity && !identity.getPrincipal().isAnonymous();

  const isActorReady =
    !isInitializing &&
    isAuthenticated &&
    !!actor &&
    !actorFetching;

  const principalText = isAuthenticated
    ? identity.getPrincipal().toString()
    : null;

  return { isActorReady, actor, principalText, isAuthenticated, isInitializing };
}
