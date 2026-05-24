import { addDays, format } from 'date-fns';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  FileJson,
  Gauge,
  Link2,
  MoonStar,
  PiggyBank,
  QrCode,
  ShieldCheck,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import type { AppData, AppTab, Member } from '../types';
import {
  budgetBreathingRoom,
  budgetUsage,
  dueLabel,
  goalProgress,
  householdHealthBreakdown,
  money,
  nextBestAction,
  overBudgetCount,
  percent,
  tasksDue,
  totalsForMonth,
  upcomingBills
} from '../lib/calculations';
import { AnimatedValue, AvatarStack, Button, Card, ProgressBar, SectionHeader, StatusPill } from '../components/ui';
import { ProgressRing } from '../components/ProgressRing';

const LIVE_APP_URL = 'https://familyos-pwa.vercel.app';
const SHARE_COPY =
  'FamilyOS brings household money, bills, tasks, goals, and weekly briefings into one practical command center.';

const differencePoints = [
  { label: 'Money', body: 'Cashflow, budgets, categories, and realistic monthly spend.' },
  { label: 'Bills', body: 'Recurring obligations with due dates, owners, autopay, and due-soon pressure.' },
  { label: 'Tasks', body: 'Family responsibilities, assignment, completion, and momentum.' },
  { label: 'Goals', body: 'Shared savings targets with progress and contribution flows.' },
  { label: 'Briefing', body: 'A weekly operating report generated from the current household data.' },
  { label: 'Portable', body: 'Installable PWA, local persistence, JSON backup, import, and QR sharing.' }
];

