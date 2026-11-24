import React from 'react';
import { PortalTab, SessionUser } from '../types/crms';

interface TopBarProps {
  activePortal: PortalTab;
  onSelectPortal: (portal: PortalTab) => void;
  session: SessionUser | null;
  onOpenAuth: () => void;
}

const NAV_ITEMS: Array<{ id: PortalTab; label: string }> = [
  { id: PortalTab.Customer, label: 'Customer' },
  { id: PortalTab.Staff, label: 'Staff' },
  { id: PortalTab.Admin, label: 'Admin' },
  { id: PortalTab.Architecture, label: 'System Model' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activePortal,
  onSelectPortal,
  session,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectPortal(PortalTab.Customer)}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 rounded"
        >
          CRMS Fleet
        </button>

        {/* Zone 2: Clean single-line text nav links */}
        <nav
          aria-label="Primary Portals"
          className="flex items-center gap-6 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePortal === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPortal(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 ${
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {session ? session.name : 'Sign In'}
          </button>
        </div>
      </div>
    </header>
  );
};
