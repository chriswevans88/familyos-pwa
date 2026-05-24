import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarClock,
  CheckSquare,
  Flag,
  Home,
  Newspaper,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import type { AppData } from '../types';
import { goalProgress, money, tasksDue, totalsForMonth, upcomingBills } from '../lib/calculations';
import { AppLogo, AvatarStack, Button, Card, ProgressBar, StatusPill } from '../components/ui';
import { ProgressRing } from '../components/ProgressRing';

type GuidedDemoProps = {
  data: AppData;
  onExploreDemo: () => void;
  onSetupHousehold: () => void;
};

const demoSteps = [
  {
    title: 'Household command view',
    eyebrow: 'Step 1 of 6',
    body: 'Home combines cashflow, bills, chores, goals, and the next useful household action in one place.',
    icon: Home,
    tone: 'cyan'
  },
  {
    title: 'Money pulse',
    eyebrow: 'Step 2 of 6',
    body: 'Track income, expenses, category mix, monthly cashflow, and budget pressure without connecting a bank.',
    icon: Banknote,
    tone: 'green'
  },
  {
    title: 'Bills and recurring obligations',
    eyebrow: 'Step 3 of 6',
    body: 'See what is due soon, which payments are on autopay, and who owns the manual follow-up.',
    icon: CalendarClock,
    tone: 'amber'
  },
  {
    title: 'Tasks and responsibilities',
    eyebrow: 'Step 4 of 6',
    body: 'Assign chores, complete tasks, and keep household momentum visible for the week.',
    icon: CheckSquare,
    tone: 'green'
  },
  {
    title: 'Family goals',
    eyebrow: 'Step 5 of 6',
    body: 'Give extra cash a destination: a trip, emergency cushion, home project, or seasonal fund.',
    icon: Flag,
    tone: 'violet'
  },
  {
    title: 'Weekly briefing',
    eyebrow: 'Step 6 of 6',
    body: 'FamilyOS turns the current household data into a practical operating report with a recommended next action.',
    icon: Newspaper,
    tone: 'cyan'
  }
] as const;

