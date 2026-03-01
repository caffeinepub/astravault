import React, { useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Shield, Plus, Lock, Settings, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { DEFAULT_CATEGORIES, ICON_MAP } from '../data/defaultLinks';
import { useGetCustomLinks } from '../hooks/useQueries';
import CustomLinkManager from './CustomLinkManager';
import type { CustomLink } from '../backend';

interface SidebarLinkProps {
  name: string;
  url?: string;
  iconName: string;
  isNav?: boolean;
  navPath?: string;
  isActive?: boolean;
  onClick?: () => void;
}

function SidebarLink({ name, url, iconName, isNav, navPath, isActive, onClick }: SidebarLinkProps) {
  const navigate = useNavigate();
  const Icon = ICON_MAP[iconName] || ExternalLink;

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (isNav && navPath) { navigate({ to: navPath }); return; }
    if (url) { window.open(url, '_blank', 'noopener,noreferrer'); }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-all group ${
        isActive
          ? 'bg-military-green text-white shadow-green'
          : 'text-muted-foreground hover:bg-surface-3 hover:text-foreground'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-military-green-bright'}`} />
      <span className="truncate text-left">{name}</span>
      {!isNav && url && (
        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 flex-shrink-0" />
      )}
    </button>
  );
}

interface CategorySectionProps {
  category: string;
  links: Array<{ name: string; url: string; iconName: string }>;
  defaultOpen?: boolean;
}

function CategorySection({ category, links, defaultOpen = true }: CategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-rajdhani font-semibold tracking-widest text-gold-dim hover:text-gold uppercase transition-colors"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {category}
      </button>
      {open && (
        <div className="space-y-0.5 ml-1">
          {links.map(link => (
            <SidebarLink
              key={link.name}
              name={link.name}
              url={link.url}
              iconName={link.iconName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const [customLinkManagerOpen, setCustomLinkManagerOpen] = useState(false);
  const { data: customLinks = [] } = useGetCustomLinks();

  // Merge custom links into categories
  const customLinksByCategory: Record<string, CustomLink[]> = {};
  customLinks.forEach(link => {
    if (!customLinksByCategory[link.category]) {
      customLinksByCategory[link.category] = [];
    }
    customLinksByCategory[link.category].push(link);
  });

  // Get custom categories not in defaults
  const defaultCategoryNames = DEFAULT_CATEGORIES.map(c => c.category);
  const extraCategories = Object.keys(customLinksByCategory).filter(
    cat => !defaultCategoryNames.includes(cat)
  );

  return (
    <>
      <aside
        className={`flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          collapsed ? 'w-0 overflow-hidden' : 'w-64'
        } min-h-0 flex-shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
          <img
            src="/assets/generated/astravault-shield-logo.dim_256x256.png"
            alt="AstraVault"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="font-rajdhani font-bold text-gold tracking-widest text-base uppercase leading-none">
              AstraVault
            </h1>
            <p className="text-muted-foreground text-xs tracking-wider mt-0.5">Command Center</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 py-3 border-b border-sidebar-border space-y-0.5">
          <SidebarLink
            name="Dashboard"
            iconName="Shield"
            isNav
            navPath="/"
            isActive={location.pathname === '/'}
          />
          <SidebarLink
            name="Private Vault"
            iconName="Lock"
            isNav
            navPath="/vault"
            isActive={location.pathname === '/vault'}
          />
          <SidebarLink
            name="Settings"
            iconName="Settings"
            isNav
            navPath="/settings"
            isActive={location.pathname === '/settings'}
          />
        </div>

        {/* Scrollable Links */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-1">
          {/* Default categories */}
          {DEFAULT_CATEGORIES.map(cat => {
            const allLinks = [
              ...cat.links,
              ...(customLinksByCategory[cat.category] || []).map(cl => ({
                name: cl.name,
                url: cl.url,
                iconName: cl.iconName,
              })),
            ];
            return (
              <CategorySection
                key={cat.category}
                category={cat.category}
                links={allLinks}
              />
            );
          })}

          {/* Extra custom categories */}
          {extraCategories.map(cat => (
            <CategorySection
              key={cat}
              category={cat}
              links={customLinksByCategory[cat].map(cl => ({
                name: cl.name,
                url: cl.url,
                iconName: cl.iconName,
              }))}
              defaultOpen={false}
            />
          ))}
        </div>

        {/* Add Link Button */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <button
            onClick={() => setCustomLinkManagerOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded border border-dashed border-military-green/40 text-military-green-bright hover:bg-military-green-dim hover:border-military-green text-sm font-rajdhani font-semibold tracking-wider uppercase transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>
      </aside>

      <CustomLinkManager
        open={customLinkManagerOpen}
        onOpenChange={setCustomLinkManagerOpen}
      />
    </>
  );
}
