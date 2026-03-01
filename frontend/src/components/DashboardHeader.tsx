import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProfile } from '../hooks/useQueries';
import { Menu, ChevronDown, Settings, LogOut, User, Shield } from 'lucide-react';
import LogoutConfirmationModal from './LogoutConfirmationModal';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useGetProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const avatarInitial = profile?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-4 z-30 relative"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          borderBottom: '1px solid var(--color-military-green-primary)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}
      >
        {/* Left: Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/astravault-shield-logo.dim_256x256.png"
              alt="AstraVault"
              className="w-8 h-8"
            />
            <span
              className="font-rajdhani font-bold text-lg tracking-widest uppercase hidden sm:block"
              style={{ color: 'var(--color-gold-accent)' }}
            >
              AstraVault
            </span>
          </div>
        </div>

        {/* Center: Secure indicator */}
        <div className="hidden md:flex items-center gap-2">
          <Shield size={14} style={{ color: 'var(--color-military-green-light)' }} />
          <span
            className="font-rajdhani text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-military-green-light)' }}
          >
            Secure Connection
          </span>
        </div>

        {/* Right: Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 transition-all"
            style={{
              border: '1px solid var(--color-military-green-primary)',
              color: 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gold-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-military-green-primary)';
            }}
          >
            <div
              className="w-7 h-7 flex items-center justify-center font-rajdhani font-bold text-sm"
              style={{
                backgroundColor: 'var(--color-military-green-primary)',
                color: 'var(--color-gold-accent)',
              }}
            >
              {avatarInitial}
            </div>
            <span className="font-inter text-sm hidden sm:block max-w-24 truncate">
              {profile?.name ?? 'User'}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 w-48 z-50"
                style={{
                  backgroundColor: 'var(--color-surface-dark)',
                  border: '1px solid var(--color-military-green-primary)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
                }}
              >
                <div
                  className="px-3 py-2"
                  style={{ borderBottom: '1px solid var(--color-military-green-muted)' }}
                >
                  <p className="font-inter text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {profile?.name}
                  </p>
                  <p className="font-inter text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    @{profile?.username}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate({ to: '/' });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 font-inter text-sm transition-colors text-left"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                    e.currentTarget.style.color = 'var(--color-gold-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <User size={14} />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate({ to: '/settings' });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 font-inter text-sm transition-colors text-left"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                    e.currentTarget.style.color = 'var(--color-gold-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <Settings size={14} />
                  Settings
                </button>

                <div style={{ borderTop: '1px solid var(--color-military-green-muted)' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 font-inter text-sm transition-colors text-left"
                    style={{ color: '#f87171' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(180,40,40,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <LogoutConfirmationModal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
