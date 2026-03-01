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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <DashboardHeader
        onMenuToggle={() => setSidebarCollapsed(c => !c)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
        <main
          className="flex-1 overflow-y-auto scrollbar-thin relative"
          style={{
            backgroundImage: "url('/assets/generated/dashboard-bg-texture.dim_1920x1080.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-background/85 pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex-1 p-6">
              {children}
            </div>
            <DashboardFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
