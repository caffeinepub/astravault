import React from 'react';
import { useGetCallerUserProfile, useGetCustomLinks, useGetVaultNotes } from '../hooks/useQueries';
import { Shield, Lock, ExternalLink, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { DEFAULT_CATEGORIES } from '../data/defaultLinks';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-surface-1 border border-border rounded-lg p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        {loading ? (
          <>
            <Skeleton className="w-10 h-7 mb-1 bg-surface-3" />
            <Skeleton className="w-20 h-3 bg-surface-3" />
          </>
        ) : (
          <>
            <p className="text-2xl font-rajdhani font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: customLinks = [], isLoading: linksLoading } = useGetCustomLinks();
  const { data: vaultNotes = [], isLoading: notesLoading } = useGetVaultNotes();

  const totalLinks =
    DEFAULT_CATEGORIES.reduce((acc, cat) => acc + cat.links.length, 0) + customLinks.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-surface-1 border border-military-green/30 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-military-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-military-green rounded-full" />
            <div>
              <p className="text-muted-foreground text-sm font-rajdhani tracking-wider uppercase">
                {greeting}, Commander
              </p>
              {profileLoading ? (
                <Skeleton className="w-40 h-7 mt-1 bg-surface-3" />
              ) : (
                <h2 className="font-rajdhani text-2xl font-bold text-foreground tracking-wide">
                  {userProfile?.name || 'Commander'}
                </h2>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-sm ml-4 pl-3 border-l border-border">
            Welcome to your secure command center. All systems operational.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Quick Links"
          value={totalLinks}
          icon={ExternalLink}
          color="bg-military-green-dim text-military-green-bright"
          loading={linksLoading}
        />
        <StatCard
          label="Custom Links"
          value={customLinks.length}
          icon={Plus}
          color="bg-gold/10 text-gold"
          loading={linksLoading}
        />
        <StatCard
          label="Vault Notes"
          value={vaultNotes.length}
          icon={Lock}
          color="bg-surface-3 text-muted-foreground"
          loading={notesLoading}
        />
      </div>

      {/* Quick Access Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani text-lg font-semibold text-foreground tracking-wide uppercase">
            Quick Access
          </h3>
          <button
            onClick={() => navigate({ to: '/vault' })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-military-green transition-colors font-rajdhani tracking-wider uppercase"
          >
            View Vault <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEFAULT_CATEGORIES.slice(0, 6).map(categoryGroup => {
            const IconComponent = categoryGroup.icon;
            return (
              <div
                key={categoryGroup.category}
                className="bg-surface-1 border border-border rounded-lg p-4 hover:border-military-green/40 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded bg-surface-3 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-military-green transition-colors" />
                  </div>
                  <span className="font-rajdhani font-semibold text-sm text-foreground tracking-wide uppercase">
                    {categoryGroup.category}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {categoryGroup.links.slice(0, 3).map(link => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5"
                    >
                      <div className="w-1 h-1 rounded-full bg-military-green/50 flex-shrink-0" />
                      {link.name}
                    </a>
                  ))}
                  {categoryGroup.links.length > 3 && (
                    <p className="text-xs text-muted-foreground/50 pl-3">
                      +{categoryGroup.links.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Vault Notes Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani text-lg font-semibold text-foreground tracking-wide uppercase">
            Vault Notes
          </h3>
          <button
            onClick={() => navigate({ to: '/vault' })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-military-green transition-colors font-rajdhani tracking-wider uppercase"
          >
            Open Vault <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {notesLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <Skeleton key={i} className="w-full h-14 bg-surface-1 rounded-lg" />
            ))}
          </div>
        ) : vaultNotes.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-lg p-6 text-center">
            <Lock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No vault notes yet.</p>
            <button
              onClick={() => navigate({ to: '/vault' })}
              className="mt-3 text-xs text-military-green hover:text-military-green-bright transition-colors font-rajdhani tracking-wider uppercase"
            >
              Create your first note →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {vaultNotes.slice(0, 3).map(note => (
              <div
                key={String(note.id)}
                className="bg-surface-1 border border-border rounded-lg p-4 flex items-center gap-3 hover:border-military-green/30 transition-colors cursor-pointer"
                onClick={() => navigate({ to: '/vault' })}
              >
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate font-mono">
                    {note.encryptedContent.slice(0, 40)}…
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">
                    {new Date(Number(note.createdAt) / 1_000_000).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              </div>
            ))}
            {vaultNotes.length > 3 && (
              <button
                onClick={() => navigate({ to: '/vault' })}
                className="w-full text-center text-xs text-muted-foreground hover:text-military-green transition-colors py-2 font-rajdhani tracking-wider uppercase"
              >
                View all {vaultNotes.length} notes →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
