import React, { useState } from 'react';
import { Shield, User, AtSign, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRegisterUser } from '../hooks/useQueries';
import { hashPassword } from '../utils/encryption';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');
  const [confirmVaultPassword, setConfirmVaultPassword] = useState('');
  const [showVaultPw, setShowVaultPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerUser = useRegisterUser();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!vaultPassword) newErrors.vaultPassword = 'Vault password is required';
    if (vaultPassword.length < 6) newErrors.vaultPassword = 'Vault password must be at least 6 characters';
    if (vaultPassword !== confirmVaultPassword) newErrors.confirmVaultPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const vaultPasswordHash = await hashPassword(vaultPassword);
      await registerUser.mutateAsync({
        name: name.trim(),
        username: username.trim(),
        email: email.trim() || null,
        vaultPasswordHash,
      });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Registration failed' });
    }
  };

  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/assets/generated/dashboard-bg-texture.dim_1920x1080.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src="/assets/generated/astravault-shield-logo.dim_256x256.png"
                alt="AstraVault"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h1 className="font-rajdhani text-3xl font-bold text-gold tracking-widest uppercase">
            AstraVault
          </h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-wider">
            Complete your profile setup
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-1 border border-military-green/30 rounded-lg p-6 shadow-green">
          <h2 className="font-rajdhani text-xl font-semibold text-foreground mb-6 tracking-wide uppercase">
            Create Your Command Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-surface-2 border border-border rounded pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green focus:ring-1 focus:ring-military-green transition-colors"
                />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-surface-2 border border-border rounded pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green focus:ring-1 focus:ring-military-green transition-colors"
                />
              </div>
              {errors.username && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.username}</p>}
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Email <span className="text-muted-foreground/50 normal-case">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-surface-2 border border-border rounded pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green focus:ring-1 focus:ring-military-green transition-colors"
                />
              </div>
            </div>

            {/* Vault Password */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Vault Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showVaultPw ? 'text' : 'password'}
                  value={vaultPassword}
                  onChange={e => setVaultPassword(e.target.value)}
                  placeholder="Set a secure vault password"
                  className="w-full bg-surface-2 border border-border rounded pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green focus:ring-1 focus:ring-military-green transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowVaultPw(!showVaultPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showVaultPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.vaultPassword && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.vaultPassword}</p>}
            </div>

            {/* Confirm Vault Password */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Confirm Vault Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showVaultPw ? 'text' : 'password'}
                  value={confirmVaultPassword}
                  onChange={e => setConfirmVaultPassword(e.target.value)}
                  placeholder="Confirm vault password"
                  className="w-full bg-surface-2 border border-border rounded pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green focus:ring-1 focus:ring-military-green transition-colors"
                />
              </div>
              {errors.confirmVaultPassword && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmVaultPassword}</p>}
            </div>

            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={registerUser.isPending}
              className="w-full bg-military-green hover:bg-military-green-bright text-white font-rajdhani font-semibold tracking-widest uppercase py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {registerUser.isPending ? 'Setting up...' : 'Activate Command Profile'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground/50 text-xs mt-4">
          Your vault password encrypts your private notes. Keep it safe.
        </p>
      </div>
    </div>
  );
}
