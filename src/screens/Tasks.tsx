import { format } from 'date-fns';
import { Check, CheckCircle2, Edit3, Flame, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppData, FamilyTask, TaskFrequency, TaskPriority } from '../types';
import { completionRate, tasksDue } from '../lib/calculations';
import { Button, Card, EmptyState, Field, IconButton, Modal, ProgressBar, SectionHeader, SelectField } from '../components/ui';

type TasksProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

type TaskFilter = 'today' | 'week' | 'all';

type TaskForm = {
  id?: string;
  title: string;
  category: string;
  assignedTo: string;
  dueDate: string;
  frequency: TaskFrequency;
  priority: TaskPriority;
  streak: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const taskCategories = ['Home', 'School', 'Activities', 'Planning', 'Errands', 'Pets', 'Care'];

const toForm = (task?: FamilyTask, firstMember = ''): TaskForm => ({
  id: task?.id,
  title: task?.title ?? '',
  category: task?.category ?? 'Home',
  assignedTo: task?.assignedTo ?? firstMember,
  dueDate: task?.dueDate ?? todayIso(),
  frequency: task?.frequency ?? 'daily',
  priority: task?.priority ?? 'medium',
  streak: task ? String(task.streak) : '0'
});

export function TasksScreen({ data, setData }: TasksProps) {
  const [filter, setFilter] = useState<TaskFilter>('today');
  const [editing, setEditing] = useState<TaskForm | null>(null);
  const visibleTasks = tasksDue(data.tasks, filter);
  const weekTasks = tasksDue(data.tasks, 'week');
  const completion = completionRate(weekTasks);
  const bestStreak = useMemo(() => Math.max(0, ...data.tasks.map((task) => task.streak)), [data.tasks]);

  const toggleTask = (task: FamilyTask) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id
          ? {
              ...item,
              completed: !item.completed,
              streak: item.completed ? Math.max(0, item.streak - 1) : item.streak + 1
            }
          : item
      )
    }));
  };

  const saveTask = (form: TaskForm) => {
    if (!form.title.trim() || !form.assignedTo) return;
    const task: FamilyTask = {
      id: form.id ?? `task-${crypto.randomUUID()}`,
      title: form.title.trim(),
      category: form.category,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate,
      frequency: form.frequency,
      priority: form.priority,
      completed: data.tasks.find((item) => item.id === form.id)?.completed ?? false,
      streak: Math.max(0, Number(form.streak) || 0)
    };
    setData((current) => ({
      ...current,
      tasks: form.id ? current.tasks.map((item) => (item.id === form.id ? task : item)) : [task, ...current.tasks]
    }));
    setEditing(null);
  };

  const deleteTask = (task: FamilyTask) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setData((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
      <section className="grid content-start gap-5">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Tasks</p>
              <h2 className="mt-1 text-3xl font-black text-white">Chore momentum</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Assign responsibilities, close loops, and keep the week from turning into oral tradition.
              </p>
            </div>
            <Button icon={<Plus size={17} />} onClick={() => setEditing(toForm(undefined, data.household.members[0]?.id))}>
              Add
            </Button>
          </div>
          <div className="mt-5 rounded-lg bg-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/55">Weekly completion</p>
                <p className="text-3xl font-black text-white">{Math.round(completion)}%</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-emerald-300 text-ink-950">
                <CheckCircle2 size={26} />
              </div>
            </div>
            <ProgressBar value={completion} color="#6ee7b7" className="mt-4" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-amber-300 text-ink-950">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-sm text-white/55">Best active streak</p>
              <p className="text-3xl font-black text-white">{bestStreak} days</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Streaks move when tasks are completed or reopened, so the momentum stays tied to real household behavior.
          </p>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Family load" eyebrow="Assignments" />
          <div className="mt-4 grid gap-3">
            {data.household.members.map((member) => {
              const assigned = data.tasks.filter((task) => task.assignedTo === member.id);
              const done = assigned.filter((task) => task.completed).length;
              const rate = assigned.length === 0 ? 0 : (done / assigned.length) * 100;
              return (
                <div key={member.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="grid h-7 w-7 place-items-center rounded-lg text-xs text-ink-950" style={{ backgroundColor: member.color }}>
                        {member.avatar}
                      </span>
                      {member.name}
                    </span>
                    <span className="text-white/50">{done}/{assigned.length}</span>
                  </div>
                  <ProgressBar value={rate} color={member.color} />
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid content-start gap-5">
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader title="Responsibility list" eyebrow="Queue" />
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-white/10 p-1">
              {(['today', 'week', 'all'] as TaskFilter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={filter === item ? 'rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-ink-950' : 'rounded-lg px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10'}
                >
                  {item === 'today' ? 'Today' : item === 'week' ? 'Week' : 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {visibleTasks.length === 0 ? (
              <EmptyState title="Nothing in this view" body="Add a task or switch filters to see the rest of the household load." icon={<Check size={22} />} />
            ) : (
              visibleTasks.map((task) => {
                const member = data.household.members.find((item) => item.id === task.assignedTo);
                return (
                  <div
                    key={task.id}
                    className={task.completed ? 'grid gap-3 rounded-lg border border-emerald-200/20 bg-emerald-300/10 p-4 sm:grid-cols-[auto_1fr_auto]' : 'grid gap-3 rounded-lg bg-white/10 p-4 sm:grid-cols-[auto_1fr_auto]'}
                  >
                    <button
                      aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                      onClick={() => toggleTask(task)}
                      className={task.completed ? 'grid h-11 w-11 place-items-center rounded-lg bg-emerald-300 text-ink-950' : 'grid h-11 w-11 place-items-center rounded-lg border border-white/20 text-white/45 hover:bg-white/10'}
                    >
                      <Check size={20} />
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={task.completed ? 'font-bold text-white/55 line-through' : 'font-bold text-white'}>{task.title}</p>
                        <span className={task.priority === 'high' ? 'rounded-lg bg-rose-300/20 px-2 py-1 text-xs text-rose-100' : 'rounded-lg bg-white/10 px-2 py-1 text-xs text-white/55'}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/45">
                        {member?.name ?? 'Unassigned'} · {task.category} · {format(new Date(task.dueDate), 'MMM d')} · {task.frequency}
                      </p>
                      <p className="mt-2 text-xs text-amber-100/70">{task.streak} day streak</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconButton label={`Edit ${task.title}`} onClick={() => setEditing(toForm(task, data.household.members[0]?.id))}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton label={`Delete ${task.title}`} onClick={() => deleteTask(task)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit task' : 'Add task'} onClose={() => setEditing(null)}>
          <TaskEditor form={editing} setForm={setEditing} data={data} onSave={saveTask} />
        </Modal>
      )}
    </div>
  );
}

function TaskEditor({
  form,
  setForm,
  data,
  onSave
}: {
  form: TaskForm;
  setForm: (form: TaskForm) => void;
  data: AppData;
  onSave: (form: TaskForm) => void;
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <Field label="Task" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Assigned to" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}>
          {data.household.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </SelectField>
        <Field label="Due date" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {taskCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectField>
        <SelectField label="Frequency" value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value as TaskFrequency })}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="once">Once</option>
        </SelectField>
        <SelectField label="Priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </SelectField>
      </div>
      <Field label="Current streak" type="number" min="0" value={form.streak} onChange={(event) => setForm({ ...form, streak: event.target.value })} />
      <Button type="submit">{form.id ? 'Save task' : 'Add task'}</Button>
    </form>
  );
}
