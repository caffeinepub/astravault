import React from 'react';
import { Heart } from 'lucide-react';

export default function DashboardFooter() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'astravault');

  return (
    <footer className="bg-surface-1 border-t border-border px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
      {/* Developer attribution */}
      <div className="text-center sm:text-left">
        <p className="text-xs font-rajdhani tracking-wider" style={{ color: 'oklch(0.72 0.12 75)' }}>
          Developed by Shubham Rathore
        </p>
        <p className="text-xs font-rajdhani tracking-widest uppercase" style={{ color: 'oklch(0.55 0.09 75)' }}>
          Rajput – Creating History
        </p>
      </div>

      {/* Caffeine attribution */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        © {year} Built with{' '}
        <Heart className="w-3 h-3 inline" style={{ color: 'oklch(0.72 0.12 75)' }} />
        {' '}using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: 'oklch(0.72 0.12 75)' }}
        >
          caffeine.ai
        </a>
      </p>
    </footer>
  );
}
