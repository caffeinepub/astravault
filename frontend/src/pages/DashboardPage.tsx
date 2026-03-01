import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Link2, FileText, ExternalLink, Archive } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useGetCallerUserProfile, useGetCustomLinks, useGetVaultNotes } from '../hooks/useQueries';
import { defaultLinkCategories, iconMap, CategoryGroup } from '../data/defaultLinks';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: customLinks = [] } = useGetCustomLinks();
  const { data: vaultNotes = [] } = useGetVaultNotes();

  const totalDefaultLinks = defaultLinkCategories.reduce(
    (sum, cat) => sum + cat.links.length, 0
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome banner */}
        <div className="border border-military-green-accent/30 bg-surface-dark/60 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-accent to-transparent" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-military-green-primary border border-gold-accent/60 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-accent text-xl font-rajdhani font-bold">
                {userProfile?.name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            </div>
            <div>
              <h1 className="font-rajdhani text-2xl font-bold text-gold-accent tracking-wider uppercase">
                Welcome, {userProfile?.name ?? 'Operative'}
              </h1>
              <p className="text-gray-400 text-sm font-rajdhani tracking-wide">
                @{userProfile?.username ?? ''} · Vault Status: <span className="text-military-green-accent">SECURE</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-military-green-accent/30 bg-surface-dark/60 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Link2 className="w-5 h-5 text-gold-accent" />
              <span className="text-military-green-accent text-xs font-rajdhani tracking-widest uppercase font-bold">
                Quick Links
              </span>
            </div>
            <p className="text-gold-accent text-3xl font-rajdhani font-bold">{totalDefaultLinks}</p>
            <p className="text-gray-500 text-xs font-rajdhani mt-1">Default links available</p>
          </div>

          <div className="border border-military-green-accent/30 bg-surface-dark/60 p-4">
            <div className="flex items-center gap-3 mb-2">
              <ExternalLink className="w-5 h-5 text-gold-accent" />
              <span className="text-military-green-accent text-xs font-rajdhani tracking-widest uppercase font-bold">
                Custom Links
              </span>
            </div>
            <p className="text-gold-accent text-3xl font-rajdhani font-bold">{customLinks.length}</p>
            <p className="text-gray-500 text-xs font-rajdhani mt-1">Personal links added</p>
          </div>

          <div className="border border-military-green-accent/30 bg-surface-dark/60 p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-gold-accent" />
              <span className="text-military-green-accent text-xs font-rajdhani tracking-widest uppercase font-bold">
                Vault Notes
              </span>
            </div>
            <p className="text-gold-accent text-3xl font-rajdhani font-bold">{vaultNotes.length}</p>
            <p className="text-gray-500 text-xs font-rajdhani mt-1">Encrypted notes stored</p>
          </div>
        </div>

        {/* Quick access grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-gold-accent" />
            <h2 className="font-rajdhani text-lg font-bold text-gold-accent tracking-wider uppercase">
              Quick Access
            </h2>
          </div>

          <div className="space-y-4">
            {defaultLinkCategories.map((categoryGroup: CategoryGroup) => {
              const CategoryIcon = categoryGroup.icon;
              return (
                <div key={categoryGroup.category}>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryIcon className="w-3.5 h-3.5 text-military-green-accent" />
                    <h3 className="text-military-green-accent text-xs font-rajdhani tracking-widest uppercase font-bold">
                      {categoryGroup.category}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {categoryGroup.links.map((link) => {
                      const LinkIcon = iconMap[link.iconName] || ExternalLink;
                      return (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border border-military-green-accent/20 bg-surface-dark/40 hover:border-gold-accent/40 hover:bg-military-green-primary/20 transition-all group"
                        >
                          <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-gold-accent transition-colors flex-shrink-0" />
                          <span className="text-gray-300 text-xs font-rajdhani group-hover:text-gold-accent transition-colors truncate">
                            {link.name}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vault notes preview */}
        {vaultNotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-gold-accent" />
                <h2 className="font-rajdhani text-lg font-bold text-gold-accent tracking-wider uppercase">
                  Recent Vault Notes
                </h2>
              </div>
              <button
                onClick={() => navigate({ to: '/vault' })}
                className="text-military-green-accent hover:text-gold-accent text-xs font-rajdhani tracking-widest uppercase transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {vaultNotes.slice(0, 3).map((note) => (
                <div
                  key={String(note.id)}
                  className="border border-military-green-accent/20 bg-surface-dark/40 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-military-green-accent" />
                    <span className="text-military-green-accent text-xs font-rajdhani tracking-wide uppercase">
                      Encrypted Note
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs font-rajdhani">
                    🔒 Content encrypted — unlock vault to view
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