export function GuidedDemo({ data, onExploreDemo, onSetupHousehold }: GuidedDemoProps) {
  const [step, setStep] = useState(0);
  const isFinal = step >= demoSteps.length;
  const current = demoSteps[Math.min(step, demoSteps.length - 1)];
  const Icon = current.icon;

  return (
    <div className="min-h-dvh bg-app-radial px-4 py-[max(1rem,env(safe-area-inset-top))] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-2rem)] max-w-5xl content-center gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AppLogo />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="cyan">Guided demo</StatusPill>
                <StatusPill tone="white">Sample household</StatusPill>
              </div>
              <p className="mt-1 text-sm font-bold text-white">{data.household.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onExploreDemo}>
              Skip tour
            </Button>
            <Button variant="secondary" onClick={onSetupHousehold}>
              Set up my household
            </Button>
          </div>
        </header>

        <Card shine className="p-0">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <AnimatePresence mode="wait">
                {isFinal ? (
                  <FinalDemoStep
                    key="final"
                    onSetupHousehold={onSetupHousehold}
                    onExploreDemo={onExploreDemo}
                    onRestart={() => setStep(0)}
                  />
                ) : (
                  <motion.div
                    key={current.title}
                    initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <div className="grid h-14 w-14 place-items-center rounded-lg bg-cyan-300 text-ink-950 shadow-glow">
                      <Icon size={25} />
                    </div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200/80">{current.eyebrow}</p>
                    <h1 className="mt-3 text-4xl font-black leading-[0.96] text-white sm:text-5xl">{current.title}</h1>
                    <p className="mt-4 text-base leading-7 text-white/66">{current.body}</p>
                    <p className="mt-5 rounded-lg border border-white/10 bg-white/10 p-3 text-sm leading-6 text-white/58">
                      This is sample data. Nothing here is your household yet.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isFinal && (
                <div className="mt-7">
                  <ProgressBar value={((step + 1) / demoSteps.length) * 100} color="#67e8f9" />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Button variant="secondary" disabled={step === 0} icon={<ArrowLeft size={16} />} onClick={() => setStep((value) => Math.max(0, value - 1))}>
                      Back
                    </Button>
                    <Button icon={<ArrowRight size={16} />} onClick={() => setStep((value) => value + 1)}>
                      {step === demoSteps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-7">
              <DemoPreview data={data} step={Math.min(step, demoSteps.length - 1)} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DemoPreview({ data, step }: { data: AppData; step: number }) {
  const totals = totalsForMonth(data.transactions);
  const bills = upcomingBills(data.bills, 10);
  const weekTasks = tasksDue(data.tasks, 'week');
  const goalsAverage =
    data.goals.length === 0
      ? 0
      : data.goals.reduce((total, goal) => total + goalProgress(goal), 0) / data.goals.length;

  if (step === 1) {
    return (
      <PreviewPanel title="Money pulse" eyebrow="Monthly view">
        <PreviewMetric label="Income" value={money(totals.income)} tone="green" />
        <PreviewMetric label="Expenses" value={money(totals.expenses)} tone="rose" />
        <PreviewMetric label="Cashflow" value={money(totals.cashflow)} tone="cyan" />
      </PreviewPanel>
    );
  }

  if (step === 2) {
    return (
      <PreviewPanel title="Payment radar" eyebrow="Next 10 days">
        {bills.slice(0, 3).map((bill) => (
          <div key={bill.id} className="rounded-lg border border-amber-200/20 bg-amber-300/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-white">{bill.name}</p>
              <p className="font-black text-white">{money(bill.amount)}</p>
            </div>
            <p className="mt-1 text-xs text-amber-100/70">{bill.autopay ? 'Autopay on' : 'Manual pay'}</p>
          </div>
        ))}
      </PreviewPanel>
    );
  }

  if (step === 3) {
    return (
      <PreviewPanel title="Responsibility load" eyebrow="This week">
        {weekTasks.slice(0, 4).map((task) => {
          const member = data.household.members.find((item) => item.id === task.assignedTo);
          return (
            <div key={task.id} className="rounded-lg bg-white/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-white">{task.title}</p>
                <StatusPill tone={task.completed ? 'green' : 'white'}>{task.completed ? 'Done' : task.priority}</StatusPill>
              </div>
              <p className="mt-1 text-xs text-white/48">{member?.name ?? 'Household'} · {task.category}</p>
            </div>
          );
        })}
      </PreviewPanel>
    );
  }

  if (step === 4) {
    return (
      <PreviewPanel title="Goal portfolio" eyebrow="Momentum">
        <div className="flex items-center justify-between gap-4 rounded-lg bg-white/10 p-4">
          <div>
            <p className="text-sm text-white/55">Average funded</p>
            <p className="mt-1 text-3xl font-black text-white">{Math.round(goalsAverage)}%</p>
          </div>
          <ProgressRing value={goalsAverage} label="Goals" color="#fb7185" size={92} />
        </div>
        {data.goals.slice(0, 2).map((goal) => (
          <div key={goal.id}>
            <div className="mb-1 flex justify-between text-xs text-white/55">
              <span>{goal.name}</span>
              <span>{Math.round(goalProgress(goal))}%</span>
            </div>
            <ProgressBar value={goalProgress(goal)} color={goal.color} />
          </div>
        ))}
      </PreviewPanel>
    );
  }

  if (step === 5) {
    return (
      <PreviewPanel title="Weekly briefing" eyebrow="Operating report">
        <p className="rounded-lg bg-white/10 p-4 text-sm leading-6 text-white/66">{data.briefing.summary}</p>
        {data.briefing.sections.slice(0, 3).map((section) => (
          <div key={section.title} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: section.accent }} />
              <p className="font-bold text-white">{section.title}</p>
            </div>
          </div>
        ))}
      </PreviewPanel>
    );
  }

  return (
    <PreviewPanel title="Household command" eyebrow="Home">
      <div className="flex items-center justify-between gap-4 rounded-lg bg-white/10 p-4">
        <div>
          <p className="text-sm text-white/55">People</p>
          <p className="mt-1 text-3xl font-black text-white">{data.household.members.length}</p>
        </div>
        <AvatarStack members={data.household.members} />
      </div>
      <PreviewMetric label="Bills due soon" value={`${bills.length}`} tone="amber" />
      <PreviewMetric label="Open tasks" value={`${weekTasks.filter((task) => !task.completed).length}`} tone="green" />
      <PreviewMetric label="Cashflow" value={money(totals.cashflow)} tone="cyan" />
    </PreviewPanel>
  );
}

function PreviewPanel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </div>
  );
}

function PreviewMetric({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'green' | 'amber' | 'rose' }) {
  const toneClass =
    tone === 'green'
      ? 'text-emerald-100'
      : tone === 'amber'
        ? 'text-amber-100'
        : tone === 'rose'
          ? 'text-rose-100'
          : 'text-cyan-100';

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/10 p-3">
      <p className="text-sm text-white/56">{label}</p>
      <p className={`font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function FinalDemoStep({
  onSetupHousehold,
  onExploreDemo,
  onRestart
}: {
  onSetupHousehold: () => void;
  onExploreDemo: () => void;
  onRestart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-emerald-300 text-ink-950 shadow-glow">
        <Sparkles size={25} />
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/80">Ready to make it yours?</p>
      <h1 className="mt-3 text-4xl font-black leading-[0.96] text-white sm:text-5xl">Choose your next step.</h1>
      <p className="mt-4 text-base leading-7 text-white/66">
        You can create a blank household now, keep exploring the sample Morgan household, or restart the tour.
      </p>
      <div className="mt-7 grid gap-3">
        <Button icon={<Home size={17} />} onClick={onSetupHousehold}>
          Set up my household
        </Button>
        <Button variant="secondary" icon={<ArrowRight size={17} />} onClick={onExploreDemo}>
          Explore demo manually
        </Button>
        <Button variant="ghost" icon={<RotateCcw size={17} />} onClick={onRestart}>
          Restart tour
        </Button>
      </div>
    </motion.div>
  );
}
