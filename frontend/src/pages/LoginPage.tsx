import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div
      className="min-h-screen bg-matte-black flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/assets/generated/dashboard-bg-texture.dim_1920x1080.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-matte-black/80" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-military-green to-transparent opacity-60" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-military-green/20 blur-xl scale-150" />
              <img
                src="/assets/generated/astravault-shield-logo.dim_256x256.png"
                alt="AstraVault Shield"
                className="relative w-28 h-28 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <h1 className="font-rajdhani text-5xl font-bold tracking-widest uppercase mb-2"
            style={{ color: 'oklch(0.72 0.12 75)' }}>
            AstraVault
          </h1>
          <p className="text-muted-foreground tracking-widest text-sm uppercase font-rajdhani">
            Secure Personal Command Center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-1/90 backdrop-blur-sm border border-military-green/30 rounded-lg p-8 shadow-green">
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Shield, label: 'Encrypted Vault' },
              { icon: Lock, label: 'Secure Access' },
              { icon: Zap, label: 'Quick Links' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded bg-military-green-dim flex items-center justify-center">
                  <Icon className="w-5 h-5 text-military-green-bright" />
                </div>
                <span className="text-xs text-muted-foreground font-rajdhani tracking-wider">{label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border mb-6" />

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Authenticate with Internet Identity to access your secure command center.
            </p>

            <button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full flex items-center justify-center gap-3 bg-military-green hover:bg-military-green-bright text-white font-rajdhani font-semibold tracking-widest uppercase py-3.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-green hover:shadow-green"
            >
              <Shield className="w-5 h-5" />
              {isLoggingIn ? 'Authenticating...' : isInitializing ? 'Initializing...' : 'Login with Internet Identity'}
            </button>

            <p className="text-xs text-muted-foreground/60 text-center">
              Powered by Internet Computer Protocol
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-xs font-rajdhani tracking-wider" style={{ color: 'oklch(0.72 0.12 75)' }}>
            Developed by Shubham Rathore
          </p>
          <p className="text-xs font-rajdhani tracking-widest uppercase" style={{ color: 'oklch(0.55 0.09 75)' }}>
            Rajput – Creating History
          </p>
        </div>
      </div>
    </div>
  );
}
