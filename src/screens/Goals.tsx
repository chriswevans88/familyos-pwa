import { format } from 'date-fns';
import { Coins, Edit3, Flag, Plus, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AppData, Goal } from '../types';
import { goalProgress, money } from '../lib/calculations';
import { Button, Card, EmptyState, Field, IconButton, Modal, ProgressBar, SectionHeader, SelectField, TextArea } from '../components/ui';

type GoalsProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

type GoalForm = {
  id?: string;
  name: string;
  category: string;
  target: string;
  current: string;
  dueDate: string;
  color: string;
  notes: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const goalColors = ['#22d3ee', '#6ee7b7', '#f5c542', '#fb7185', '#a78bfa', '#f97316'];
const goalCategories = ['Vacation', 'Security', 'Home', 'Seasonal', 'Education', 'Celebration', 'Wellness'];

const toForm = (goal?: Goal): GoalForm => ({
  id: goal?.id,
  name: goal?.name ?? '',
  category: goal?.category ?? 'Vacation',
  target: goal ? String(goal.target) : '',
  current: goal ? String(goal.current) : '0',
  dueDate: goal?.dueDate ?? todayIso(),
  color: goal?.color ?? goalColors[0],
  notes: goal?.notes ?? ''
});

export function GoalsScreen({ data, setData }: GoalsProps) {
  const [editing, setEditing] = useState<GoalForm | null>(null);
  const [contribution, setContribution] = useState<{ goal: Goal; amount: string } | null>(null);
  const totalTarget = data.goals.reduce((total, goal) => total + goal.target, 0);
  const totalSaved = data.goals.reduce((total, goal) => total + goal.current, 0);
  const overallProgress = totalTarget === 0 ? 0 : (totalSaved / totalTarget) * 100;

  const saveGoal = (form: GoalForm) => {
    const target = Number(form.target);
    const current = Number(form.current);
    if (!form.name.trim() || Number.isNaN(target) || target <= 0 || Number.isNaN(current)) return;
    const goal: Goal = {
      id: form.id ?? `goal-${crypto.randomUUID()}`,
      name: form.name.trim(),
      category: form.category,
      target,
      current: Math.max(0, current),
      dueDate: form.dueDate,
      color: form.color,
      notes: form.notes.trim()
    };
    setData((currentData) => ({
      ...currentData,
      goals: form.id ? currentData.goals.map((item) => (item.id === form.id ? goal : item)) : [goal, ...currentData.goals]
    }));
    setEditing(null);
  };

  const deleteGoal = (goalId: string) => {
    setData((current) => ({ ...current, goals: current.goals.filter((item) => item.id !== goalId) }));
    if (contribution?.goal.id === goalId) setContribution(null);
  };

  const addContribution = () => {
    if (!contribution) return;
    const amount = Number(contribution.amount);
    if (Number.isNaN(amount) || amount <= 0) return;
    setData((current) => ({
      ...current,
      goals: current.goals.map((goal) =>
        goal.id === contribution.goal.id ? { ...goal, current: Math.min(goal.target, goal.current + amount) } : goal
      )
    }));
    setContribution(null);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
      <section className="grid content-start gap-5">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Goals</p>
              <h2 className="mt-1 text-3xl font-black text-white">Family ambition board</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Give surplus dollars a destination before ordinary weeks absorb them.
              </p>
            </div>
            <Button icon={<Plus size={17} />} onClick={() => setEditing(toForm())}>
              Add
            </Button>
          </div>
          <div className="mt-5 rounded-lg bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/55">Total progress</p>
                <p className="text-3xl font-black text-white">{money(totalSaved)} / {money(totalTarget)}</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-cyan-300 text-ink-950">
                <Target size={25} />
              </div>
            </div>
            <ProgressBar value={overallProgress} color="#22d3ee" className="mt-4" />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Next best contribution" eyebrow="Recommendation" />
          {data.goals.length === 0 ? (
            <p className="mt-4 text-sm text-white/58">Create a goal and FamilyOS will surface the strongest next move.</p>
          ) : (
            <div className="mt-4">
              {data.goals
                .slice()
                .sort((a, b) => goalProgress(a) - goalProgress(b))[0] && (
                <GoalRecommendation
                  goal={data.goals.slice().sort((a, b) => goalProgress(a) - goalProgress(b))[0]}
                  onContribute={(goal, amount) => setContribution({ goal, amount: String(amount) })}
                />
              )}
            </div>
          )}
        </Card>
      </section>

      <section className="grid content-start gap-5">
        <Card className="p-5">
          <SectionHeader title="Goal portfolio" eyebrow="Progress" />
          <div className="mt-4 grid gap-3">
            {data.goals.length === 0 ? (
              <EmptyState title="No active goals" body="Create the first shared household goal to start tracking progress." icon={<Flag size={22} />} />
            ) : (
              data.goals.map((goal) => (
                <div key={goal.id} className="rounded-lg bg-white/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: goal.color }} />
                        <h3 className="truncate font-bold text-white">{goal.name}</h3>
                      </div>
                      <p className="mt-1 text-sm text-white/45">
                        {goal.category} · due {format(new Date(goal.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className="text-xl font-black text-white">{Math.round(goalProgress(goal))}%</p>
                  </div>
                  <ProgressBar value={goalProgress(goal)} color={goal.color} className="mt-4" />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-white/58">
                      {money(goal.current)} saved · {money(Math.max(0, goal.target - goal.current))} left
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" icon={<Coins size={15} />} onClick={() => setContribution({ goal, amount: '' })}>
                        Contribute
                      </Button>
                      <IconButton label={`Edit ${goal.name}`} onClick={() => setEditing(toForm(goal))}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton label={`Delete ${goal.name}`} onClick={() => deleteGoal(goal.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                  {goal.notes && <p className="mt-3 rounded-lg bg-black/20 p-3 text-sm leading-6 text-white/58">{goal.notes}</p>}
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit goal' : 'Add goal'} onClose={() => setEditing(null)}>
          <GoalEditor form={editing} setForm={setEditing} onSave={saveGoal} />
        </Modal>
      )}

      {contribution && (
        <Modal title={`Contribute to ${contribution.goal.name}`} onClose={() => setContribution(null)}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              addContribution();
            }}
          >
            <Field
              label="Contribution amount"
              type="number"
              min="0"
              step="0.01"
              value={contribution.amount}
              onChange={(event) => setContribution({ ...contribution, amount: event.target.value })}
            />
            <Button type="submit" icon={<Coins size={16} />}>
              Add contribution
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function GoalRecommendation({ goal, onContribute }: { goal: Goal; onContribute: (goal: Goal, amount: number) => void }) {
  const remaining = Math.max(0, goal.target - goal.current);
  const suggested = Math.min(remaining, Math.max(50, Math.round(remaining * 0.08)));
  return (
    <div className="rounded-lg bg-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg text-ink-950" style={{ backgroundColor: goal.color }}>
          <Flag size={20} />
        </div>
        <div>
          <p className="font-bold text-white">{goal.name}</p>
          <p className="text-sm text-white/50">Suggested move: {money(suggested)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/58">
        This goal has the most room to improve. A small focused transfer keeps the family story moving.
      </p>
      <Button className="mt-4 w-full" variant="secondary" onClick={() => onContribute(goal, suggested)}>
        Add suggested contribution
      </Button>
    </div>
  );
}

function GoalEditor({
  form,
  setForm,
  onSave
}: {
  form: GoalForm;
  setForm: (form: GoalForm) => void;
  onSave: (form: GoalForm) => void;
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <Field label="Goal name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {goalCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectField>
        <Field label="Due date" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target" type="number" min="0" step="0.01" value={form.target} onChange={(event) => setForm({ ...form, target: event.target.value })} />
        <Field label="Current saved" type="number" min="0" step="0.01" value={form.current} onChange={(event) => setForm({ ...form, current: event.target.value })} />
      </div>
      <div>
        <p className="mb-2 text-sm text-white/70">Color</p>
        <div className="flex flex-wrap gap-2">
          {goalColors.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Use goal color ${color}`}
              onClick={() => setForm({ ...form, color })}
              className={form.color === color ? 'h-10 w-10 rounded-lg border-2 border-white' : 'h-10 w-10 rounded-lg border border-white/20'}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <TextArea label="Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
      <Button type="submit">{form.id ? 'Save goal' : 'Add goal'}</Button>
    </form>
  );
}
