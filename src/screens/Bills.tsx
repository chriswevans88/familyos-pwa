import { format } from 'date-fns';
import { CalendarClock, Edit3, Plus, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import type { AppData, BillFrequency, RecurringBill } from '../types';
import { dueLabel, money, nextBillDueDate, upcomingBills } from '../lib/calculations';
import { Button, Card, EmptyState, Field, IconButton, Modal, SectionHeader, SelectField } from '../components/ui';

type BillsProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

type BillForm = {
  id?: string;
  name: string;
  amount: string;
  category: string;
  dueDay: string;
  frequency: BillFrequency;
  autopay: boolean;
  ownerId: string;
};

const billCategories = ['Housing', 'Utilities', 'Kids', 'Transport', 'Home', 'Subscriptions', 'Insurance', 'Health'];
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toForm = (bill?: RecurringBill): BillForm => ({
  id: bill?.id,
  name: bill?.name ?? '',
  amount: bill ? String(bill.amount) : '',
  category: bill?.category ?? 'Utilities',
  dueDay: bill ? String(bill.dueDay) : '15',
  frequency: bill?.frequency ?? 'monthly',
  autopay: bill?.autopay ?? true,
  ownerId: bill?.ownerId ?? ''
});

export function BillsScreen({ data, setData }: BillsProps) {
  const [editing, setEditing] = useState<BillForm | null>(null);
  const dueSoon = upcomingBills(data.bills, 10);
  const monthlyTotal = data.bills
    .filter((bill) => bill.frequency === 'monthly')
    .reduce((total, bill) => total + bill.amount, 0);
  const autopayCount = data.bills.filter((bill) => bill.autopay).length;

  const saveBill = (form: BillForm) => {
    const amount = Number(form.amount);
    const dueDay = Number(form.dueDay);
    if (!form.name.trim() || Number.isNaN(amount) || amount <= 0 || Number.isNaN(dueDay)) return;
    const bill: RecurringBill = {
      id: form.id ?? `bill-${crypto.randomUUID()}`,
      name: form.name.trim(),
      amount,
      category: form.category,
      dueDay,
      frequency: form.frequency,
      autopay: form.autopay,
      ownerId: form.ownerId || undefined
    };
    setData((current) => ({
      ...current,
      bills: form.id ? current.bills.map((item) => (item.id === form.id ? bill : item)) : [...current.bills, bill]
    }));
    setEditing(null);
  };

  const deleteBill = (billId: string) => {
    setData((current) => ({ ...current, bills: current.bills.filter((item) => item.id !== billId) }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="grid content-start gap-5">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Bills</p>
              <h2 className="mt-1 text-3xl font-black text-white">Recurring command</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Track due dates, autopay coverage, owners, and the next payment window.
              </p>
            </div>
            <Button icon={<Plus size={17} />} onClick={() => setEditing(toForm())}>
              Add
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-white/50">Monthly base</p>
              <p className="mt-1 text-2xl font-black text-white">{money(monthlyTotal)}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-white/50">Autopay</p>
              <p className="mt-1 text-2xl font-black text-emerald-200">{autopayCount}/{data.bills.length}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-white/50">Due soon</p>
              <p className="mt-1 text-2xl font-black text-amber-100">{dueSoon.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Due soon" eyebrow="Next 10 days" />
          <div className="mt-4 grid gap-3">
            {dueSoon.length === 0 ? (
              <EmptyState title="No pressure window" body="No recurring bills are due in the next ten days." icon={<ShieldCheck size={22} />} />
            ) : (
              dueSoon.map((bill) => (
                <div key={bill.id} className="rounded-lg border border-amber-200/20 bg-amber-300/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{bill.name}</p>
                      <p className="text-sm text-amber-100/70">{dueLabel(bill.dueDate)}</p>
                    </div>
                    <p className="text-xl font-black text-white">{money(bill.amount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <section className="grid content-start gap-5">
        <Card className="p-5">
          <SectionHeader title="Recurring payments" eyebrow="Ledger" />
          <div className="mt-4 grid gap-3">
            {data.bills.length === 0 ? (
              <EmptyState title="No recurring bills yet" body="Add the first rent, mortgage, utility, or subscription to turn on payment radar." icon={<CalendarClock size={22} />} />
            ) : (
              data.bills
              .slice()
              .sort((a, b) => nextBillDueDate(a).getTime() - nextBillDueDate(b).getTime())
              .map((bill) => {
                const dueDate = nextBillDueDate(bill);
                const owner = data.household.members.find((member) => member.id === bill.ownerId);
                return (
                  <div key={bill.id} className="grid gap-3 rounded-lg bg-white/10 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CalendarClock size={17} className="text-cyan-200" />
                        <p className="truncate font-bold text-white">{bill.name}</p>
                      </div>
                      <p className="mt-1 text-sm text-white/50">
                        {bill.category} · {format(dueDate, 'MMM d')} · {bill.frequency}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className={bill.autopay ? 'rounded-lg bg-emerald-300/20 px-2 py-1 text-emerald-100' : 'rounded-lg bg-amber-300/20 px-2 py-1 text-amber-100'}>
                          {bill.autopay ? 'Autopay on' : 'Manual pay'}
                        </span>
                        {owner && (
                          <span className="rounded-lg bg-white/10 px-2 py-1 text-white/60">Owner: {owner.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <p className="text-xl font-black text-white">{money(bill.amount)}</p>
                      <IconButton label={`Edit ${bill.name}`} onClick={() => setEditing(toForm(bill))}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton label={`Delete ${bill.name}`} onClick={() => deleteBill(bill.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-ink-950">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Household rule</p>
              <h3 className="font-bold text-white">Manual bills need an owner</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/60">
            FamilyOS highlights manual recurring payments because they are the easiest place for a busy week to leak.
          </p>
        </Card>
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit bill' : 'Add bill'} onClose={() => setEditing(null)}>
          <BillEditor form={editing} setForm={setEditing} data={data} onSave={saveBill} />
        </Modal>
      )}
    </div>
  );
}

function BillEditor({
  form,
  setForm,
  data,
  onSave
}: {
  form: BillForm;
  setForm: (form: BillForm) => void;
  data: AppData;
  onSave: (form: BillForm) => void;
}) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <Field label="Bill name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        <SelectField label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {billCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Frequency" value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value as BillFrequency, dueDay: event.target.value === 'weekly' ? '5' : '15' })}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
        </SelectField>
        {form.frequency === 'weekly' ? (
          <SelectField label="Weekday" value={form.dueDay} onChange={(event) => setForm({ ...form, dueDay: event.target.value })}>
            {weekdays.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </SelectField>
        ) : (
          <Field label="Day of month" type="number" min="1" max="31" value={form.dueDay} onChange={(event) => setForm({ ...form, dueDay: event.target.value })} />
        )}
      </div>
      <SelectField label="Owner" value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })}>
        <option value="">Unassigned</option>
        {data.household.members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </SelectField>
      <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/10 p-3 text-sm text-white">
        <span>
          <span className="block font-semibold">Autopay enabled</span>
          <span className="text-white/50">Turn off when someone needs to manually confirm payment.</span>
        </span>
        <input
          type="checkbox"
          checked={form.autopay}
          onChange={(event) => setForm({ ...form, autopay: event.target.checked })}
          className="h-5 w-5 accent-cyan-300"
        />
      </label>
      <Button type="submit">{form.id ? 'Save bill' : 'Add bill'}</Button>
    </form>
  );
}
