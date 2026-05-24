import { Download, Home, Import, MonitorDown, Plus, RefreshCcw, Smartphone, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { memberPalette } from '../data/seed';
import { downloadJson, parseImportedData, withFreshBriefing } from '../lib/storage';
import type { AppData, Member, ThemePreference } from '../types';
import { Button, Card, Field, IconButton, SectionHeader, SelectField } from '../components/ui';

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

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
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
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-cyan-300 text-ink-950">
              <Smartphone size={23} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Install FamilyOS</p>
              <h2 className="mt-1 text-2xl font-black text-white">Make it feel native</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                On iPhone, open Share and choose Add to Home Screen. On Android or desktop Chrome, use Install when the browser offers it.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button disabled={!canInstall || installed} onClick={handleInstall} icon={<MonitorDown size={16} />}>
              {installed ? 'Installed' : canInstall ? 'Install FamilyOS' : 'Install when available'}
            </Button>
            <Button variant="secondary" icon={<Home size={16} />} onClick={() => showMessage('Tip saved here: use Share, then Add to Home Screen on iPhone.')}>
              iPhone tip
            </Button>
          </div>
        </Card>

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
          {message && <p className="mt-4 rounded-lg bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-100">{message}</p>}
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
