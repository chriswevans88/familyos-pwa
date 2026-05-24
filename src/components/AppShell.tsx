import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote,
  CalendarClock,
  CheckSquare,
  Flag,
  Home,
  Newspaper,
  Settings,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import type { AppTab, Household } from '../types';
import { IconButton } from './ui';

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
  tab,
  setTab,
  children
}: {
  household: Household;
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  children: React.ReactNode;
}) {
  const background =
    household.theme === 'ocean'
      ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.22),transparent_34%),linear-gradient(135deg,#041113_0%,#0a1b24_52%,#10131b_100%)]'
      : household.theme === 'ember'
        ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.2),transparent_34%),linear-gradient(135deg,#110807_0%,#1b1010_52%,#10131b_100%)]'
        : 'bg-app-radial';

  return (
    <div className={clsx('min-h-dvh text-white', background)}>
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-ink-950/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <button
              onClick={() => setTab('home')}
              className="flex items-center gap-3 text-left"
              aria-label="Open Home"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-ink-950 shadow-glow">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">FamilyOS</p>
                <h1 className="max-w-[12rem] truncate text-base font-black text-white sm:max-w-none">
                  {household.name}
                </h1>
              </div>
            </button>
            <IconButton label="Settings" onClick={() => setTab('settings')}>
              <Settings size={19} />
            </IconButton>
          </div>
        </header>

        <main className="flex-1 py-5 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className={clsx(
                  'relative grid min-h-[3.35rem] place-items-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition',
                  active ? 'text-ink-950' : 'text-white/55 hover:bg-white/10 hover:text-white'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-lg bg-cyan-300 shadow-glow"
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
