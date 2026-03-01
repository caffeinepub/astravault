import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, CustomLink, VaultNote } from '../backend';

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        // getCallerUserProfile may trap if the user doesn't have the #user role yet
        // (i.e., brand-new principal). Treat any authorization trap as "no profile".
        const profile = await actor.getCallerUserProfile();
        return profile ?? null;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // If the backend traps with an authorization error, the user has no profile yet.
        // Return null so the ProfileSetupModal is shown instead of an error screen.
        if (
          msg.includes('Unauthorized') ||
          msg.includes('Only users') ||
          msg.includes('not found')
        ) {
          return null;
        }
        // Re-throw genuine network/canister errors so the error state is surfaced.
        throw err;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      username,
      email,
      vaultPasswordHash,
    }: {
      name: string;
      username: string;
      email: string | null;
      vaultPasswordHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(name, username, email, vaultPasswordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      username,
      email,
      vaultPasswordHash,
    }: {
      name: string;
      username: string;
      email: string | null;
      vaultPasswordHash?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(name, username, email, vaultPasswordHash ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Custom Links ─────────────────────────────────────────────────────────────

export function useGetCustomLinks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomLink[]>({
    queryKey: ['customLinks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomLinks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddCustomLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      url,
      category,
      iconName,
    }: {
      name: string;
      url: string;
      category: string;
      iconName: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomLink(name, url, category, iconName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks'] });
    },
  });
}

export function useEditCustomLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      linkId,
      name,
      url,
      category,
      iconName,
    }: {
      linkId: bigint;
      name: string;
      url: string;
      category: string;
      iconName: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCustomLink(linkId, name, url, category, iconName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks'] });
    },
  });
}

export function useDeleteCustomLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomLink(linkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks'] });
    },
  });
}

// ── Vault Notes ──────────────────────────────────────────────────────────────

export function useGetVaultNotes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VaultNote[]>({
    queryKey: ['vaultNotes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVaultNotes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddVaultNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (encryptedContent: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addVaultNote(encryptedContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes'] });
    },
  });
}

export function useEditVaultNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      encryptedContent,
    }: {
      noteId: bigint;
      encryptedContent: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editVaultNote(noteId, encryptedContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes'] });
    },
  });
}

export function useDeleteVaultNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVaultNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes'] });
    },
  });
}

// ── Vault Password ───────────────────────────────────────────────────────────

export function useChangeVaultPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      currentPasswordHash,
      newPasswordHash,
    }: {
      currentPasswordHash: string;
      newPasswordHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.changeVaultPassword(currentPasswordHash, newPasswordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useResetVaultPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPasswordHash: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetVaultPassword(newPasswordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── 2FA ──────────────────────────────────────────────────────────────────────

export function useIsEmail2faEnabled() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['email2fa'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isEmail2faEnabled();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useToggleEmail2fa() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enable: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleEmail2fa(enable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email2fa'] });
    },
  });
}

// ── Account ──────────────────────────────────────────────────────────────────

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
