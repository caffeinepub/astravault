import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, Shield, Wifi, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import LogoutConfirmationModal from './LogoutConfirmationModal';

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ sidebarCollapsed, onToggleSidebar }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const avatarInitial = userProfile?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <header className="bg-surface-dark border-b border-military-green-accent/30 h-14 flex items-center px-4 gap-4 z-50 relative">
        {/* Left: Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-gray-400 hover:text-gold-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-accent" />
            <span className="font-rajdhani font-bold text-gold-accent tracking-widest uppercase text-lg hidden sm:block">
              AstraVault
            </span>
          </div>
        </div>

        {/* Center: Secure connection indicator */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5 text-military-green-accent">
            <Wifi className="w-3 h-3" />
            <span className="text-xs font-rajdhani tracking-widest uppercase hidden md:block">
              Secure Connection
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-military-green-accent animate-pulse" />
          </div>
        </div>

        {/* Right: Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-military-green-primary/20 transition-colors"
          >
            {isLoading ? (
              <Skeleton className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-military-green-primary border border-gold-accent/60 flex items-center justify-center">
                <span className="text-gold-accent text-xs font-rajdhani font-bold">{avatarInitial}</span>
              </div>
            )}
            {isLoading ? (
              <Skeleton className="w-20 h-4 hidden sm:block" />
            ) : (
              <span className="text-gray-300 text-sm font-rajdhani hidden sm:block">
                {userProfile?.name ?? 'User'}
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface-dark border border-military-green-accent/40 shadow-xl z-50">
                {/* User info */}
                <div className="px-3 py-2 border-b border-military-green-accent/20">
                  <p className="text-gold-accent text-sm font-rajdhani font-bold truncate">
                    {userProfile?.name ?? 'User'}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    @{userProfile?.username ?? ''}
                  </p>
                </div>

                {/* Menu items */}
                <button
                  onClick={() => { navigate({ to: '/settings' }); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-gold-accent hover:bg-military-green-primary/20 transition-colors text-sm font-rajdhani"
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button
                  onClick={() => { navigate({ to: '/settings' }); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-gold-accent hover:bg-military-green-primary/20 transition-colors text-sm font-rajdhani"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <div className="border-t border-military-green-accent/20" />
                <button
                  onClick={() => { setShowLogoutModal(true); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-sm font-rajdhani"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Logout confirmation modal */}
      <LogoutConfirmationModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}
