import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ExternalLink, Plus, ChevronDown, ChevronRight, LayoutDashboard, Archive, Settings } from 'lucide-react';
import { useGetCustomLinks } from '../hooks/useQueries';
import { defaultLinkCategories, iconMap, CategoryGroup } from '../data/defaultLinks';
import CustomLinkManager from './CustomLinkManager';

interface AppSidebarProps {
  collapsed: boolean;
}

export default function AppSidebar({ collapsed }: AppSidebarProps) {
  const navigate = useNavigate();
  const { data: customLinks = [] } = useGetCustomLinks();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['BANK', 'EMAIL']));
  const [showCustomLinkManager, setShowCustomLinkManager] = useState(false);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (collapsed) {
    return (
      <aside className="w-12 bg-surface-dark border-r border-military-green-accent/30 flex flex-col items-center py-4 gap-3 transition-all duration-200">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 text-gray-400 hover:text-gold-accent transition-colors"
          title="Dashboard"
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate({ to: '/vault' })}
          className="p-2 text-gray-400 hover:text-gold-accent transition-colors"
          title="Vault"
        >
          <Archive className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate({ to: '/settings' })}
          className="p-2 text-gray-400 hover:text-gold-accent transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <>
      <aside className="w-56 bg-surface-dark border-r border-military-green-accent/30 flex flex-col overflow-y-auto transition-all duration-200">
        {/* Navigation links */}
        <nav className="p-2 border-b border-military-green-accent/20">
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-gold-accent hover:bg-military-green-primary/20 transition-colors text-sm font-rajdhani tracking-wide"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => navigate({ to: '/vault' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-gold-accent hover:bg-military-green-primary/20 transition-colors text-sm font-rajdhani tracking-wide"
          >
            <Archive className="w-4 h-4" />
            Vault
          </button>
          <button
            onClick={() => navigate({ to: '/settings' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-gold-accent hover:bg-military-green-primary/20 transition-colors text-sm font-rajdhani tracking-wide"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>

        {/* Quick Links section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <p className="text-military-green-accent text-xs font-rajdhani tracking-widest uppercase font-bold">
              Quick Links
            </p>
          </div>

          {/* Default link categories */}
          {defaultLinkCategories.map((categoryGroup: CategoryGroup) => {
            const isExpanded = expandedCategories.has(categoryGroup.category);
            const CategoryIcon = categoryGroup.icon;

            // Get custom links for this category
            const categoryCustomLinks = customLinks.filter(
              link => link.category === categoryGroup.category
            );

            return (
              <div key={categoryGroup.category} className="mb-1">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(categoryGroup.category)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-military-green-accent hover:text-gold-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-3 h-3" />
                    <span className="text-xs font-rajdhani tracking-widest uppercase font-bold">
                      {categoryGroup.category}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>

                {/* Category links */}
                {isExpanded && (
                  <div className="ml-2">
                    {categoryGroup.links.map((link) => {
                      const LinkIcon = iconMap[link.iconName] || ExternalLink;
                      return (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-gold-accent hover:bg-military-green-primary/10 transition-colors text-xs font-rajdhani"
                        >
                          <LinkIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{link.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-auto flex-shrink-0 opacity-50" />
                        </a>
                      );
                    })}

                    {/* Custom links for this category */}
                    {categoryCustomLinks.map((link) => {
                      const LinkIcon = iconMap[link.iconName] || ExternalLink;
                      return (
                        <a
                          key={String(link.id)}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-gold-accent hover:bg-military-green-primary/10 transition-colors text-xs font-rajdhani"
                        >
                          <LinkIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{link.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-auto flex-shrink-0 opacity-50" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom links not in any default category */}
          {customLinks.filter(link =>
            !defaultLinkCategories.some(cat => cat.category === link.category)
          ).length > 0 && (
            <div className="mb-1">
              <div className="px-3 py-1.5 text-military-green-accent">
                <span className="text-xs font-rajdhani tracking-widest uppercase font-bold">Custom</span>
              </div>
              {customLinks
                .filter(link => !defaultLinkCategories.some(cat => cat.category === link.category))
                .map((link) => {
                  const LinkIcon = iconMap[link.iconName] || ExternalLink;
                  return (
                    <a
                      key={String(link.id)}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-gold-accent hover:bg-military-green-primary/10 transition-colors text-xs font-rajdhani ml-2"
                    >
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{link.name}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-auto flex-shrink-0 opacity-50" />
                    </a>
                  );
                })}
            </div>
          )}

          {/* Add link button */}
          <div className="p-2 border-t border-military-green-accent/20 mt-2">
            <button
              onClick={() => setShowCustomLinkManager(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-military-green-accent hover:text-gold-accent hover:bg-military-green-primary/20 transition-colors text-xs font-rajdhani tracking-widest uppercase border border-military-green-accent/30 hover:border-gold-accent/40"
            >
              <Plus className="w-3 h-3" />
              + Add Link
            </button>
          </div>
        </div>
      </aside>

      {/* Custom Link Manager Modal */}
      {showCustomLinkManager && (
        <CustomLinkManager onClose={() => setShowCustomLinkManager(false)} />
      )}
    </>
  );
}
