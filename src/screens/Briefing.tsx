import { format } from 'date-fns';
import { CalendarClock, Copy, Download, Gauge, RefreshCw, Send, Sparkles, Target, Zap } from 'lucide-react';
import { useState } from 'react';
import type { AppData } from '../types';
import { briefingToText } from '../lib/briefing';
import {
  budgetBreathingRoom,
  goalProgress,
  householdHealthBreakdown,
  money,
  nextBestAction,
  percent,
  tasksDue,
  totalsForMonth,
  upcomingBills
} from '../lib/calculations';
import { AnimatedValue, AppLogo, Button, Card, ProgressBar, SectionHeader, StatusPill } from '../components/ui';
import { ProgressRing } from '../components/ProgressRing';

type BriefingProps = {
  data: AppData;
  regenerateBriefing: () => void;
};

export function BriefingScreen({ data, regenerateBriefing }: BriefingProps) {
  const [status, setStatus] = useState('');
  const briefing = data.briefing;
  const text = briefingToText(briefing);
  const health = householdHealthBreakdown(data);
  const totals = totalsForMonth(data.transactions);
  const bills = upcomingBills(data.bills, 10);
  const weekTasks = tasksDue(data.tasks, 'week');
  const openTasks = weekTasks.filter((task) => !task.completed);
  const room = budgetBreathingRoom(data);
  const action = nextBestAction(data);
  const averageGoal =
    data.goals.length === 0
      ? 0
      : data.goals.reduce((total, goal) => total + goalProgress(goal), 0) / data.goals.length;

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setStatus('Copied briefing to clipboard');
    window.setTimeout(() => setStatus(''), 2200);
  };

  const share = async () => {
    if ('share' in navigator) {
      await navigator.share({ title: 'FamilyOS Weekly Briefing', text });
      setStatus('Opened share sheet');
    } else {
      await copy();
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `familyos-briefing-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('Downloaded briefing text');
    window.setTimeout(() => setStatus(''), 2200);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <Card
        shine
        className="isolate border-cyan-200/20 bg-[linear-gradient(135deg,rgba(103,232,249,0.22),rgba(255,255,255,0.08)_45%,rgba(167,139,250,0.16))] p-0"
      >
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(255,255,255,0.10),transparent_38%,rgba(110,231,183,0.12))]" />
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <AppLogo />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/80">Weekly Briefing</p>
                <p className="text-sm text-white/52">Generated {format(new Date(briefing.generatedAt), 'PPp')} - v{briefing.version}</p>
              </div>
            </div>
            <h2 className="max-w-3xl text-4xl font-black leading-[0.96] text-white sm:text-6xl">
              Household operating report.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">{briefing.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusPill tone={health.score >= 72 ? 'green' : 'amber'}>{health.score}/100 health</StatusPill>
              <StatusPill tone={bills.length > 0 ? 'amber' : 'green'}>{bills.length} obligations</StatusPill>
              <StatusPill tone={openTasks.length > 0 ? 'violet' : 'green'}>{openTasks.length} open tasks</StatusPill>
              <StatusPill tone={totals.cashflow >= 0 ? 'cyan' : 'rose'}>{money(totals.cashflow)} net</StatusPill>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-white/10 bg-ink-950/38 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Readiness</p>
                  <p className="mt-2 text-4xl font-black text-white">
                    <AnimatedValue value={health.score} formatValue={(value) => `${Math.round(value)}`} />
                  </p>
                </div>
                <ProgressRing value={health.score} label="Ready" color="#67e8f9" size={106} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={regenerateBriefing}>
                Regenerate
              </Button>
              <Button variant="secondary" icon={<Copy size={16} />} onClick={copy}>
                Copy
              </Button>
              <Button variant="secondary" icon={<Send size={16} />} onClick={share}>
                Share
              </Button>
              <Button icon={<Download size={16} />} onClick={download}>
                Export
              </Button>
            </div>
            {status && <p className="rounded-lg bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-100">{status}</p>}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <section className="grid content-start gap-5">
          <Card className="p-5" shine>
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-violet-300 text-ink-950">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/80">Command intent</p>
                <h3 className="mt-1 text-2xl font-black text-white">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{action.body}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Readiness board" eyebrow="Signals" />
            <div className="mt-4 grid gap-3">
              <ReadinessRow label="Money" value={health.moneyScore} color="#67e8f9" />
              <ReadinessRow label="Bills" value={health.billScore} color="#f5c542" />
              <ReadinessRow label="Tasks" value={health.taskScore} color="#6ee7b7" />
              <ReadinessRow label="Goals" value={health.goalScore} color="#fb7185" />
            </div>
          </Card>
        </section>

        <section className="grid content-start gap-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BriefMetric icon={<Gauge size={18} />} label="Budget room" value={`${room}%`} tone="cyan" />
            <BriefMetric icon={<CalendarClock size={18} />} label="Bills due" value={`${bills.length}`} tone="amber" />
            <BriefMetric icon={<Sparkles size={18} />} label="Open tasks" value={`${openTasks.length}`} tone="violet" />
            <BriefMetric icon={<Target size={18} />} label="Goal avg" value={percent(averageGoal)} tone="green" />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-white/10 bg-white/10 p-5 sm:p-6">
              <SectionHeader title="Operating analysis" eyebrow="Executive readout" />
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {briefing.sections.map((section) => (
                <div key={section.title} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: section.accent }} />
                      <h4 className="font-black text-white">{section.title}</h4>
                    </div>
                    <StatusPill tone="white">Signal</StatusPill>
                  </div>
                  <p className="text-sm leading-6 text-white/62">{section.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function ReadinessRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/48">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <ProgressBar value={value} color={color} />
    </div>
  );
}

function BriefMetric({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'cyan' | 'amber' | 'violet' | 'green';
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-300 text-ink-950'
      : tone === 'amber'
        ? 'bg-amber-300 text-ink-950'
        : tone === 'violet'
          ? 'bg-violet-300 text-ink-950'
          : 'bg-cyan-300 text-ink-950';

  return (
    <Card className="p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneClass}`}>{icon}</div>
      <p className="mt-4 text-sm text-white/55">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
    </Card>
  );
}
