import { Banknote, CalendarClock, CheckSquare, Flag, Newspaper, Plus, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { memberPalette } from '../data/seed';
import { createBlankData, createSeededData } from '../lib/storage';
import type { AppData, Member } from '../types';
import { AppLogo, Button, Card, Field, IconButton, StatusPill } from '../components/ui';

const makeMember = (index: number): Member => ({
  id: `member-${crypto.randomUUID()}`,
  name: '',
  role: index < 2 ? 'Parent' : 'Family',
  color: memberPalette[index % memberPalette.length],
  avatar: '?'
});

const welcomeSignals = [
  { label: 'Money', icon: Banknote },
  { label: 'Bills', icon: CalendarClock },
  { label: 'Tasks', icon: CheckSquare },
  { label: 'Goals', icon: Flag },
  { label: 'Briefing', icon: Newspaper },
  { label: 'PWA', icon: Smartphone }
];

export function Onboarding({
  data,
  setData
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}) {
  const [name, setName] = useState(data.household.name);
  const [members, setMembers] = useState<Member[]>(data.household.members);

  const updateMember = (id: string, patch: Partial<Member>) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === id
          ? {
              ...member,
              ...patch,
              avatar: (patch.name ?? member.name).trim().charAt(0).toUpperCase() || member.avatar
            }
          : member
      )
    );
  };

  const save = () => {
    const cleanMembers = members
      .map((member, index) => ({
        ...member,
        name: member.name.trim() || `Member ${index + 1}`,
        avatar: (member.name.trim().charAt(0) || `${index + 1}`).toUpperCase()
      }))
      .slice(0, 8);
    setData((current) =>
      createBlankData({
        ...current.household,
        name: name.trim() || 'Our Household',
        members: cleanMembers,
        setupComplete: true
      })
    );
  };

  const skip = () => setData(createSeededData(true));

  return (
    <div className="min-h-dvh bg-app-radial px-4 py-[max(1.5rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto grid max-w-3xl gap-5 py-2">
        <div className="text-center">
          <AppLogo className="mx-auto mb-4" size="lg" />
          <div className="flex justify-center">
            <StatusPill tone="cyan">FamilyOS</StatusPill>
          </div>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Run the household. Beautifully.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/68 sm:text-base">
            Not another expense tracker. FamilyOS brings money, bills, tasks, goals, and the weekly family briefing into one practical command center.
          </p>
          <div className="mx-auto mt-4 grid max-w-xl grid-cols-3 gap-2 sm:grid-cols-6">
            {welcomeSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div key={signal.label} className="grid place-items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 py-3">
                  <Icon size={17} className="text-cyan-200" />
                  <span className="text-[11px] font-bold text-white/72">{signal.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="grid gap-5">
            <Field label="Household name" value={name} onChange={(event) => setName(event.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" onClick={save}>
                Start FamilyOS
              </Button>
              <Button type="button" variant="secondary" onClick={skip}>
                Skip with demo household
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Family members</h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={16} />}
                  onClick={() => setMembers((current) => [...current, makeMember(current.length)])}
                >
                  Add
                </Button>
              </div>
              <div className="grid gap-3">
                {members.map((member, index) => (
                  <div key={member.id} className="grid grid-cols-[2.75rem_1fr_auto] items-end gap-3">
                    <div
                      className="grid h-11 w-11 place-items-center rounded-lg font-black text-ink-950"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.avatar}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Field
                        label={`Member ${index + 1}`}
                        value={member.name}
                        onChange={(event) => updateMember(member.id, { name: event.target.value })}
                      />
                      <Field
                        label="Role"
                        value={member.role}
                        onChange={(event) => updateMember(member.id, { role: event.target.value })}
                      />
                    </div>
                    <IconButton
                      label={`Remove ${member.name || `member ${index + 1}`}`}
                      disabled={members.length <= 1}
                      onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))}
                    >
                      <Trash2 size={17} />
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
