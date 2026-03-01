import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Shield, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';

  // Redirect authenticated users to dashboard
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
    <div className="min-h-screen bg-surface-darkest flex items-center justify-center relative overflow-hidden">
      {/* Background grid pattern */}
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

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-gold-accent opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-gold-accent opacity-30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-gold-accent opacity-30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-gold-accent opacity-30" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-surface-dark border border-military-green-accent/40 p-8 shadow-2xl">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-accent to-transparent" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <img
                src="/assets/generated/astravault-shield-logo.dim_256x256.png"
                alt="AstraVault Shield"
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Fallback shield icon */}
              <div className="w-20 h-20 flex items-center justify-center border-2 border-gold-accent bg-military-green-primary/20 absolute inset-0">
                <Shield className="w-10 h-10 text-gold-accent" />
              </div>
            </div>

            <h1 className="font-rajdhani text-3xl font-bold text-gold-accent tracking-widest uppercase">
              AstraVault
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-8 bg-gold-accent/40" />
              <p className="text-gray-400 text-xs tracking-widest uppercase font-rajdhani">
                Secure Your Digital Vault
              </p>
              <div className="h-px w-8 bg-gold-accent/40" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-military-green-accent/30 mb-8" />

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Lock className="w-3 h-3 text-military-green-accent" />
            <span className="text-military-green-accent text-xs tracking-widest uppercase font-rajdhani">
              Blockchain-Secured Authentication
            </span>
            <Lock className="w-3 h-3 text-military-green-accent" />
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn || isInitializing}
            className="w-full py-3 px-6 bg-military-green-primary border border-gold-accent/60 text-gold-accent font-rajdhani font-bold text-sm tracking-widest uppercase hover:bg-military-green-accent hover:border-gold-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : isInitializing ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Login with Internet Identity</span>
              </>
            )}
          </button>

          {/* Info text */}
          <p className="text-center text-gray-500 text-xs mt-4 font-rajdhani tracking-wide">
            Secured by Internet Computer Protocol
          </p>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-military-green-accent to-transparent" />
        </div>

        {/* Classification label */}
        <div className="text-center mt-4">
          <span className="text-gray-600 text-xs tracking-widest uppercase font-rajdhani">
            ◆ Classified Access Only ◆
          </span>
        </div>
      </div>
    </div>
  );
}
