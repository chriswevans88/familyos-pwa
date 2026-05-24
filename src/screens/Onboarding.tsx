import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CalendarClock, CheckCircle2, CheckSquare, Flag, Home, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { memberPalette } from '../data/seed';
import { createBlankData } from '../lib/storage';
import type { AppData, AppTab, Member } from '../types';
import { AppLogo, Button, Card, Field, IconButton, StatusPill } from '../components/ui';

type OnboardingView = 'welcome' | 'household' | 'members' | 'success';

type OnboardingProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  initialView?: OnboardingView;
  onTakeGuidedDemo: () => void;
  onExploreDemo: () => void;
  onHouseholdCreated: () => void;
  onFinishSetup: (tab: AppTab) => void;
};

const makeMember = (index: number): Member => ({
  id: `member-${crypto.randomUUID()}`,
  name: '',
  role: index < 2 ? 'Parent' : 'Family',
  color: memberPalette[index % memberPalette.length],
  avatar: '?'
});

export function Onboarding({
  data,
  setData,
  initialView = 'welcome',
  onTakeGuidedDemo,
  onExploreDemo,
  onHouseholdCreated,
  onFinishSetup
}: OnboardingProps) {
  const [view, setView] = useState<OnboardingView>(initialView);
  const [householdName, setHouseholdName] = useState(data.household.name === 'Our Household' ? '' : data.household.name);
  const [members, setMembers] = useState<Member[]>(
    data.household.members.length > 0 ? data.household.members.slice(0, 2) : [makeMember(0), makeMember(1)]
  );

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

  const cleanMembers = () => {
    const namedMembers = members
      .map((member, index) => {
        const name = member.name.trim();
        return {
          ...member,
          name,
          role: member.role.trim() || (index < 2 ? 'Parent' : 'Family'),
          avatar: (name.charAt(0) || `${index + 1}`).toUpperCase()
        };
      })
      .filter((member) => member.name)
      .slice(0, 8);

    return namedMembers.length > 0
      ? namedMembers
      : [
          {
            ...makeMember(0),
            name: 'Member 1',
            role: 'Family',
            avatar: '1'
          }
        ];
  };

  const createHousehold = () => {
    setData((current) =>
      createBlankData(
        {
          ...current.household,
          name: householdName.trim() || 'Our Household',
          members: cleanMembers(),
          setupComplete: true
        },
        'real'
      )
    );
    onHouseholdCreated();
  };

  return (
    <OnboardingShell>
      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <WelcomeChoice
            key="welcome"
            onTakeGuidedDemo={onTakeGuidedDemo}
            onExploreDemo={onExploreDemo}
            onSetup={() => setView('household')}
          />
        )}
        {view === 'household' && (
          <HouseholdNameStep
            key="household"
            householdName={householdName}
            setHouseholdName={setHouseholdName}
            onBack={() => setView('welcome')}
            onContinue={() => setView('members')}
          />
        )}
        {view === 'members' && (
          <MembersStep
            key="members"
            members={members}
            setMembers={setMembers}
            updateMember={updateMember}
            onBack={() => setView('household')}
            onCreate={createHousehold}
          />
        )}
        {view === 'success' && (
          <SetupSuccess
            key="success"
            householdName={data.household.name}
            onFinishSetup={onFinishSetup}
          />
        )}
      </AnimatePresence>
    </OnboardingShell>
  );
}

function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-app-radial px-4 py-[max(1.25rem,env(safe-area-inset-top))] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-2xl place-items-center">
        {children}
      </div>
    </div>
  );
}

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <Card shine className="p-5 sm:p-7">
        {children}
      </Card>
    </motion.div>
  );
}

function WelcomeChoice({
  onTakeGuidedDemo,
  onExploreDemo,
  onSetup
}: {
  onTakeGuidedDemo: () => void;
  onExploreDemo: () => void;
  onSetup: () => void;
}) {
  return (
    <StepCard>
      <div className="text-center">
        <AppLogo className="mx-auto mb-5" size="lg" />
        <StatusPill tone="cyan">FamilyOS</StatusPill>
        <h1 className="mx-auto mt-4 max-w-xl text-4xl font-black leading-[0.98] text-white sm:text-6xl">
          Run the household. Beautifully.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-white/66">
          A simple command center for money, bills, chores, goals, and weekly family planning.
        </p>
      </div>

      <div className="mt-7 grid gap-3">
        <Button className="w-full" icon={<Sparkles size={17} />} onClick={onTakeGuidedDemo}>
          Take guided demo
        </Button>
        <Button className="w-full" variant="secondary" icon={<Home size={17} />} onClick={onSetup}>
          Set up my household
        </Button>
        <Button className="w-full text-white/62" variant="ghost" onClick={onExploreDemo}>
          Explore sample household
        </Button>
      </div>

      <p className="mx-auto mt-5 max-w-md text-center text-xs leading-5 text-white/45">
        Demo data is sample-only. You can start fresh anytime from Settings.
      </p>
    </StepCard>
  );
}

