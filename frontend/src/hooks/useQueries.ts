import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useActorReady } from './useActorReady';
import type { UserProfile, CustomLink, VaultNote } from '../backend';

// ── Profile ──────────────────────────────────────────────────────────────────

export function useGetProfile() {
  const { actor } = useActor();
  const { isActorReady, principalText } = useActorReady();

  return useQuery<UserProfile | null>({
    queryKey: ['profile', principalText],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getProfile();
        return result ?? null;
      } catch (err) {
        throw err;
      }
    },
    enabled: isActorReady,
    retry: false,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
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
      queryClient.invalidateQueries({ queryKey: ['profile', principalText] });
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
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
      queryClient.invalidateQueries({ queryKey: ['profile', principalText] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteAccount();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['profile', principalText] });
      queryClient.clear();
    },
  });
}

// ── Custom Links ─────────────────────────────────────────────────────────────

export function useGetCustomLinks() {
  const { actor } = useActor();
  const { isActorReady, principalText } = useActorReady();

  return useQuery<CustomLink[]>({
    queryKey: ['customLinks', principalText],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomLinks();
    },
    enabled: isActorReady,
  });
}

export function useAddCustomLink() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
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
      queryClient.invalidateQueries({ queryKey: ['customLinks', principalText] });
    },
  });
}

export function useEditCustomLink() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      url,
      category,
      iconName,
    }: {
      id: bigint;
      name: string;
      url: string;
      category: string;
      iconName: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editCustomLink(id, name, url, category, iconName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks', principalText] });
    },
  });
}

export function useDeleteCustomLink() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteCustomLink(linkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLinks', principalText] });
    },
  });
}

// ── Vault Notes ──────────────────────────────────────────────────────────────

export function useGetVaultNotes() {
  const { actor } = useActor();
  const { isActorReady, principalText } = useActorReady();

  return useQuery<VaultNote[]>({
    queryKey: ['vaultNotes', principalText],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVaultNotes();
    },
    enabled: isActorReady,
  });
}

export function useAddVaultNote() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
  const queryClient = useQueryClient();

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
  const { principalText } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      encryptedContent,
    }: {
      id: bigint;
      encryptedContent: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editVaultNote(id, encryptedContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes', principalText] });
    },
  });
}

export function useDeleteVaultNote() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteVaultNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultNotes', principalText] });
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
      await actor.changeVaultPassword(currentPasswordHash, newPasswordHash);
    },
  });
}

export function useResetVaultPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (newPasswordHash: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.resetVaultPassword(newPasswordHash);
    },
  });
}

// ── Email 2FA ─────────────────────────────────────────────────────────────────

export function useIsEmail2faEnabled() {
  const { actor } = useActor();
  const { isActorReady, principalText } = useActorReady();

  return useQuery<boolean>({
    queryKey: ['email2fa', principalText],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isEmail2faEnabled();
    },
    enabled: isActorReady,
  });
}

export function useToggleEmail2fa() {
  const { actor } = useActor();
  const { principalText } = useActorReady();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enable: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.toggleEmail2fa(enable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email2fa', principalText] });
    },
  });
}
