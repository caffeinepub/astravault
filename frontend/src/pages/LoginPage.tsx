import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Shield, Lock, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-surface-darkest flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/assets/generated/dashboard-bg-texture.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-gold-accent opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-gold-accent opacity-30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-gold-accent opacity-30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-gold-accent opacity-30" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full mx-auto px-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src="/assets/generated/astravault-shield-logo.dim_256x256.png"
              alt="AstraVault Shield"
              className="w-24 h-24 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-24 h-24 text-gold-accent opacity-20" />
            </div>
          </div>

          <h1 className="font-rajdhani text-5xl font-bold tracking-widest text-gold-accent uppercase">
            AstraVault
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px w-12 bg-gold-accent opacity-50" />
            <p className="font-rajdhani text-xs tracking-[0.3em] text-gold-accent/70 uppercase">
              Secure Command Center
            </p>
            <div className="h-px w-12 bg-gold-accent opacity-50" />
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-10 text-center">
          <p className="font-inter text-surface-light/60 text-sm leading-relaxed">
            Military-grade encryption for your digital assets.
            <br />
            Your vault. Your command.
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex gap-4 mb-10">
          <div className="flex items-center gap-1.5 bg-surface-dark/80 border border-gold-accent/20 px-3 py-1.5">
            <Lock className="w-3 h-3 text-gold-accent" />
            <span className="font-rajdhani text-xs text-surface-light/70 tracking-wider uppercase">AES-256</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-dark/80 border border-gold-accent/20 px-3 py-1.5">
            <Shield className="w-3 h-3 text-military-green-light" />
            <span className="font-rajdhani text-xs text-surface-light/70 tracking-wider uppercase">Zero-Trust</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-dark/80 border border-gold-accent/20 px-3 py-1.5">
            <Zap className="w-3 h-3 text-gold-accent" />
            <span className="font-rajdhani text-xs text-surface-light/70 tracking-wider uppercase">On-Chain</span>
          </div>
        </div>

        {/* Login card */}
        <div className="w-full bg-surface-dark/90 border border-gold-accent/30 p-8 relative">
          {/* Card corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-gold-accent" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-gold-accent" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-gold-accent" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-gold-accent" />

          <div className="text-center mb-6">
            <h2 className="font-rajdhani text-xl font-semibold text-surface-light tracking-widest uppercase">
              Authentication Required
            </h2>
            <p className="font-inter text-surface-light/50 text-xs mt-1 tracking-wide">
              Verify your identity to access the vault
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gold-accent/20" />
            <span className="font-rajdhani text-xs text-gold-accent/50 tracking-widest uppercase">Secure Login</span>
            <div className="flex-1 h-px bg-gold-accent/20" />
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn || isInitializing}
            className="w-full bg-military-green-primary hover:bg-military-green-light border border-military-green-light/50 hover:border-gold-accent/50 text-surface-light font-rajdhani font-semibold tracking-widest uppercase py-4 px-6 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-accent/30 border-t-gold-accent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : isInitializing ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-accent/30 border-t-gold-accent rounded-full animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-gold-accent group-hover:scale-110 transition-transform" />
                <span>Login with Internet Identity</span>
              </>
            )}
          </button>

          <p className="text-center font-inter text-surface-light/30 text-xs mt-4 leading-relaxed">
            Secured by Internet Computer Protocol.
            <br />
            No passwords stored. No data harvested.
          </p>
        </div>

        {/* Status indicator */}
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-military-green-light animate-pulse" />
          <span className="font-rajdhani text-xs text-surface-light/40 tracking-widest uppercase">
            Secure Connection Active
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="font-inter text-surface-light/20 text-xs">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'astravault')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-accent/40 hover:text-gold-accent/70 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
