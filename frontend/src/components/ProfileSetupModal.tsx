import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterUser } from '../hooks/useQueries';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function ProfileSetupModal() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const registerUser = useRegisterUser();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required'); return; }
    if (!username.trim()) { setError('Username is required'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!vaultPassword) { setError('Vault password is required'); return; }
    if (vaultPassword.length < 6) { setError('Vault password must be at least 6 characters'); return; }
    if (vaultPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    try {
      // Hash the vault password using SHA-256
      const encoder = new TextEncoder();
      const data = encoder.encode(vaultPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await registerUser.mutateAsync({
        name: name.trim(),
        username: username.trim(),
        email: email.trim() || null,
        vaultPasswordHash: hashHex,
      });

      // Invalidate and refetch profile queries
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalText] });
      await queryClient.refetchQueries({ queryKey: ['currentUserProfile', principalText] });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-darkest flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 168, 76, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-surface-dark border border-military-green-accent/40 p-8 shadow-2xl">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-accent to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-military-green-primary border border-gold-accent/60 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold-accent" />
            </div>
            <div>
              <h2 className="font-rajdhani text-xl font-bold text-gold-accent tracking-wider uppercase">
                Setup Profile
              </h2>
              <p className="text-gray-500 text-xs font-rajdhani tracking-wide">
                Initialize your secure vault
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
              />
            </div>

            {/* Vault Password */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Vault Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={vaultPassword}
                  onChange={e => setVaultPassword(e.target.value)}
                  placeholder="Create vault password"
                  className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 pr-10 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm vault password"
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="border border-red-500/40 bg-red-900/20 px-3 py-2">
                <p className="text-red-400 text-xs font-rajdhani">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={registerUser.isPending}
              className="w-full py-3 bg-military-green-primary border border-gold-accent/60 text-gold-accent font-rajdhani font-bold text-sm tracking-widest uppercase hover:bg-military-green-accent hover:border-gold-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {registerUser.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Initialize Vault
                </>
              )}
            </button>
          </form>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-military-green-accent to-transparent" />
        </div>
      </div>
    </div>
  );
}
