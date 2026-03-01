import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import AppSidebar from './AppSidebar';
import DashboardFooter from './DashboardFooter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-darkest flex flex-col">
      {/* Header */}
      <DashboardHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar collapsed={sidebarCollapsed} />

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto relative"
          style={{
            backgroundImage: `url('/assets/generated/dashboard-bg-texture.dim_1920x1080.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-surface-darkest/85 pointer-events-none" />
          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}
