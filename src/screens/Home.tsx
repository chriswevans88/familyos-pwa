import { addDays, format } from 'date-fns';
import { ArrowRight, Banknote, CalendarClock, CheckCircle2, Flag, Sparkles, TrendingUp } from 'lucide-react';
import type { AppData, AppTab } from '../types';
import {
  budgetUsage,
  dataHealthScore,
  dueLabel,
  goalProgress,
  money,
  tasksDue,
  totalsForMonth,
  upcomingBills
} from '../lib/calculations';
import { Button, Card, ProgressBar, SectionHeader } from '../components/ui';
import { ProgressRing } from '../components/ProgressRing';

export function HomeScreen({ data, setTab }: { data: AppData; setTab: (tab: AppTab) => void }) {
  const totals = totalsForMonth(data.transactions);
  const todayTasks = tasksDue(data.tasks, 'today');
  const dueBills = upcomingBills(data.bills, 7);
  const health = dataHealthScore(data);
  const completedToday = todayTasks.filter((task) => task.completed).length;
  const priorityTasks = todayTasks.filter((task) => !task.completed).slice(0, 3);
  const budgetStatus = data.budgets.map((budget) => ({ budget, ...budgetUsage(budget, data.transactions) }));
  const budgetAverage =
    budgetStatus.length === 0
      ? 0
      : budgetStatus.reduce((total, item) => total + Math.min(100, item.ratio * 100), 0) / budgetStatus.length;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
      <section className="grid gap-5">
        <Card className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">Good morning, {data.household.name.split(' ')[1] ?? 'family'}.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/64">
                Today has {dueBills.length} bill{dueBills.length === 1 ? '' : 's'} in view, {priorityTasks.length} priority task
                {priorityTasks.length === 1 ? '' : 's'}, and {data.goals.length} shared goals tracking.
              </p>
            </div>
            <ProgressRing value={health} label="Health" color="#6ee7b7" />
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between text-white/58">
              <span className="text-sm">Income</span>
              <Banknote size={18} />
            </div>
            <p className="mt-3 text-3xl font-black text-white">{money(totals.income)}</p>
            <p className="mt-1 text-xs text-white/50">Month to date</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between text-white/58">
              <span className="text-sm">Expenses</span>
              <TrendingUp size={18} />
            </div>
            <p className="mt-3 text-3xl font-black text-white">{money(totals.expenses)}</p>
            <p className="mt-1 text-xs text-white/50">Across all categories</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between text-white/58">
              <span className="text-sm">Cashflow</span>
              <Sparkles size={18} />
            </div>
            <p className={totals.cashflow >= 0 ? 'mt-3 text-3xl font-black text-emerald-200' : 'mt-3 text-3xl font-black text-rose-200'}>
              {money(totals.cashflow)}
            </p>
            <p className="mt-1 text-xs text-white/50">After visible spend</p>
          </Card>
        </div>

        <section className="grid gap-3">
          <SectionHeader eyebrow="Today" title="Household command queue" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Tasks</h3>
                  <p className="text-sm text-white/55">
                    {completedToday}/{todayTasks.length || 0} complete today
                  </p>
                </div>
                <Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} onClick={() => setTab('tasks')}>
                  Open
                </Button>
              </div>
              <div className="grid gap-3">
                {priorityTasks.length === 0 ? (
                  <p className="rounded-lg bg-white/10 p-3 text-sm text-white/62">The visible task load is handled. Nice and quiet.</p>
                ) : (
                  priorityTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                      <CheckCircle2 className={task.completed ? 'text-emerald-200' : 'text-white/40'} size={19} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{task.title}</p>
                        <p className="text-xs text-white/45">{task.category}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Due soon</h3>
                  <p className="text-sm text-white/55">Next 7 days</p>
                </div>
                <Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} onClick={() => setTab('bills')}>
                  Open
                </Button>
              </div>
              <div className="grid gap-3">
                {dueBills.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/10 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{bill.name}</p>
                      <p className="text-xs text-white/45">{dueLabel(bill.dueDate)}</p>
                    </div>
                    <span className="font-black text-white">{money(bill.amount)}</span>
                  </div>
                ))}
                {dueBills.length === 0 && (
                  <p className="rounded-lg bg-white/10 p-3 text-sm text-white/62">No recurring payments inside the next week.</p>
                )}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-3">
          <SectionHeader eyebrow="Goals" title="Shared progress" action={<Button variant="ghost" size="sm" onClick={() => setTab('goals')}>View all</Button>} />
          <div className="grid gap-3 sm:grid-cols-2">
            {data.goals.slice(0, 4).map((goal) => (
              <Card key={goal.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{goal.name}</h3>
                    <p className="text-sm text-white/50">{money(goal.current)} of {money(goal.target)}</p>
                  </div>
                  <Flag size={19} style={{ color: goal.color }} />
                </div>
                <ProgressBar value={goalProgress(goal)} color={goal.color} className="mt-4" />
              </Card>
            ))}
          </div>
        </section>
      </section>

      <aside className="grid content-start gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Budget health</p>
              <h3 className="mt-1 text-2xl font-black text-white">{Math.round(100 - budgetAverage)}% breathing room</h3>
            </div>
            <ProgressRing value={Math.max(0, 100 - budgetAverage)} label="Room" color="#22d3ee" size={96} />
          </div>
          <div className="mt-5 grid gap-3">
            {budgetStatus.slice(0, 4).map((item) => (
              <div key={item.budget.id}>
                <div className="mb-1 flex justify-between text-xs text-white/55">
                  <span>{item.budget.category}</span>
                  <span>{money(item.spent)} / {money(item.budget.limit)}</span>
                </div>
                <ProgressBar value={item.ratio * 100} color={item.budget.color} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-300 text-ink-950">
              <CalendarClock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/80">Recurring</p>
              <h3 className="font-bold text-white">Next payment window</h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {upcomingBills(data.bills, 21).slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{bill.name}</p>
                  <p className="text-xs text-white/45">{dueLabel(bill.dueDate)}</p>
                </div>
                <p className="font-bold text-white">{money(bill.amount)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-100/80">Sunday Briefing</p>
              <h3 className="mt-1 text-2xl font-black text-white">Executive household readout</h3>
            </div>
            <Sparkles className="text-cyan-200" size={22} />
          </div>
          <p className="mt-4 text-sm leading-6 text-white/64">{data.briefing.summary}</p>
          <div className="mt-4 rounded-lg bg-white/10 p-3 text-sm text-white/75">
            <span className="font-semibold text-white">Next action: </span>
            {data.briefing.nextAction}
          </div>
          <Button className="mt-4 w-full" onClick={() => setTab('briefing')} icon={<ArrowRight size={16} />}>
            Open briefing
          </Button>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Priority</p>
          <h3 className="mt-1 text-xl font-black text-white">Protect {money(Math.max(0, totals.cashflow * 0.12))}</h3>
          <p className="mt-2 text-sm leading-6 text-white/58">
            FamilyOS recommends moving this week&apos;s surplus slice before {format(addDays(new Date(), 2), 'EEEE')}.
          </p>
        </Card>
      </aside>
    </div>
  );
}
