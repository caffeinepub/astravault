import React, { useState } from 'react';
import { Menu, Settings, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export default function DashboardHeader({ onMenuToggle, sidebarCollapsed }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    queryClient.clear();
    await clear();
    setLogoutModalOpen(false);
  };

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <header className="h-14 bg-surface-1 border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-10">
        {/* Left: Menu toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded hover:bg-surface-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/astravault-shield-logo.dim_256x256.png"
              alt="AstraVault"
              className="w-7 h-7 object-contain"
            />
            <span className="font-rajdhani font-bold text-gold tracking-widest text-base uppercase hidden sm:block">
              AstraVault
            </span>
          </div>
        </div>

        {/* Center: Status indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-military-green animate-pulse" />
          <span className="text-xs text-muted-foreground font-rajdhani tracking-widest uppercase">
            Secure Connection
          </span>
        </div>

        {/* Right: Profile dropdown */}
        {profileLoading ? (
          /* Skeleton while profile is loading */
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <Skeleton className="w-8 h-8 rounded-full bg-surface-3" />
            <div className="hidden sm:flex flex-col gap-1">
              <Skeleton className="w-24 h-3 bg-surface-3" />
              <Skeleton className="w-16 h-2.5 bg-surface-3" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-surface-3 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-military-green flex items-center justify-center text-white font-rajdhani font-bold text-sm">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground leading-none">
                    {userProfile?.name || 'Commander'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    @{userProfile?.username || '...'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 bg-surface-1 border border-military-green/30"
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs uppercase tracking-wider font-rajdhani">
                {userProfile?.name || 'Commander'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => navigate({ to: '/settings' })}
                className="flex items-center gap-2 text-foreground hover:bg-surface-3 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => setLogoutModalOpen(true)}
                className="flex items-center gap-2 text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <LogoutConfirmationModal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
