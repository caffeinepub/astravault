import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Shield, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { hashPassword } from '../utils/encryption';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const principalText = identity?.getPrincipal().toString() ?? 'anonymous';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (vaultPassword.length < 8) {
      setError('Vault password must be at least 8 characters.');
      return;
    }
    if (vaultPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!actor) {
      setError('Connection not ready. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const vaultPasswordHash = await hashPassword(vaultPassword);
      await actor.registerUser(
        name.trim(),
        username.trim(),
        email.trim() || null,
        vaultPasswordHash,
      );

      // Invalidate all profile-related queries so ProtectedRoute re-evaluates
      await queryClient.invalidateQueries({ queryKey: ['profile', principalText] });
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile', principalText] });
      await queryClient.refetchQueries({ queryKey: ['profile', principalText] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('already exists') ? 'Account already exists.' : `Registration failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Your Vault</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Set up your secure profile to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Username <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Email <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {/* Vault Password */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                <Lock className="inline w-3 h-3 mr-1" />
                Vault Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={vaultPassword}
                  onChange={(e) => setVaultPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-background border border-border rounded px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Confirm Vault Password <span className="text-destructive">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your vault password"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Vault...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Create Secure Vault
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your vault is encrypted and stored on the Internet Computer blockchain.
        </p>
      </div>
    </div>
  );
}
