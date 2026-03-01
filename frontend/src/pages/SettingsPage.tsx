import { useState, useEffect } from 'react';
import { Shield, User, Lock, Bell, Trash2, Save, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useGetProfile, useUpdateUserProfile, useChangeVaultPassword, useToggleEmail2fa, useIsEmail2faEnabled, useDeleteAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useActorReady } from '../hooks/useActorReady';
import { hashPassword } from '../utils/encryption';

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();
  const { principalText } = useActorReady();
  const { data: userProfile } = useGetProfile();
  const updateProfile = useUpdateUserProfile();
  const changeVaultPassword = useChangeVaultPassword();
  const toggleEmail2fa = useToggleEmail2fa();
  const { data: email2faEnabled } = useIsEmail2faEnabled();
  const deleteAccount = useDeleteAccount();

  // Profile form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Vault password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [vaultPwSuccess, setVaultPwSuccess] = useState('');
  const [vaultPwError, setVaultPwError] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Populate form from profile
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setUsername(userProfile.username);
      setEmail(userProfile.email ?? '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) { setProfileError('Name is required'); return; }
    if (!username.trim()) { setProfileError('Username is required'); return; }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        username: username.trim(),
        email: email.trim() || null,
        vaultPasswordHash: null,
      });
      setProfileSuccess('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile', principalText] });
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChangeVaultPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultPwError('');
    setVaultPwSuccess('');

    if (!currentPassword) { setVaultPwError('Current password is required'); return; }
    if (!newPassword) { setVaultPwError('New password is required'); return; }
    if (newPassword.length < 6) { setVaultPwError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { setVaultPwError('Passwords do not match'); return; }

    try {
      const currentPasswordHash = await hashPassword(currentPassword);
      const newPasswordHash = await hashPassword(newPassword);

      await changeVaultPassword.mutateAsync({ currentPasswordHash, newPasswordHash });
      setVaultPwSuccess('Vault password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      setVaultPwError(err instanceof Error ? err.message : 'Failed to change vault password');
    }
  };

  const handleToggle2fa = async () => {
    try {
      await toggleEmail2fa.mutateAsync(!email2faEnabled);
    } catch (err: unknown) {
      console.error('2FA toggle failed:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      await deleteAccount.mutateAsync();
      await clear();
      queryClient.clear();
      navigate({ to: '/login' });
    } catch (err: unknown) {
      console.error('Delete account failed:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield size={24} style={{ color: 'var(--color-gold-accent)' }} />
        <h1
          className="font-rajdhani text-2xl font-bold tracking-wider uppercase"
          style={{ color: 'var(--color-gold-accent)' }}
        >
          Settings
        </h1>
      </div>

      {/* Profile section */}
      <section
        className="p-6"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid var(--color-military-green-primary)',
        }}
      >
        <div
          className="flex items-center gap-2 mb-4 pb-3"
          style={{ borderBottom: '1px solid var(--color-military-green-muted)' }}
        >
          <User size={16} style={{ color: 'var(--color-military-green-light)' }} />
          <h2
            className="font-rajdhani text-base font-bold tracking-wider uppercase"
            style={{ color: 'var(--color-military-green-light)' }}
          >
            Profile Information
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: 'var(--color-military-green-light)' }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 font-inter text-sm military-input"
              />
            </div>
            <div>
              <label
                className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: 'var(--color-military-green-light)' }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 font-inter text-sm military-input"
              />
            </div>
          </div>
          <div>
            <label
              className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: 'var(--color-military-green-light)' }}
            >
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 font-inter text-sm military-input"
            />
          </div>

          {profileError && (
            <p className="font-inter text-xs" style={{ color: '#f87171' }}>{profileError}</p>
          )}
          {profileSuccess && (
            <p className="font-inter text-xs" style={{ color: 'var(--color-military-green-light)' }}>{profileSuccess}</p>
          )}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex items-center gap-2 px-4 py-2 font-rajdhani font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-gold-accent)',
              color: 'var(--color-surface-darkest)',
            }}
          >
            {updateProfile.isPending ? (
              <div
                className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-surface-darkest)', borderTopColor: 'transparent' }}
              />
            ) : (
              <Save size={14} />
            )}
            Save Profile
          </button>
        </form>
      </section>

      {/* Vault password section */}
      <section
        className="p-6"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid var(--color-military-green-primary)',
        }}
      >
        <div
          className="flex items-center gap-2 mb-4 pb-3"
          style={{ borderBottom: '1px solid var(--color-military-green-muted)' }}
        >
          <Lock size={16} style={{ color: 'var(--color-military-green-light)' }} />
          <h2
            className="font-rajdhani text-base font-bold tracking-wider uppercase"
            style={{ color: 'var(--color-military-green-light)' }}
          >
            Vault Password
          </h2>
        </div>

        <form onSubmit={handleChangeVaultPassword} className="space-y-4">
          <div>
            <label
              className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: 'var(--color-military-green-light)' }}
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 font-inter text-sm military-input"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label
              className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: 'var(--color-military-green-light)' }}
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 font-inter text-sm military-input"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label
              className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: 'var(--color-military-green-light)' }}
            >
              Confirm New Password
            </label>
            <input
              type={showNewPw ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3 py-2 font-inter text-sm military-input"
            />
          </div>

          {vaultPwError && (
            <p className="font-inter text-xs" style={{ color: '#f87171' }}>{vaultPwError}</p>
          )}
          {vaultPwSuccess && (
            <p className="font-inter text-xs" style={{ color: 'var(--color-military-green-light)' }}>{vaultPwSuccess}</p>
          )}

          <button
            type="submit"
            disabled={changeVaultPassword.isPending}
            className="flex items-center gap-2 px-4 py-2 font-rajdhani font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-gold-accent)',
              color: 'var(--color-surface-darkest)',
            }}
          >
            {changeVaultPassword.isPending ? (
              <div
                className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-surface-darkest)', borderTopColor: 'transparent' }}
              />
            ) : (
              <Lock size={14} />
            )}
            Change Password
          </button>
        </form>
      </section>

      {/* 2FA section */}
      <section
        className="p-6"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid var(--color-military-green-primary)',
        }}
      >
        <div
          className="flex items-center gap-2 mb-4 pb-3"
          style={{ borderBottom: '1px solid var(--color-military-green-muted)' }}
        >
          <Bell size={16} style={{ color: 'var(--color-military-green-light)' }} />
          <h2
            className="font-rajdhani text-base font-bold tracking-wider uppercase"
            style={{ color: 'var(--color-military-green-light)' }}
          >
            Email 2FA
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-inter text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Email Two-Factor Authentication
            </p>
            <p className="font-inter text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {email2faEnabled ? 'Currently enabled' : 'Currently disabled'}
            </p>
          </div>
          <button
            onClick={handleToggle2fa}
            disabled={toggleEmail2fa.isPending}
            className="px-4 py-2 font-rajdhani font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-50"
            style={
              email2faEnabled
                ? {
                    border: '1px solid rgba(239,68,68,0.4)',
                    color: '#f87171',
                  }
                : {
                    border: '1px solid var(--color-military-green-primary)',
                    color: 'var(--color-military-green-light)',
                  }
            }
            onMouseEnter={(e) => {
              if (!toggleEmail2fa.isPending) {
                e.currentTarget.style.borderColor = 'var(--color-gold-accent)';
                e.currentTarget.style.color = 'var(--color-gold-accent)';
              }
            }}
            onMouseLeave={(e) => {
              if (email2faEnabled) {
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                e.currentTarget.style.color = '#f87171';
              } else {
                e.currentTarget.style.borderColor = 'var(--color-military-green-primary)';
                e.currentTarget.style.color = 'var(--color-military-green-light)';
              }
            }}
          >
            {toggleEmail2fa.isPending ? (
              <div
                className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin inline-block"
                style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
              />
            ) : email2faEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </section>

      {/* Delete account section */}
      <section
        className="p-6"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid rgba(239,68,68,0.3)',
        }}
      >
        <div
          className="flex items-center gap-2 mb-4 pb-3"
          style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle size={16} style={{ color: '#f87171' }} />
          <h2
            className="font-rajdhani text-base font-bold tracking-wider uppercase"
            style={{ color: '#f87171' }}
          >
            Danger Zone
          </h2>
        </div>

        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Delete Account
              </p>
              <p className="font-inter text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Permanently delete your account and all data
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 font-rajdhani font-bold text-xs tracking-widest uppercase transition-all"
              style={{
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(180,40,40,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-inter text-sm" style={{ color: '#f87171' }}>
              Type <strong>DELETE</strong> to confirm account deletion. This cannot be undone.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 font-inter text-sm"
              style={{
                backgroundColor: 'var(--color-surface-mid)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteAccount.isPending}
                className="flex items-center gap-2 px-4 py-2 font-rajdhani font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-40"
                style={{
                  backgroundColor: 'rgba(180,40,40,0.8)',
                  color: '#fff',
                }}
              >
                {deleteAccount.isPending ? (
                  <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                ) : (
                  <Trash2 size={14} />
                )}
                Confirm Delete
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="px-4 py-2 font-rajdhani font-bold text-xs tracking-widest uppercase transition-all"
                style={{
                  border: '1px solid var(--color-military-green-primary)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
