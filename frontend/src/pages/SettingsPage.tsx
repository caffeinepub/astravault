import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, Bell, Trash2, Save, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useGetCallerUserProfile, useUpdateUserProfile, useChangeVaultPassword, useToggleEmail2fa, useIsEmail2faEnabled, useDeleteAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const updateProfile = useUpdateUserProfile();
  const changeVaultPassword = useChangeVaultPassword();
  const toggleEmail2fa = useToggleEmail2fa();
  const { data: email2faEnabled } = useIsEmail2faEnabled();
  const deleteAccount = useDeleteAccount();

  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalText] });
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
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
      const hashPassword = async (pw: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(pw);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      };

      const currentHash = await hashPassword(currentPassword);
      const newHash = await hashPassword(newPassword);

      await changeVaultPassword.mutateAsync({ currentHash, newHash });
      setVaultPwSuccess('Vault password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setVaultPwError(err.message || 'Failed to change vault password');
    }
  };

  const handleToggle2fa = async () => {
    try {
      await toggleEmail2fa.mutateAsync(!email2faEnabled);
    } catch (err: any) {
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
    } catch (err: any) {
      console.error('Delete account failed:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-gold-accent" />
          <h1 className="font-rajdhani text-2xl font-bold text-gold-accent tracking-wider uppercase">
            Settings
          </h1>
        </div>

        {/* Profile section */}
        <section className="border border-military-green-accent/30 bg-surface-dark/60 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-military-green-accent/20">
            <User className="w-4 h-4 text-military-green-accent" />
            <h2 className="font-rajdhani text-base font-bold text-military-green-accent tracking-wider uppercase">
              Profile Information
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60"
                />
              </div>
              <div>
                <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60"
              />
            </div>

            {profileError && (
              <p className="text-red-400 text-xs font-rajdhani">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-military-green-accent text-xs font-rajdhani">{profileSuccess}</p>
            )}

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-military-green-primary border border-gold-accent/60 text-gold-accent font-rajdhani text-xs tracking-widest uppercase hover:bg-military-green-accent transition-all disabled:opacity-50"
            >
              {updateProfile.isPending ? (
                <div className="w-3 h-3 border border-gold-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Profile
            </button>
          </form>
        </section>

        {/* Vault password section */}
        <section className="border border-military-green-accent/30 bg-surface-dark/60 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-military-green-accent/20">
            <Lock className="w-4 h-4 text-military-green-accent" />
            <h2 className="font-rajdhani text-base font-bold text-military-green-accent tracking-wider uppercase">
              Vault Password
            </h2>
          </div>

          <form onSubmit={handleChangeVaultPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 pr-10 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-accent transition-colors"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 pr-10 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-accent transition-colors"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Confirm New Password
              </label>
              <input
                type={showNewPw ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60"
              />
            </div>

            {vaultPwError && (
              <p className="text-red-400 text-xs font-rajdhani">{vaultPwError}</p>
            )}
            {vaultPwSuccess && (
              <p className="text-military-green-accent text-xs font-rajdhani">{vaultPwSuccess}</p>
            )}

            <button
              type="submit"
              disabled={changeVaultPassword.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-military-green-primary border border-gold-accent/60 text-gold-accent font-rajdhani text-xs tracking-widest uppercase hover:bg-military-green-accent transition-all disabled:opacity-50"
            >
              {changeVaultPassword.isPending ? (
                <div className="w-3 h-3 border border-gold-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              Change Password
            </button>
          </form>
        </section>

        {/* 2FA section */}
        <section className="border border-military-green-accent/30 bg-surface-dark/60 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-military-green-accent/20">
            <Bell className="w-4 h-4 text-military-green-accent" />
            <h2 className="font-rajdhani text-base font-bold text-military-green-accent tracking-wider uppercase">
              Email 2FA
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-rajdhani">Email Two-Factor Authentication</p>
              <p className="text-gray-500 text-xs font-rajdhani mt-0.5">
                {email2faEnabled ? 'Currently enabled' : 'Currently disabled'}
              </p>
            </div>
            <button
              onClick={handleToggle2fa}
              disabled={toggleEmail2fa.isPending}
              className={`px-4 py-2 font-rajdhani text-xs tracking-widest uppercase border transition-all disabled:opacity-50 ${
                email2faEnabled
                  ? 'border-red-500/40 text-red-400 hover:bg-red-900/20'
                  : 'border-military-green-accent/40 text-military-green-accent hover:text-gold-accent hover:border-gold-accent/40'
              }`}
            >
              {toggleEmail2fa.isPending ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : email2faEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </section>

        {/* Delete account section */}
        <section className="border border-red-500/30 bg-surface-dark/60 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="font-rajdhani text-base font-bold text-red-400 tracking-wider uppercase">
              Danger Zone
            </h2>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-rajdhani">Delete Account</p>
                <p className="text-gray-500 text-xs font-rajdhani mt-0.5">
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-900/20 font-rajdhani text-xs tracking-widest uppercase transition-colors"
              >
                Delete Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-red-400 text-sm font-rajdhani">
                Type <strong>DELETE</strong> to confirm account deletion. This cannot be undone.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full bg-surface-darkest border border-red-500/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deleteAccount.isPending}
                  className="px-4 py-2 bg-red-900/60 border border-red-500/40 text-red-300 hover:bg-red-900 font-rajdhani text-xs tracking-widest uppercase transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteAccount.isPending ? (
                    <div className="w-3 h-3 border border-red-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Confirm Delete
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                  className="px-4 py-2 border border-military-green-accent/30 text-gray-400 hover:text-gold-accent font-rajdhani text-xs tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
