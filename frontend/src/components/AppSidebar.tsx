import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useGetCustomLinks } from '../hooks/useQueries';
import { defaultLinkCategories, iconMap } from '../data/defaultLinks';
import CustomLinkManager from './CustomLinkManager';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutDashboard,
  Lock,
  Settings,
  LucideIcon,
} from 'lucide-react';
import type { CustomLink } from '../backend';

interface AppSidebarProps {
  collapsed: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Vault', path: '/vault', icon: Lock },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function AppSidebar({ collapsed }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: customLinks = [] } = useGetCustomLinks();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showCustomLinkManager, setShowCustomLinkManager] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const isCategoryExpanded = (categoryId: string) => expandedCategories[categoryId] !== false;

  // Group custom links by category
  const customLinksByCategory: Record<string, CustomLink[]> = {};
  customLinks.forEach((link) => {
    if (!customLinksByCategory[link.category]) {
      customLinksByCategory[link.category] = [];
    }
    customLinksByCategory[link.category].push(link);
  });

  return (
    <>
      <aside
        className="h-full flex flex-col overflow-hidden transition-all duration-300"
        style={{
          width: collapsed ? '0px' : '240px',
          minWidth: collapsed ? '0px' : '240px',
          backgroundColor: 'var(--color-surface-dark)',
          borderRight: '1px solid var(--color-military-green-primary)',
          overflow: collapsed ? 'hidden' : 'auto',
        }}
      >
        {!collapsed && (
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <div className="p-3" style={{ borderBottom: '1px solid var(--color-military-green-muted)' }}>
              <p
                className="font-rajdhani text-xs font-semibold tracking-widest uppercase px-2 mb-2"
                style={{ color: 'var(--color-military-green-light)' }}
              >
                Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate({ to: item.path })}
                    className="w-full flex items-center gap-2.5 px-2 py-2 font-inter text-sm transition-all text-left"
                    style={{
                      backgroundColor: isActive ? 'var(--color-military-green-primary)' : 'transparent',
                      color: isActive ? 'var(--color-gold-accent)' : 'var(--color-text-secondary)',
                      borderLeft: isActive ? '2px solid var(--color-gold-accent)' : '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                        e.currentTarget.style.color = 'var(--color-gold-accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="flex-1 overflow-y-auto p-3">
              <p
                className="font-rajdhani text-xs font-semibold tracking-widest uppercase px-2 mb-2"
                style={{ color: 'var(--color-military-green-light)' }}
              >
                Quick Links
              </p>

              {/* Default link categories */}
              {defaultLinkCategories.map((cat) => (
                <div key={cat.id} className="mb-1">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 font-rajdhani text-xs font-semibold tracking-wider uppercase transition-colors"
                    style={{ color: 'var(--color-military-green-light)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-military-green-light)')}
                  >
                    {cat.label}
                    {isCategoryExpanded(cat.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  {isCategoryExpanded(cat.id) && (
                    <div className="ml-2">
                      {cat.links.map((link) => {
                        const Icon = iconMap[link.iconName];
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 py-1.5 font-inter text-xs transition-all"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--color-gold-accent)';
                              e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--color-text-secondary)';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {Icon && <Icon size={13} />}
                            {link.name}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Custom link categories */}
              {Object.entries(customLinksByCategory).map(([catId, links]) => (
                <div key={catId} className="mb-1">
                  <button
                    onClick={() => toggleCategory(`custom_${catId}`)}
                    className="w-full flex items-center justify-between px-2 py-1.5 font-rajdhani text-xs font-semibold tracking-wider uppercase transition-colors"
                    style={{ color: 'var(--color-military-green-light)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-military-green-light)')}
                  >
                    {catId}
                    {isCategoryExpanded(`custom_${catId}`) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  {isCategoryExpanded(`custom_${catId}`) && (
                    <div className="ml-2">
                      {links.map((link) => {
                        const Icon = iconMap[link.iconName];
                        return (
                          <a
                            key={String(link.id)}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 py-1.5 font-inter text-xs transition-all"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--color-gold-accent)';
                              e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--color-text-secondary)';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {Icon && <Icon size={13} />}
                            {link.name}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Link button */}
              <button
                onClick={() => setShowCustomLinkManager(true)}
                className="w-full flex items-center gap-2 px-2 py-2 font-rajdhani text-xs font-bold tracking-widest uppercase mt-2 transition-all"
                style={{
                  border: '1px dashed var(--color-gold-muted)',
                  color: 'var(--color-gold-muted)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gold-accent)';
                  e.currentTarget.style.color = 'var(--color-gold-accent)';
                  e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gold-muted)';
                  e.currentTarget.style.color = 'var(--color-gold-muted)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus size={12} />
                + Add Link
              </button>
            </div>
          </div>
        )}
      </aside>

      {showCustomLinkManager && (
        <CustomLinkManager onClose={() => setShowCustomLinkManager(false)} />
      )}
    </>
  );
}
