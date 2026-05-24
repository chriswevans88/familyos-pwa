import {
  BadgeCheck,
  Copy,
  Download,
  ExternalLink,
  Home,
  Import,
  Link2,
  MonitorDown,
  Plus,
  QrCode,
  RefreshCcw,
  Share2,
  Smartphone,
  Trash2,
  Upload
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';
import { memberPalette } from '../data/seed';
import { downloadJson, parseImportedData, withFreshBriefing } from '../lib/storage';
import type { AppData, Member, ThemePreference } from '../types';
import { AppLogo, Button, Card, Field, IconButton, SectionHeader, SelectField, StatusPill } from '../components/ui';

const LIVE_APP_URL = 'https://familyos-pwa.vercel.app';
const SHARE_COPY =
  'FamilyOS is a premium household command center for money, bills, tasks, goals, and weekly family briefings.';

type SettingsProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  resetDemoData: () => void;
  install: () => Promise<boolean>;
  canInstall: boolean;
  installed: boolean;
};

export function SettingsScreen({
  data,
  setData,
  resetDemoData,
  install,
  canInstall,
  installed
}: SettingsProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');

  const showMessage = (value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(''), 2600);
  };

  const updateMember = (id: string, patch: Partial<Member>) => {
    setData((current) =>
      withFreshBriefing(
        {
          ...current,
          household: {
            ...current.household,
            members: current.household.members.map((member) =>
              member.id === id
                ? {
                    ...member,
                    ...patch,
                    avatar: (patch.name ?? member.name).trim().charAt(0).toUpperCase() || member.avatar
                  }
                : member
            )
          }
        },
        current.briefing.version + 1
      )
    );
  };

  const addMember = () => {
    setData((current) => {
      const index = current.household.members.length;
      const member: Member = {
        id: `member-${crypto.randomUUID()}`,
        name: `Member ${index + 1}`,
        role: 'Family',
        color: memberPalette[index % memberPalette.length],
        avatar: `${index + 1}`
      };
      return withFreshBriefing(
        {
          ...current,
          household: { ...current.household, members: [...current.household.members, member] }
        },
        current.briefing.version + 1
      );
    });
  };

  const removeMember = (member: Member) => {
    if (data.household.members.length <= 1) return;
    if (!window.confirm(`Remove ${member.name} from this household?`)) return;
    setData((current) => {
      const remaining = current.household.members.filter((item) => item.id !== member.id);
      const fallback = remaining[0]?.id ?? '';
      return withFreshBriefing(
        {
          ...current,
          household: { ...current.household, members: remaining },
          tasks: current.tasks.map((task) => (task.assignedTo === member.id ? { ...task, assignedTo: fallback } : task)),
          bills: current.bills.map((bill) => (bill.ownerId === member.id ? { ...bill, ownerId: fallback } : bill))
        },
        current.briefing.version + 1
      );
    });
  };

  const updateHousehold = (patch: Partial<AppData['household']>) => {
    setData((current) =>
      withFreshBriefing(
        {
          ...current,
          household: { ...current.household, ...patch }
        },
        current.briefing.version + 1
      )
    );
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      setData(parseImportedData(text));
      showMessage('Imported FamilyOS data');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Import failed');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleInstall = async () => {
    const accepted = await install();
    showMessage(accepted ? 'Install started' : 'Install prompt dismissed');
  };

  const copyInstallSteps = async () => {
    await navigator.clipboard.writeText(
      `Install FamilyOS: open ${LIVE_APP_URL} on your phone. On iPhone, use Safari, tap Share, choose Add to Home Screen, then tap Add. On Android, open it in Chrome and use the Install app prompt or menu option.`
    );
    showMessage('Copied phone install steps');
  };

  const copyLiveUrl = async () => {
    await navigator.clipboard.writeText(LIVE_APP_URL);
    showMessage('Copied live FamilyOS URL');
  };

  const shareFamilyOS = async () => {
    if (!navigator.share) {
      await copyLiveUrl();
      return;
    }

    try {
      await navigator.share({
        title: 'FamilyOS',
        text: SHARE_COPY,
        url: LIVE_APP_URL
      });
      showMessage('Opened share sheet');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        showMessage('Share dismissed');
        return;
      }
      await copyLiveUrl();
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card
        shine
        className="isolate border-cyan-200/20 bg-[linear-gradient(135deg,rgba(103,232,249,0.2),rgba(255,255,255,0.08)_48%,rgba(110,231,183,0.12))] p-5 lg:col-span-2"
      >
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-[linear-gradient(0deg,rgba(5,7,11,0.52),transparent)]" />
        <div className="flex items-start gap-3">
          <AppLogo />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Install FamilyOS</p>
              <StatusPill tone={installed ? 'green' : 'cyan'}>{installed ? 'Installed' : 'PWA ready'}</StatusPill>
            </div>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white">Put the command center on your phone.</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              It launches like an app, keeps the dark standalone interface, and stores household data on this device.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <InstallStep icon={<Share2 size={18} />} title="iPhone" body="Open FamilyOS in Safari, tap Share, then Add to Home Screen." />
          <InstallStep icon={<Smartphone size={18} />} title="Android" body="Open FamilyOS in Chrome and tap Install app when prompted." />
          <InstallStep icon={<BadgeCheck size={18} />} title="After install" body="Launch from the Home Screen and use it like a private household app." />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <Button disabled={!canInstall || installed} onClick={handleInstall} icon={<MonitorDown size={16} />}>
            {installed ? 'Installed' : canInstall ? 'Install FamilyOS' : 'Install when available'}
          </Button>
          <Button variant="secondary" icon={<Home size={16} />} onClick={copyInstallSteps}>
            Copy phone steps
          </Button>
        </div>
      </Card>

      <Card
        shine
        className="isolate border-emerald-200/20 bg-[linear-gradient(135deg,rgba(110,231,183,0.16),rgba(255,255,255,0.08)_50%,rgba(103,232,249,0.14))] p-5 lg:col-span-2"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="green">Live demo</StatusPill>
              <StatusPill tone="cyan">QR ready</StatusPill>
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white">Share FamilyOS from the production app.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
              Use the live Vercel URL for demos, phone installs, and QR codes. The app opens with demo data and can be added to the Home Screen.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/35 p-3 text-sm text-white/76">
              <Link2 size={16} className="shrink-0 text-cyan-200" />
              <span className="min-w-0 truncate">{LIVE_APP_URL}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Button icon={<Copy size={16} />} onClick={copyLiveUrl}>
                Copy URL
              </Button>
              <Button variant="secondary" icon={<Share2 size={16} />} onClick={shareFamilyOS}>
                Share
              </Button>
              <Button
                variant="secondary"
                icon={<ExternalLink size={16} />}
                onClick={() => window.open(LIVE_APP_URL, '_blank', 'noopener,noreferrer')}
              >
                Open
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[13.5rem] rounded-lg border border-white/10 bg-white/10 p-3 text-center">
            <div className="rounded-lg bg-white p-3 shadow-glass">
              <QRCodeSVG value={LIVE_APP_URL} size={168} bgColor="#ffffff" fgColor="#090b10" level="M" marginSize={3} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
              <QrCode size={14} />
              Scan live app
            </div>
          </div>
        </div>
      </Card>

      {message && <p className="rounded-lg bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-100 lg:col-span-2">{message}</p>}

      <section className="grid content-start gap-5">
        <Card className="p-5">
          <SectionHeader title="Household" eyebrow="Settings" />
          <div className="mt-4 grid gap-4">
            <Field
              label="Household name"
              value={data.household.name}
              onChange={(event) => updateHousehold({ name: event.target.value })}
            />
            <SelectField
              label="Theme"
              value={data.household.theme}
              onChange={(event) => updateHousehold({ theme: event.target.value as ThemePreference })}
            >
              <option value="dark">Dark glass</option>
              <option value="ocean">Ocean</option>
              <option value="ember">Ember</option>
            </SelectField>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <SectionHeader title="Family members" eyebrow="People" />
            <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={addMember}>
              Add
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {data.household.members.map((member, index) => (
              <div key={member.id} className="grid grid-cols-[2.75rem_1fr_auto] items-end gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg font-black text-ink-950" style={{ backgroundColor: member.color }}>
                  {member.avatar}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field
                    label={`Member ${index + 1}`}
                    value={member.name}
                    onChange={(event) => updateMember(member.id, { name: event.target.value })}
                  />
                  <Field label="Role" value={member.role} onChange={(event) => updateMember(member.id, { role: event.target.value })} />
                </div>
                <IconButton label={`Remove ${member.name}`} disabled={data.household.members.length <= 1} onClick={() => removeMember(member)}>
                  <Trash2 size={17} />
                </IconButton>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid content-start gap-5">
        <Card className="p-5">
          <SectionHeader title="Local data" eyebrow="Backup" />
          <p className="mt-2 text-sm leading-6 text-white/58">
            FamilyOS runs from this device. Export a JSON backup before switching browsers or clearing site data.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" icon={<Download size={16} />} onClick={() => downloadJson(data)}>
              Export JSON
            </Button>
            <Button variant="secondary" icon={<Upload size={16} />} onClick={() => fileRef.current?.click()}>
              Import JSON
            </Button>
            <Button
              variant="danger"
              icon={<RefreshCcw size={16} />}
              onClick={() => {
                if (window.confirm('Reset FamilyOS to the polished demo data?')) {
                  resetDemoData();
                  showMessage('Demo data restored');
                }
              }}
            >
              Reset demo data
            </Button>
            <Button
              variant="secondary"
              icon={<Import size={16} />}
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                showMessage('Copied JSON backup');
              }}
            >
              Copy backup
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
        </Card>

        <Card className="p-5">
          <SectionHeader title="About" eyebrow="Roadmap" />
          <div className="mt-4 grid gap-3 text-sm leading-6 text-white/60">
            <p>FamilyOS is a frontend-only PWA for household operating rhythm: money, recurring bills, tasks, goals, and weekly briefings.</p>
            <p>Future roadmap: optional encrypted sync, shared household invites, calendar import, and richer long-range planning.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}

function InstallStep({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-white/10 bg-ink-950/35 p-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-cyan-100">{icon}</div>
      <div>
        <p className="font-bold text-white">{title}</p>
        <p className="mt-1 text-sm leading-5 text-white/58">{body}</p>
      </div>
    </div>
  );
}
