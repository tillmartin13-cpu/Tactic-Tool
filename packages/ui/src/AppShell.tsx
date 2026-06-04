import type { ReactNode } from 'react';
import { BrandLogo } from './BrandLogo';

/** planning = Teamleader (desktop-first, wide); field = Photographer (mobile-first). */
export type AppShellLayout = 'planning' | 'field';

interface AppShellProps {
  title: string;
  subtitle?: string;
  headerExtra?: ReactNode;
  /** @default 'planning' */
  layout?: AppShellLayout;
  children: ReactNode;
}

const shellClass: Record<
  AppShellLayout,
  { headerInner: string; main: string; root?: string }
> = {
  planning: {
    headerInner:
      'mx-auto flex w-full max-w-[1920px] items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6',
    main: 'mx-auto w-full max-w-[1920px] flex-1 px-3 py-3 sm:px-4 md:py-4 lg:px-6',
  },
  field: {
    root: 'photo-app',
    headerInner:
      'mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3 sm:max-w-xl',
    main:
      'mx-auto w-full max-w-lg flex-1 px-4 py-4 sm:max-w-xl pb-[calc(1rem+env(safe-area-inset-bottom))]',
  },
};

export function AppShell({
  title,
  subtitle,
  headerExtra,
  layout = 'planning',
  children,
}: AppShellProps) {
  const classes = shellClass[layout];

  return (
    <div className={`flex min-h-screen min-h-[100dvh] flex-col bg-slate-100 ${classes.root ?? ''}`}>
      <header
        className="bg-navy text-white"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className={classes.headerInner}>
          <BrandLogo />
          <div className="hidden h-6 w-px bg-white/25 sm:block" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              Tactic Tool
            </p>
            <p className="truncate text-sm font-medium sm:text-base">{title}</p>
            {subtitle ? (
              <p className="hidden truncate text-xs text-white/70 sm:block">{subtitle}</p>
            ) : null}
          </div>
          {headerExtra ? <div className="ml-auto shrink-0">{headerExtra}</div> : null}
        </div>
      </header>
      <main className={classes.main}>{children}</main>
    </div>
  );
}