export function HomeScreen({ data, setTab }: { data: AppData; setTab: (tab: AppTab) => void }) {
  const [shareStatus, setShareStatus] = useState('');
  const totals = totalsForMonth(data.transactions);
  const todayTasks = tasksDue(data.tasks, 'today');
  const weekTasks = tasksDue(data.tasks, 'week');
  const dueBills = upcomingBills(data.bills, 7);
  const nextBills = upcomingBills(data.bills, 21);
  const health = householdHealthBreakdown(data);
  const completedToday = todayTasks.filter((task) => task.completed).length;
  const openTasks = todayTasks.filter((task) => !task.completed);
  const taskCompletion = todayTasks.length === 0 ? 100 : (completedToday / todayTasks.length) * 100;
  const breathingRoom = budgetBreathingRoom(data);
  const overBudget = overBudgetCount(data);
  const nextAction = nextBestAction(data);
  const budgetStatus = data.budgets.map((budget) => ({ budget, ...budgetUsage(budget, data.transactions) }));
  const displayName =
    data.household.name.replace(/^The\s+/i, '').replace(/\s+Household$/i, '').trim() || 'family';
  const topGoal = data.goals
    .slice()
    .sort((a, b) => goalProgress(b) - goalProgress(a))[0];

  const showShareStatus = (value: string) => {
    setShareStatus(value);
    window.setTimeout(() => setShareStatus(''), 2400);
  };

  const copyDemoLink = async () => {
    await navigator.clipboard.writeText(LIVE_APP_URL);
    showShareStatus('Copied live demo link');
  };

  const shareDemo = async () => {
    if (!navigator.share) {
      await copyDemoLink();
      return;
    }

    try {
      await navigator.share({
        title: 'FamilyOS',
        text: SHARE_COPY,
        url: LIVE_APP_URL
      });
      showShareStatus('Opened share sheet');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        showShareStatus('Share dismissed');
        return;
      }
      await copyDemoLink();
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
      <section className="grid gap-5">
        <Card
          shine
          className="isolate border-cyan-200/20 bg-[linear-gradient(135deg,rgba(103,232,249,0.24),rgba(255,255,255,0.08)_42%,rgba(245,197,66,0.12))] p-0"
        >
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_32%,rgba(110,231,183,0.16)_68%,transparent)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-[linear-gradient(0deg,rgba(5,7,11,0.52),transparent)]" />
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid content-between gap-6">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <StatusPill tone="cyan">{format(new Date(), 'EEEE')}</StatusPill>
                  <StatusPill tone={health.score >= 72 ? 'green' : health.score >= 56 ? 'amber' : 'rose'}>
                    {health.score >= 72 ? 'On track' : health.score >= 56 ? 'Watch list' : 'Needs reset'}
                  </StatusPill>
                  <StatusPill tone={dueBills.length > 0 ? 'amber' : 'green'}>
                    {dueBills.length > 0 ? `${dueBills.length} due soon` : 'Bills quiet'}
                  </StatusPill>
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                  {format(new Date(), 'MMMM d')} household briefing
                </p>
                <h2 className="mt-3 max-w-2xl text-4xl font-black leading-[0.96] text-white sm:text-6xl">
                  Not an expense tracker. A household operating view.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/72">
                  {displayName} sees cashflow, bills, chores, goals, and tonight&apos;s next move in one practical command center.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-violet-300 text-ink-950">
                    <MoonStar size={21} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-black text-white">Tonight&apos;s Win</p>
                      <StatusPill tone={nextAction.tone}>{nextAction.tone === 'rose' ? 'Intervene' : 'Momentum up'}</StatusPill>
                    </div>
                    <h3 className="text-lg font-black leading-tight text-white">{nextAction.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">{nextAction.body}</p>
                    <Button className="mt-4 w-full sm:w-auto" variant="secondary" size="sm" onClick={() => setTab(nextAction.tab)} icon={<ArrowRight size={15} />}>
                      Open next step
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-ink-950/36 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <AvatarStack members={data.household.members} />
                  <div>
                    <p className="text-sm font-bold text-white">{data.household.members.length} people online</p>
                    <p className="text-xs text-white/50">Shared household rhythm</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" icon={<Sparkles size={15} />} onClick={() => setTab('briefing')}>
                  Weekly briefing
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="order-2 rounded-lg border border-white/10 bg-ink-950/38 p-4 backdrop-blur-xl lg:order-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/48">Household Health Score</p>
                    <p className="mt-2 text-4xl font-black text-white">
                      <AnimatedValue value={health.score} formatValue={(value) => `${Math.round(value)}`} />
                      <span className="text-xl text-white/45">/100</span>
                    </p>
                  </div>
                  <ProgressRing value={health.score} label="Score" color="#67e8f9" size={104} />
                </div>
                <div className="mt-4 grid gap-2">
                  {[
                    ['Money', health.moneyScore, '#67e8f9'],
                    ['Bills', health.billScore, '#f5c542'],
                    ['Tasks', health.taskScore, '#6ee7b7'],
                    ['Goals', health.goalScore, '#fb7185']
                  ].map(([label, value, color]) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-white/48">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <ProgressBar value={Number(value)} color={String(color)} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Card>

        <section className="grid gap-3 lg:grid-cols-[1.06fr_0.94fr]">
          <Card className="p-5" shine>
            <SectionHeader eyebrow="Why FamilyOS is different" title="One household picture, not one ledger." />
            <p className="mt-3 text-sm leading-6 text-white/62">
              The demo works because every visible signal is connected: money affects budget room, bills create pressure,
              tasks show family load, goals track momentum, and the briefing explains what to do next.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {differencePoints.map((point) => (
                <div key={point.label} className="rounded-lg border border-white/10 bg-white/10 p-3">
                  <p className="text-sm font-black text-white">{point.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{point.body}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            shine
            className="isolate border-emerald-200/20 bg-[linear-gradient(135deg,rgba(110,231,183,0.14),rgba(255,255,255,0.08)_48%,rgba(103,232,249,0.12))] p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="green">Show this to someone</StatusPill>
              <StatusPill tone="cyan">30 seconds</StatusPill>
            </div>
            <h3 className="mt-3 text-2xl font-black leading-tight text-white">A quick walkthrough that lands the point.</h3>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-white/64">
              <DemoLine step="1" text="Start on Home: health score, Tonight's Win, budget room, bills, tasks, and goals." />
              <DemoLine step="2" text="Tap Money, Bills, Tasks, and Goals: each area has real editable household data." />
              <DemoLine step="3" text="Open Briefing and Settings: operating report, installable PWA, backup, import, and QR sharing." />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="w-full max-w-[9.5rem] rounded-lg border border-white/10 bg-white p-2">
                <QRCodeSVG value={LIVE_APP_URL} size={136} bgColor="#ffffff" fgColor="#090b10" level="M" marginSize={2} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/35 p-3 text-xs text-white/72">
                  <Link2 size={15} className="shrink-0 text-cyan-200" />
                  <span className="min-w-0 truncate">{LIVE_APP_URL}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" icon={<Copy size={15} />} onClick={copyDemoLink}>
                    Copy
                  </Button>
                  <Button size="sm" variant="secondary" icon={<Share2 size={15} />} onClick={shareDemo}>
                    Share
                  </Button>
                  <Button size="sm" variant="secondary" icon={<QrCode size={15} />} onClick={() => setTab('settings')}>
                    QR
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<ExternalLink size={15} />}
                    onClick={() => window.open(LIVE_APP_URL, '_blank', 'noopener,noreferrer')}
                  >
                    Open
                  </Button>
                </div>
                {shareStatus && <p className="rounded-lg bg-emerald-300/10 p-2 text-xs font-semibold text-emerald-100">{shareStatus}</p>}
              </div>
            </div>
          </Card>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Cashflow"
            value={totals.cashflow}
            formatValue={(value) => money(value)}
            status={totals.cashflow >= 0 ? 'On track' : 'Tight'}
            tone={totals.cashflow >= 0 ? 'green' : 'rose'}
            icon={<WalletCards size={20} />}
            onClick={() => setTab('money')}
          />
          <MetricCard
            label="Budget room"
            value={breathingRoom}
            formatValue={(value) => `${Math.round(value)}%`}
            status={overBudget > 0 ? `${overBudget} over` : 'Breathing'}
            tone={overBudget > 0 ? 'rose' : breathingRoom < 30 ? 'amber' : 'cyan'}
            icon={<Gauge size={20} />}
            onClick={() => setTab('money')}
          />
          <MetricCard
            label="Tasks today"
            value={taskCompletion}
            formatValue={(value) => `${Math.round(value)}%`}
            status={`${completedToday}/${todayTasks.length || 0} done`}
            tone={taskCompletion >= 70 ? 'green' : 'amber'}
            icon={<CheckCircle2 size={20} />}
            onClick={() => setTab('tasks')}
          />
          <MetricCard
            label="Goals funded"
            value={
              data.goals.length === 0
                ? 0
                : data.goals.reduce((total, goal) => total + goalProgress(goal), 0) / data.goals.length
            }
            formatValue={(value) => `${Math.round(value)}%`}
            status="Momentum up"
            tone="violet"
            icon={<Target size={20} />}
            onClick={() => setTab('goals')}
          />
        </div>

        <section className="grid gap-3">
          <SectionHeader eyebrow="Today" title="Operating queue" />
          <div className="grid gap-3 lg:grid-cols-2">
            <Card interactive className="p-4" shine>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-300 text-ink-950">
                    <CheckCircle2 size={21} />
                  </div>
                  <div>
                    <h3 className="font-black text-white">Task handoff</h3>
                    <p className="text-sm text-white/55">{weekTasks.filter((task) => !task.completed).length} open this week</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={<ChevronRight size={16} />} onClick={() => setTab('tasks')}>
                  Open
                </Button>
              </div>
              <div className="grid gap-3">
                {openTasks.slice(0, 3).map((task) => {
                  const member = data.household.members.find((item) => item.id === task.assignedTo);
                  return <TaskRow key={task.id} title={task.title} subtitle={`${task.category} - ${task.streak} day streak`} member={member} />;
                })}
                {openTasks.length === 0 && (
                  <div className="rounded-lg border border-emerald-200/15 bg-emerald-300/10 p-4 text-sm text-emerald-50">
                    Today&apos;s visible tasks are clear. Add a small tomorrow task to keep the streak warm.
                  </div>
                )}
              </div>
            </Card>

            <Card interactive className="p-4" shine>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-300 text-ink-950">
                    <CalendarClock size={21} />
                  </div>
                  <div>
                    <h3 className="font-black text-white">Payment radar</h3>
                    <p className="text-sm text-white/55">{dueBills.length} inside seven days</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={<ChevronRight size={16} />} onClick={() => setTab('bills')}>
                  Open
                </Button>
              </div>
              <div className="grid gap-3">
                {dueBills.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/10 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-white">{bill.name}</p>
                        {!bill.autopay && <StatusPill tone="amber">Manual</StatusPill>}
                      </div>
                      <p className="text-xs text-white/45">{dueLabel(bill.dueDate)}</p>
                    </div>
                    <span className="font-black text-white">{money(bill.amount)}</span>
                  </div>
                ))}
                {dueBills.length === 0 && (
                  <div className="rounded-lg border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm text-cyan-50">
                    No payments inside the next week. Good window for planning ahead.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-3">
          <SectionHeader
            eyebrow="Family goals"
            title="Progress portfolio"
            action={
              <Button variant="ghost" size="sm" icon={<ChevronRight size={16} />} onClick={() => setTab('goals')}>
                View all
              </Button>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {data.goals.slice(0, 4).map((goal) => (
              <Card key={goal.id} interactive className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: goal.color }} />
                      <StatusPill tone={goalProgress(goal) >= 70 ? 'green' : 'white'}>
                        {goalProgress(goal) >= 70 ? 'Closing in' : 'Building'}
                      </StatusPill>
                    </div>
                    <h3 className="truncate text-lg font-black text-white">{goal.name}</h3>
                    <p className="text-sm text-white/50">
                      {money(goal.current)} of {money(goal.target)}
                    </p>
                  </div>
                  <ProgressRing value={goalProgress(goal)} label="Funded" color={goal.color} size={78} />
                </div>
                <ProgressBar value={goalProgress(goal)} color={goal.color} className="mt-4" />
              </Card>
            ))}
          </div>
        </section>
      </section>

      <aside className="grid content-start gap-5">
        <Card className="p-5" shine>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Budget command</p>
              <h3 className="mt-1 text-2xl font-black text-white">{breathingRoom}% room</h3>
            </div>
            <PiggyBank className="text-cyan-200" size={28} />
          </div>
          <div className="mt-5 grid gap-3">
            {budgetStatus.slice(0, 5).map((item) => (
              <div key={item.budget.id}>
                <div className="mb-1 flex justify-between text-xs text-white/55">
                  <span>{item.budget.category}</span>
                  <span>{money(item.spent)} / {money(item.budget.limit)}</span>
                </div>
                <ProgressBar value={item.ratio * 100} color={item.ratio > 1 ? '#fb7185' : item.budget.color} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-ink-950">
              <Banknote size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Cashflow</p>
              <h3 className="font-black text-white">Monthly pulse</h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <PulseRow icon={<TrendingUp size={16} />} label="Income" value={money(totals.income)} tone="green" />
            <PulseRow icon={<WalletCards size={16} />} label="Expenses" value={money(totals.expenses)} tone="rose" />
            <PulseRow icon={<BadgeCheck size={16} />} label="Net position" value={money(totals.cashflow)} tone={totals.cashflow >= 0 ? 'cyan' : 'rose'} />
          </div>
        </Card>

        <Card className="p-5" shine>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/80">Sunday Briefing</p>
              <h3 className="mt-1 text-2xl font-black text-white">Operating report</h3>
            </div>
            <Sparkles className="text-cyan-200" size={22} />
          </div>
          <p className="mt-4 text-sm leading-6 text-white/64">{data.briefing.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MiniSignal label="Bills" value={`${nextBills.length}`} />
            <MiniSignal label="Tasks" value={`${weekTasks.filter((task) => !task.completed).length}`} />
            <MiniSignal label="Room" value={`${breathingRoom}%`} />
            <MiniSignal label="Goal" value={topGoal ? percent(goalProgress(topGoal)) : '0%'} />
          </div>
          <Button className="mt-4 w-full" onClick={() => setTab('briefing')} icon={<ArrowRight size={16} />}>
            Open operating report
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-300 text-ink-950">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/80">Protected move</p>
              <h3 className="font-black text-white">{money(Math.max(0, totals.cashflow * 0.12))} surplus slice</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Move or earmark this before {format(addDays(new Date(), 2), 'EEEE')} so extra cash does not disappear into everyday spend.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-violet-300 text-ink-950">
              <FileJson size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/80">Portable demo</p>
              <h3 className="font-black text-white">Install, share, backup</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Settings includes Home Screen install help, the live QR code, JSON export/import, and reset-to-demo controls.
          </p>
          <Button className="mt-4 w-full" variant="secondary" onClick={() => setTab('settings')} icon={<ArrowRight size={16} />}>
            Open sharing and backup
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function DemoLine({ step, text }: { step: string; text: string }) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr] gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-300 text-xs font-black text-ink-950">{step}</span>
      <p>{text}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  formatValue,
  status,
  tone,
  icon,
  onClick
}: {
  label: string;
  value: number;
  formatValue: (value: number) => string;
  status: string;
  tone: 'cyan' | 'green' | 'amber' | 'rose' | 'violet';
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Card interactive className="p-4" shine>
      <button className="w-full text-left" onClick={onClick}>
        <div className="flex items-center justify-between gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-cyan-100">{icon}</div>
          <StatusPill tone={tone}>{status}</StatusPill>
        </div>
        <p className="mt-4 text-sm font-semibold text-white/55">{label}</p>
        <p className="mt-1 text-3xl font-black text-white">
          <AnimatedValue value={value} formatValue={formatValue} />
        </p>
      </button>
    </Card>
  );
}

function TaskRow({ title, subtitle, member }: { title: string; subtitle: string; member?: Member }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-3">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black text-ink-950"
        style={{ backgroundColor: member?.color ?? '#67e8f9' }}
      >
        {member?.avatar ?? <Users size={16} />}
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-white">{title}</p>
        <p className="truncate text-xs text-white/45">{member?.name ?? 'Household'} - {subtitle}</p>
      </div>
    </div>
  );
}

function PulseRow({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'cyan' | 'green' | 'rose';
}) {
  const color = tone === 'green' ? 'text-emerald-100' : tone === 'rose' ? 'text-rose-100' : 'text-cyan-100';
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/10 p-3">
      <span className="flex items-center gap-2 text-sm text-white/62">
        {icon}
        {label}
      </span>
      <span className={`font-black ${color}`}>{value}</span>
    </div>
  );
}

function MiniSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
