import type { ReactNode } from 'react';
import { BrandLogo } from './BrandLogo';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header
        className="bg-navy text-white"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <BrandLogo />
          <div className="hidden h-6 w-px bg-white/25 sm:block" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              Tactic Tool
            </p>
            <p className="truncate text-sm font-medium">{title}</p>
            {subtitle ? (
              <p className="truncate text-xs text-white/70">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-4">{children}</main>
    </div>
  );
}
