import React from 'react';
import { RotateCcw } from 'lucide-react';
import { SessionUser, UserRole } from '../types/crms';

interface WorkspaceSessionBarProps {
  session: SessionUser | null;
  onQuickLogin: (role: UserRole) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onResetDemo: () => void;
}

export const WorkspaceSessionBar: React.FC<WorkspaceSessionBarProps> = ({
  session,
  onQuickLogin,
  onOpenAuth,
  onLogout,
  onResetDemo,
}) => {
  const roleLabel =
    session?.role === UserRole.Customer
      ? 'Customer'
      : session?.role === UserRole.Staff
        ? 'Rental Staff'
        : session?.role === UserRole.Admin
          ? 'Administrator'
          : null;

  return (
    <div className="bg-white border-b border-slate-200 no-print">
      <div className="max-w-[1280px] mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="font-medium text-slate-900">Indore Branch</span>
          <span aria-hidden="true">·</span>
          {session ? (
            <>
              <span>
                Signed in as{' '}
                <strong className="font-semibold text-slate-900">
                  {session.name}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>{roleLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {session.userId}
              </span>
            </>
          ) : (
            <span>Guest Session — Sign in or select a demo role to transact</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onQuickLogin(UserRole.Customer)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                session?.role === UserRole.Customer
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => onQuickLogin(UserRole.Staff)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                session?.role === UserRole.Staff
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo Staff
            </button>
            <button
              type="button"
              onClick={() => onQuickLogin(UserRole.Admin)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                session?.role === UserRole.Admin
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo Admin
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Login / Register
          </button>

          {session && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          )}

          <button
            type="button"
            onClick={onResetDemo}
            title="Reset demo data to initial SRS state"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