function HouseholdNameStep({
  householdName,
  setHouseholdName,
  onBack,
  onContinue
}: {
  householdName: string;
  setHouseholdName: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <StepCard>
      <button className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/58 hover:text-white" onClick={onBack}>
        <ArrowLeft size={16} />
        Back
      </button>
      <StatusPill tone="cyan">Create your household</StatusPill>
      <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">What should we call your household?</h1>
      <p className="mt-3 text-sm leading-6 text-white/62">
        This is the name FamilyOS will use across your dashboard, weekly briefing, and local backup.
      </p>
      <div className="mt-6">
        <Field
          label="Household name"
          placeholder="The Evans Household"
          value={householdName}
          onChange={(event) => setHouseholdName(event.target.value)}
        />
      </div>
      <Button className="mt-5 w-full" onClick={onContinue}>
        Continue
      </Button>
    </StepCard>
  );
}

function MembersStep({
  members,
  setMembers,
  updateMember,
  onBack,
  onCreate
}: {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  updateMember: (id: string, patch: Partial<Member>) => void;
  onBack: () => void;
  onCreate: () => void;
}) {
  return (
    <StepCard>
      <button className="mb-5 flex items-center gap-2 text-sm font-semibold text-white/58 hover:text-white" onClick={onBack}>
        <ArrowLeft size={16} />
        Back
      </button>
      <StatusPill tone="green">People</StatusPill>
      <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">Who&apos;s part of this household?</h1>
      <p className="mt-3 text-sm leading-6 text-white/62">
        Add people now or later. Names help assign chores, bills, and shared responsibilities.
      </p>

      <div className="mt-6 grid gap-3">
        {members.map((member, index) => (
          <div key={member.id} className="grid grid-cols-[2.75rem_1fr_auto] items-end gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg font-black text-ink-950" style={{ backgroundColor: member.color }}>
              {member.avatar}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field
                label={`Member ${index + 1}`}
                placeholder={index === 0 ? 'Your name' : 'Name'}
                value={member.name}
                onChange={(event) => updateMember(member.id, { name: event.target.value })}
              />
              <Field label="Role" value={member.role} onChange={(event) => updateMember(member.id, { role: event.target.value })} />
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          onClick={() => setMembers((current) => [...current, makeMember(current.length)])}
        >
          Add member
        </Button>
        <Button variant="ghost" onClick={onCreate}>
          I&apos;ll add people later
        </Button>
      </div>
      <Button className="mt-3 w-full" icon={<CheckCircle2 size={17} />} onClick={onCreate}>
        Create FamilyOS
      </Button>
    </StepCard>
  );
}

function SetupSuccess({
  householdName,
  onFinishSetup
}: {
  householdName: string;
  onFinishSetup: (tab: AppTab) => void;
}) {
  return (
    <StepCard>
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-emerald-300 text-ink-950 shadow-glow">
          <CheckCircle2 size={30} />
        </div>
        <StatusPill className="mt-5" tone="green">Blank household ready</StatusPill>
        <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">{householdName} is ready.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/62">
          FamilyOS starts blank for your household. Add the first bill, task, or goal when you&apos;re ready.
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" icon={<CalendarClock size={16} />} onClick={() => onFinishSetup('bills')}>
          Add first bill
        </Button>
        <Button variant="secondary" icon={<CheckSquare size={16} />} onClick={() => onFinishSetup('tasks')}>
          Add first task
        </Button>
        <Button variant="secondary" icon={<Flag size={16} />} onClick={() => onFinishSetup('goals')}>
          Add first goal
        </Button>
        <Button icon={<Home size={16} />} onClick={() => onFinishSetup('home')}>
          Go to Home
        </Button>
      </div>
    </StepCard>
  );
}
