import { useNavigate } from '@tanstack/react-router';
import { useGetProfile, useGetCustomLinks, useGetVaultNotes } from '../hooks/useQueries';
import { defaultLinkCategories, iconMap } from '../data/defaultLinks';
import { Lock, Settings, Link, FileText, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: profile } = useGetProfile();
  const { data: customLinks = [] } = useGetCustomLinks();
  const { data: vaultNotes = [] } = useGetVaultNotes();

  const totalDefaultLinks = defaultLinkCategories.reduce((sum, cat) => sum + cat.links.length, 0);

  const quickAccessItems = [
    {
      label: 'Vault',
      description: 'Encrypted notes & secrets',
      icon: Lock,
      path: '/vault',
      count: vaultNotes.length,
      countLabel: 'notes',
    },
    {
      label: 'Settings',
      description: 'Profile & security settings',
      icon: Settings,
      path: '/settings',
      count: null,
      countLabel: null,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div
        className="p-6"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid var(--color-military-green-primary)',
          borderLeft: '4px solid var(--color-gold-accent)',
        }}
      >
        <h1
          className="font-rajdhani text-3xl font-bold tracking-wider uppercase"
          style={{ color: 'var(--color-gold-accent)' }}
        >
          Welcome, {profile?.name ?? 'Operative'}
        </h1>
        <p className="font-inter text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Your secure command center is ready. All systems operational.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface-dark)',
            border: '1px solid var(--color-military-green-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-military-green-muted)' }}
            >
              <Link size={18} style={{ color: 'var(--color-gold-accent)' }} />
            </div>
            <div>
              <p className="font-rajdhani text-2xl font-bold" style={{ color: 'var(--color-gold-accent)' }}>
                {totalDefaultLinks}
              </p>
              <p className="font-inter text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Default Links
              </p>
            </div>
          </div>
          <p className="font-inter text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Pre-configured quick access links
          </p>
        </div>

        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface-dark)',
            border: '1px solid var(--color-military-green-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-military-green-muted)' }}
            >
              <Link size={18} style={{ color: 'var(--color-gold-accent)' }} />
            </div>
            <div>
              <p className="font-rajdhani text-2xl font-bold" style={{ color: 'var(--color-gold-accent)' }}>
                {customLinks.length}
              </p>
              <p className="font-inter text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Custom Links
              </p>
            </div>
          </div>
          <p className="font-inter text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Your personalized link collection
          </p>
        </div>

        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface-dark)',
            border: '1px solid var(--color-military-green-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-military-green-muted)' }}
            >
              <Lock size={18} style={{ color: 'var(--color-gold-accent)' }} />
            </div>
            <div>
              <p className="font-rajdhani text-2xl font-bold" style={{ color: 'var(--color-gold-accent)' }}>
                {vaultNotes.length}
              </p>
              <p className="font-inter text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Vault Notes
              </p>
            </div>
          </div>
          <p className="font-inter text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            AES-256-GCM encrypted secrets
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2
          className="font-rajdhani text-lg font-bold tracking-widest uppercase mb-3"
          style={{ color: 'var(--color-military-green-light)' }}
        >
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className="p-5 text-left transition-all"
                style={{
                  backgroundColor: 'var(--color-surface-dark)',
                  border: '1px solid var(--color-military-green-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gold-accent)';
                  e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-military-green-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-dark)';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-military-green-muted)' }}
                    >
                      <Icon size={18} style={{ color: 'var(--color-gold-accent)' }} />
                    </div>
                    <div>
                      <p
                        className="font-rajdhani font-bold tracking-wider uppercase text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {item.label}
                      </p>
                      <p className="font-inter text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-gold-muted)' }} />
                </div>
                {item.count !== null && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-military-green-muted)' }}>
                    <span
                      className="font-rajdhani text-xl font-bold"
                      style={{ color: 'var(--color-gold-accent)' }}
                    >
                      {item.count}
                    </span>
                    <span className="font-inter text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                      {item.countLabel}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Vault Notes Preview */}
      {vaultNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="font-rajdhani text-lg font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-military-green-light)' }}
            >
              Recent Vault Activity
            </h2>
            <button
              onClick={() => navigate({ to: '/vault' })}
              className="font-rajdhani text-xs font-semibold tracking-wider uppercase flex items-center gap-1 transition-colors"
              style={{ color: 'var(--color-gold-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-gold-muted)')}
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {vaultNotes.slice(0, 3).map((note) => (
              <div
                key={String(note.id)}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  backgroundColor: 'var(--color-surface-dark)',
                  border: '1px solid var(--color-military-green-muted)',
                }}
              >
                <FileText size={14} style={{ color: 'var(--color-military-green-light)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Encrypted note #{String(note.id)}
                  </p>
                  <p className="font-inter text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(Number(note.createdAt) / 1_000_000).toLocaleDateString()}
                  </p>
                </div>
                <Lock size={12} style={{ color: 'var(--color-gold-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Links Grid */}
      <div>
        <h2
          className="font-rajdhani text-lg font-bold tracking-widest uppercase mb-3"
          style={{ color: 'var(--color-military-green-light)' }}
        >
          Quick Links
        </h2>
        <div className="space-y-4">
          {defaultLinkCategories.map((cat) => (
            <div key={cat.id}>
              <p
                className="font-rajdhani text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'var(--color-military-green-light)' }}
              >
                {cat.label}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {cat.links.map((link) => {
                  const Icon = iconMap[link.iconName];
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 font-inter text-xs transition-all"
                      style={{
                        backgroundColor: 'var(--color-surface-dark)',
                        border: '1px solid var(--color-military-green-muted)',
                        color: 'var(--color-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold-accent)';
                        e.currentTarget.style.color = 'var(--color-gold-accent)';
                        e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-military-green-muted)';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-dark)';
                      }}
                    >
                      {Icon && <Icon size={14} />}
                      <span className="truncate">{link.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
