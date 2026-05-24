import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote,
  CalendarClock,
  CheckSquare,
  Flag,
  Home,
  Newspaper,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import type { AppMode, AppTab, Household } from '../types';
import { AppLogo, AvatarStack, Button, IconButton, StatusPill } from './ui';

const navItems: Array<{ tab: AppTab; label: string; icon: typeof Home }> = [
  { tab: 'home', label: 'Home', icon: Home },
  { tab: 'money', label: 'Money', icon: Banknote },
  { tab: 'bills', label: 'Bills', icon: CalendarClock },
  { tab: 'tasks', label: 'Tasks', icon: CheckSquare },
  { tab: 'goals', label: 'Goals', icon: Flag },
  { tab: 'briefing', label: 'Brief', icon: Newspaper }
];

export function AppShell({
  household,
  appMode,
  tab,
  setTab,
  onStartHousehold,
  children
}: {
  household: Household;
  appMode: AppMode;
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  onStartHousehold: () => void;
  children: React.ReactNode;
}) {
  const headerName = household.name.replace(/^The\s+/i, '').trim();
  const background =
    household.theme === 'ocean'
      ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.22),transparent_34%),linear-gradient(135deg,#041113_0%,#0a1b24_52%,#10131b_100%)]'
      : household.theme === 'ember'
        ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.2),transparent_34%),linear-gradient(135deg,#110807_0%,#1b1010_52%,#10131b_100%)]'
        : 'bg-app-radial';

  return (
    <div className={clsx('min-h-dvh text-white', background)}>
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),transparent)]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-28 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-ink-950/72 px-4 py-3 backdrop-blur-2xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <button
              onClick={() => setTab('home')}
              className="flex items-center gap-3 text-left"
              aria-label="Open Home"
            >
              <AppLogo />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">FamilyOS</p>
                  <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
                  <span className="hidden text-xs font-semibold text-white/45 sm:block">Command center</span>
                </div>
                <h1 className="max-w-[13.5rem] truncate text-base font-black text-white sm:max-w-none sm:text-lg">
                  {headerName}
                </h1>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 sm:flex">
                <AvatarStack members={household.members} />
                <StatusPill tone="green">Live</StatusPill>
              </div>
              <IconButton label="Settings" onClick={() => setTab('settings')} className="h-12 w-12">
                <Settings size={20} />
              </IconButton>
            </div>
          </div>
        </header>

        {appMode === 'demo' && (
          <div className="mt-4 rounded-lg border border-cyan-200/20 bg-cyan-300/10 p-3 shadow-glass backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-white">You&apos;re viewing sample data.</p>
                <p className="mt-1 text-xs leading-5 text-white/58">
                  This Morgan household is only a demo. Start fresh when you&apos;re ready to create your own FamilyOS.
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={onStartHousehold}>
                Start my household
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 py-5 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/88 px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-22px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className={clsx(
                  'relative grid min-h-[3.35rem] place-items-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition',
                  active ? 'text-ink-950' : 'text-white/55 hover:bg-white/10 hover:text-white active:scale-95'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-lg bg-[linear-gradient(145deg,#67e8f9,#6ee7b7)] shadow-glow"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative">
                  <Icon size={19} />
                </span>
                <span className="relative leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
