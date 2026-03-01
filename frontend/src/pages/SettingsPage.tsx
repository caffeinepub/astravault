import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Key,
  User,
  Bell,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  useGetCallerUserProfile,
  useChangeVaultPassword,
  useIsEmail2faEnabled,
  useToggleEmail2fa,
  useUpdateUserProfile,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { hashPassword } from '../utils/encryption';
import DeleteAccountConfirmationModal from '../components/DeleteAccountConfirmationModal';

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-1 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface-2/50">
        <Icon className="w-5 h-5 text-military-green-bright" />
        <h3 className="font-rajdhani font-semibold text-foreground tracking-wide uppercase text-sm">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-military-green-bright text-sm bg-military-green/10 border border-military-green/30 rounded p-3">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded p-3">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  );
}

// ── Change Vault Password Section ─────────────────────────────────────────────

function ChangeVaultPasswordSection() {
  const { data: userProfile } = useGetCallerUserProfile();
  const changeVaultPassword = useChangeVaultPassword();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!currentPw) return 'Current vault password is required';
    if (!newPw) return 'New vault password is required';
    if (newPw.length < 6) return 'New password must be at least 6 characters';
    if (newPw !== confirmPw) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      const currentHash = await hashPassword(currentPw);
      if (currentHash !== userProfile?.vaultPasswordHash) {
        setError('Current vault password is incorrect');
        return;
      }
      const newHash = await hashPassword(newPw);
      await changeVaultPassword.mutateAsync({ currentPasswordHash: currentHash, newPasswordHash: newHash });
      setSuccess('Vault password changed successfully');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change vault password');
    }
  };

  return (
    <SectionCard title="Change Vault Password" icon={Lock}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Current Vault Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Enter current vault password"
              className="w-full bg-surface-2 border border-border rounded px-3 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            New Vault Password
          </label>
          <input
            type={showPw ? 'text' : 'password'}
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="Enter new vault password"
            className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Confirm New Password
          </label>
          <input
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new vault password"
            className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
          />
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <button
          type="submit"
          disabled={changeVaultPassword.isPending}
          className="flex items-center gap-2 bg-military-green hover:bg-military-green-bright text-white font-rajdhani font-semibold tracking-widest uppercase px-5 py-2.5 rounded text-sm transition-colors disabled:opacity-50"
        >
          <Key className="w-4 h-4" />
          {changeVaultPassword.isPending ? 'Updating...' : 'Update Vault Password'}
        </button>
      </form>
    </SectionCard>
  );
}

// ── Profile Section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: userProfile } = useGetCallerUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [name, setName] = useState(userProfile?.name || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setUsername(userProfile.username);
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!username.trim()) { setError('Username is required'); return; }
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        username: username.trim(),
        email: email.trim() || null,
        vaultPasswordHash: null, // null means "keep existing password"
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <SectionCard title="Profile Information" icon={User}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your username"
            className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Email <span className="text-muted-foreground/50 normal-case">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
          />
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="flex items-center gap-2 bg-military-green hover:bg-military-green-bright text-white font-rajdhani font-semibold tracking-widest uppercase px-5 py-2.5 rounded text-sm transition-colors disabled:opacity-50"
        >
          <User className="w-4 h-4" />
          {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </SectionCard>
  );
}

// ── 2FA Section ───────────────────────────────────────────────────────────────

function TwoFASection() {
  const { data: is2faEnabled = false } = useIsEmail2faEnabled();
  const toggleEmail2fa = useToggleEmail2fa();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleToggle = async (enabled: boolean) => {
    setSuccess('');
    setError('');
    try {
      await toggleEmail2fa.mutateAsync(enabled);
      setSuccess(enabled ? 'Email 2FA enabled' : 'Email 2FA disabled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle 2FA');
    }
  };

  return (
    <SectionCard title="Two-Factor Authentication" icon={Bell}>
      <div className="space-y-4 max-w-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Email OTP 2FA</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enable additional security via email one-time passwords
            </p>
          </div>
          <Switch
            checked={is2faEnabled}
            onCheckedChange={handleToggle}
            disabled={toggleEmail2fa.isPending}
            className="data-[state=checked]:bg-military-green"
          />
        </div>

        <div className="bg-surface-2 border border-border rounded p-3 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gold" />
            Note: Email OTP delivery requires a configured email address. This feature stores your 2FA preference on-chain.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}
      </div>
    </SectionCard>
  );
}

// ── Active Sessions Section ───────────────────────────────────────────────────

function ActiveSessionsSection() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();

  const principalStr = identity?.getPrincipal().toString() || 'Unknown';
  const createdAt = userProfile?.createdAt
    ? new Date(Number(userProfile.createdAt) / 1_000_000).toLocaleString('en-IN')
    : 'Unknown';

  return (
    <SectionCard title="Active Sessions" icon={Shield}>
      <div className="space-y-3 max-w-lg">
        <p className="text-xs text-muted-foreground">
          Sessions are managed by Internet Identity. Your current authenticated session is shown below.
        </p>
        <div className="bg-surface-2 border border-military-green/20 rounded p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-military-green animate-pulse" />
                <span className="text-xs font-rajdhani font-semibold text-military-green-bright uppercase tracking-wider">
                  Current Session
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">{principalStr}</p>
              <p className="text-xs text-muted-foreground mt-1">Account created: {createdAt}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60">
          To logout all sessions, use the Logout button in the profile menu. Internet Identity manages session tokens.
        </p>
      </div>
    </SectionCard>
  );
}

// ── Danger Zone Section ───────────────────────────────────────────────────────

function DangerZoneSection() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <SectionCard title="Danger Zone" icon={Trash2}>
      <div className="space-y-4 max-w-sm">
        <div className="bg-destructive/5 border border-destructive/20 rounded p-4">
          <h4 className="font-rajdhani font-semibold text-destructive tracking-wide uppercase text-sm mb-1">
            Delete Account
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete your account and all associated data including vault notes and custom links. This action cannot be undone.
          </p>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive font-rajdhani font-semibold tracking-wider uppercase px-4 py-2 rounded text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        </div>
      </div>

      <DeleteAccountConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </SectionCard>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gold rounded-full" />
        <div>
          <h1 className="font-rajdhani text-2xl font-bold text-foreground tracking-wide uppercase">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">Manage your account and security preferences</p>
        </div>
      </div>

      <ProfileSection />
      <ChangeVaultPasswordSection />
      <TwoFASection />
      <ActiveSessionsSection />
      <DangerZoneSection />
    </div>
  );
}
