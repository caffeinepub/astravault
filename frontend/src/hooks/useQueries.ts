import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useActorReady } from './useActorReady';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, CustomLink, VaultNote } from '../backend';

// ── Profile ──────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const isActorReady = useActorReady();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', principalText],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getCallerUserProfile();
      return result ?? null;
    },
    enabled: isActorReady,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Alias for backward compatibility
export function useGetProfile() {
  return useGetCallerUserProfile();
}

// ── Custom Links ─────────────────────────────────────────────────────────────

export function useGetCustomLinks() {
  const { actor } = useActor();
  const isActorReady = useActorReady();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useQuery<CustomLink[]>({
    queryKey: ['customLinks', principalText],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomLinks();
    },
    enabled: isActorReady,
  });
}

export function useAddCustomLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (link: { name: string; url: string; category: string; iconName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomLink(link.name, link.url, link.category, link.iconName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks', principalText] });
    },
  });
}

export function useEditCustomLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (link: { id: bigint; name: string; url: string; category: string; iconName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCustomLink(link.id, link.name, link.url, link.category, link.iconName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks', principalText] });
    },
  });
}

export function useDeleteCustomLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (linkId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomLink(linkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks', principalText] });
    },
  });
}

// ── Vault Notes ──────────────────────────────────────────────────────────────

export function useGetVaultNotes() {
  const { actor } = useActor();
  const isActorReady = useActorReady();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useQuery<VaultNote[]>({
    queryKey: ['vaultNotes', principalText],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVaultNotes();
    },
    enabled: isActorReady,
  });
}

export function useAddVaultNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (encryptedContent: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addVaultNote(encryptedContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes', principalText] });
    },
  });
}

export function useEditVaultNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (note: { id: bigint; encryptedContent: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editVaultNote(note.id, note.encryptedContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes', principalText] });
    },
  });
}

export function useDeleteVaultNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVaultNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes', principalText] });
    },
  });
}

// ── Profile Update ───────────────────────────────────────────────────────────

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (profile: {
      name: string;
      username: string;
      email: string | null;
      vaultPasswordHash: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(profile.name, profile.username, profile.email, profile.vaultPasswordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalText] });
    },
  });
}

export function useChangeVaultPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (passwords: { currentHash: string; newHash: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.changeVaultPassword(passwords.currentHash, passwords.newHash);
    },
  });
}

export function useResetVaultPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (newHash: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetVaultPassword(newHash);
    },
  });
}

export function useToggleEmail2fa() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (enable: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleEmail2fa(enable);
    },
  });
}

export function useIsEmail2faEnabled() {
  const { actor } = useActor();
  const isActorReady = useActorReady();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useQuery<boolean>({
    queryKey: ['email2fa', principalText],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isEmail2faEnabled();
    },
    enabled: isActorReady,
  });
}

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

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  return useMutation({
    mutationFn: async (data: {
      name: string;
      username: string;
      email: string | null;
      vaultPasswordHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(data.name, data.username, data.email, data.vaultPasswordHash);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalText] });
    },
  });
}
