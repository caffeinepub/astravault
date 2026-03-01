import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterUser } from '../hooks/useQueries';
import { hashPassword } from '../utils/encryption';
import { Shield, User, AtSign, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function ProfileSetupModal() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const registerUser = useRegisterUser();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const principalText = identity?.getPrincipal().toString() ?? '';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    if (!vaultPassword) newErrors.vaultPassword = 'Vault password is required';
    if (vaultPassword.length < 8) newErrors.vaultPassword = 'Vault password must be at least 8 characters';
    if (vaultPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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

      // Invalidate and refetch profile
      await queryClient.invalidateQueries({ queryKey: ['profile', principalText] });
      await queryClient.refetchQueries({ queryKey: ['profile', principalText] });
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Registration failed. Please try again.' });
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-surface-darkest flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/assets/generated/dashboard-bg-texture.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-gold-accent opacity-20" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-gold-accent opacity-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-gold-accent opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-gold-accent opacity-20" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-gold-accent opacity-80" />
            </div>
          </div>
          <h1 className="font-rajdhani text-3xl font-bold tracking-widest text-gold-accent uppercase">
            Vault Initialization
          </h1>
          <p className="font-inter text-surface-light/50 text-sm mt-2">
            Configure your secure profile to access AstraVault
          </p>
        </div>

        {/* Form card */}
        <div className="bg-surface-dark/90 border border-gold-accent/30 p-8 relative">
          {/* Card corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-gold-accent" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-gold-accent" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-gold-accent" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-gold-accent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block font-rajdhani text-xs font-semibold tracking-widest text-gold-accent/80 uppercase mb-1.5">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-light/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-surface-darkest border border-gold-accent/20 focus:border-gold-accent/60 text-surface-light placeholder-surface-light/20 font-inter text-sm py-3 pl-10 pr-4 outline-none transition-colors"
                />
              </div>
              {errors.name && (
                <p className="flex items-center gap-1 text-destructive text-xs mt-1 font-inter">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block font-rajdhani text-xs font-semibold tracking-widest text-gold-accent/80 uppercase mb-1.5">
                Username <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-light/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-surface-darkest border border-gold-accent/20 focus:border-gold-accent/60 text-surface-light placeholder-surface-light/20 font-inter text-sm py-3 pl-10 pr-4 outline-none transition-colors"
                />
              </div>
              {errors.username && (
                <p className="flex items-center gap-1 text-destructive text-xs mt-1 font-inter">
                  <AlertCircle className="w-3 h-3" /> {errors.username}
                </p>
              )}
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block font-rajdhani text-xs font-semibold tracking-widest text-gold-accent/80 uppercase mb-1.5">
                Email <span className="text-surface-light/30 normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-light/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-surface-darkest border border-gold-accent/20 focus:border-gold-accent/60 text-surface-light placeholder-surface-light/20 font-inter text-sm py-3 pl-10 pr-4 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gold-accent/15" />
              <span className="font-rajdhani text-xs text-gold-accent/40 tracking-widest uppercase">Vault Security</span>
              <div className="flex-1 h-px bg-gold-accent/15" />
            </div>

            {/* Vault Password */}
            <div>
              <label className="block font-rajdhani text-xs font-semibold tracking-widest text-gold-accent/80 uppercase mb-1.5">
                Vault Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-light/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={vaultPassword}
                  onChange={(e) => setVaultPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-surface-darkest border border-gold-accent/20 focus:border-gold-accent/60 text-surface-light placeholder-surface-light/20 font-inter text-sm py-3 pl-10 pr-10 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-light/30 hover:text-surface-light/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.vaultPassword && (
                <p className="flex items-center gap-1 text-destructive text-xs mt-1 font-inter">
                  <AlertCircle className="w-3 h-3" /> {errors.vaultPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-rajdhani text-xs font-semibold tracking-widest text-gold-accent/80 uppercase mb-1.5">
                Confirm Vault Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-light/30" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat vault password"
                  className="w-full bg-surface-darkest border border-gold-accent/20 focus:border-gold-accent/60 text-surface-light placeholder-surface-light/20 font-inter text-sm py-3 pl-10 pr-10 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-light/30 hover:text-surface-light/60 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="flex items-center gap-1 text-destructive text-xs mt-1 font-inter">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive/30 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="font-inter text-destructive text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={registerUser.isPending}
              className="w-full bg-military-green-primary hover:bg-military-green-light border border-military-green-light/50 hover:border-gold-accent/50 text-surface-light font-rajdhani font-semibold tracking-widest uppercase py-4 px-6 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {registerUser.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-gold-accent/30 border-t-gold-accent rounded-full animate-spin" />
                  <span>Initializing Vault...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-gold-accent" />
                  <span>Initialize Vault</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Logout option */}
        <div className="text-center mt-4">
          <button
            onClick={handleLogout}
            className="font-inter text-surface-light/30 hover:text-surface-light/60 text-xs transition-colors"
          >
            Cancel and logout
          </button>
        </div>
      </div>
    </div>
  );
}
