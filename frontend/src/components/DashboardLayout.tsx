import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import DashboardHeader from './DashboardHeader';
import AppSidebar from './AppSidebar';
import DashboardFooter from './DashboardFooter';

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-darkest)' }}
    >
      <DashboardHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar collapsed={sidebarCollapsed} />
        <main
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            backgroundImage: 'url(/assets/generated/dashboard-bg-texture.dim_1920x1080.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div
            className="flex-1 overflow-y-auto"
            style={{ backgroundColor: 'rgba(10,10,10,0.88)' }}
          >
            <Outlet />
          </div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
