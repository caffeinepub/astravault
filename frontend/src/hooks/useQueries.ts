import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useActorReady } from './useActorReady';
import type { UserProfile, CustomLink, VaultNote } from '../backend';

// ── Profile ──────────────────────────────────────────────────────────────────

export function useGetProfile() {
  const { isActorReady, actor, principalText } = useActorReady();

  const query = useQuery<UserProfile | null>({
    queryKey: ['profile', principalText ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getProfile();
        return result ?? null;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Treat authorization errors as "no profile" rather than an error state
        if (
          msg.includes('Unauthorized') ||
          msg.includes('Anonymous') ||
          msg.includes('rejected')
        ) {
          return null;
        }
        throw err;
      }
    },
    enabled: isActorReady,
    staleTime: 0,
    retry: 1,
  });

  const profileNotFound =
    isActorReady && query.isFetched && !query.isError && query.data === null;

  return {
    ...query,
    profileNotFound,
    isLoading: !isActorReady || query.isLoading || query.isFetching,
    isFetched: isActorReady && query.isFetched,
  };
}

// Keep getCallerUserProfile for backward compat (ProfileSetupModal invalidates this key too)
export function useGetCallerUserProfile() {
  const { isActorReady, actor, principalText } = useActorReady();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', principalText ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getCallerUserProfile();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: isActorReady,
    staleTime: 0,
    retry: false,
  });

  return {
    ...query,
    isLoading: !isActorReady || query.isLoading,
    isFetched: isActorReady && query.isFetched,
  };
}

// ── Register / Update ─────────────────────────────────────────────────────────

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
      await actor.registerUser(name, username, email, vaultPasswordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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
      vaultPasswordHash: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateUserProfile(name, username, email, vaultPasswordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Custom Links ──────────────────────────────────────────────────────────────

export function useGetCustomLinks() {
  const { isActorReady, actor, principalText } = useActorReady();

  return useQuery<CustomLink[]>({
    queryKey: ['customLinks', principalText ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCustomLinks();
      } catch {
        return [];
      }
    },
    enabled: isActorReady,
    staleTime: 30_000,
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

// ── Vault Notes ───────────────────────────────────────────────────────────────

export function useGetVaultNotes() {
  const { isActorReady, actor, principalText } = useActorReady();

  return useQuery<VaultNote[]>({
    queryKey: ['vaultNotes', principalText ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getVaultNotes();
      } catch {
        return [];
      }
    },
    enabled: isActorReady,
    staleTime: 30_000,
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

// ── Vault Password ────────────────────────────────────────────────────────────

export function useChangeVaultPassword() {
  const { actor } = useActor();

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
  });
}

export function useResetVaultPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (newPasswordHash: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetVaultPassword(newPasswordHash);
    },
  });
}

// ── Email 2FA ─────────────────────────────────────────────────────────────────

export function useIsEmail2faEnabled() {
  const { isActorReady, actor, principalText } = useActorReady();

  return useQuery<boolean>({
    queryKey: ['email2fa', principalText ?? 'anonymous'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isEmail2faEnabled();
      } catch {
        return false;
      }
    },
    enabled: isActorReady,
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

// ── Account Deletion ──────────────────────────────────────────────────────────

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
