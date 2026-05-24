import { format } from 'date-fns';
import { Copy, Download, RefreshCw, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { AppData } from '../types';
import { briefingToText } from '../lib/briefing';
import { Button, Card, SectionHeader } from '../components/ui';

type BriefingProps = {
  data: AppData;
  regenerateBriefing: () => void;
};

export function BriefingScreen({ data, regenerateBriefing }: BriefingProps) {
  const [status, setStatus] = useState('');
  const briefing = data.briefing;
  const text = briefingToText(briefing);

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
    <div className="mx-auto grid max-w-5xl gap-5">
      <Card className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Weekly Briefing</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">Executive family readout</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
              Generated locally from your FamilyOS data. No API key, no account, no household details leaving the device.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
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
        </div>
        {status && <p className="mt-4 rounded-lg bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-100">{status}</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 bg-white/10 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-cyan-300 text-ink-950">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-sm text-white/50">Generated {format(new Date(briefing.generatedAt), 'PPp')} · version {briefing.version}</p>
              <h3 className="mt-2 text-2xl font-black leading-tight text-white">{briefing.summary}</h3>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          {briefing.sections.map((section) => (
            <div key={section.title} className="rounded-lg bg-black/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: section.accent }} />
                <h4 className="font-bold text-white">{section.title}</h4>
              </div>
              <p className="text-sm leading-6 text-white/62">{section.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Recommended next action" eyebrow="Focus" />
        <p className="mt-4 rounded-lg bg-cyan-300/10 p-4 text-base font-semibold leading-7 text-cyan-50">
          {briefing.nextAction}
        </p>
      </Card>
    </div>
  );
}
