import { format } from 'date-fns';
import { Cell, Pie, PieChart, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { Edit3, Plus, ReceiptText, Trash2, TrendingDown, WalletCards } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { AppData, Transaction, TransactionType } from '../types';
import {
  budgetUsage,
  dailyAverageSpend,
  money,
  spendByCategory,
  topCategory,
  totalsForMonth
} from '../lib/calculations';
import { Button, Card, EmptyState, Field, IconButton, Modal, ProgressBar, SectionHeader, SelectField } from '../components/ui';

type MoneyProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

type TransactionForm = {
  id?: string;
  type: TransactionType;
  date: string;
  description: string;
  category: string;
  amount: string;
  memberId: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const expenseCategories = ['Groceries', 'Housing', 'Kids', 'Home', 'Transport', 'Dining', 'Health', 'Utilities', 'Subscriptions', 'Family Fun'];

const toForm = (transaction?: Transaction): TransactionForm => ({
  id: transaction?.id,
  type: transaction?.type ?? 'expense',
  date: transaction?.date ?? todayIso(),
  description: transaction?.description ?? '',
  category: transaction?.category ?? 'Groceries',
  amount: transaction ? String(transaction.amount) : '',
  memberId: transaction?.memberId ?? ''
});

export function MoneyScreen({ data, setData }: MoneyProps) {
  const [editing, setEditing] = useState<TransactionForm | null>(null);
  const totals = totalsForMonth(data.transactions);
  const categories = spendByCategory(data.transactions);
  const top = topCategory(data.transactions);
  const monthBars = useMemo(
    () =>
      data.transactions
        .filter((transaction) => transaction.type === 'expense')
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-12)
        .map((transaction) => ({
          date: format(new Date(transaction.date), 'MMM d'),
          amount: transaction.amount,
          category: transaction.category
        })),
    [data.transactions]
  );

  const saveTransaction = (form: TransactionForm) => {
    const amount = Number(form.amount);
    if (!form.description.trim() || Number.isNaN(amount) || amount <= 0) return;
    const transaction: Transaction = {
      id: form.id ?? `txn-${crypto.randomUUID()}`,
      type: form.type,
      date: form.date,
      description: form.description.trim(),
      category: form.type === 'income' ? 'Income' : form.category,
      amount,
      memberId: form.memberId || undefined
    };
    setData((current) => ({
      ...current,
      transactions: form.id
        ? current.transactions.map((item) => (item.id === form.id ? transaction : item))
        : [transaction, ...current.transactions]
    }));
    setEditing(null);
  };

  const deleteTransaction = (transactionId: string) => {
    setData((current) => ({
      ...current,
      transactions: current.transactions.filter((item) => item.id !== transactionId)
    }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="grid content-start gap-5">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Money</p>
              <h2 className="mt-1 text-3xl font-black text-white">Monthly cashflow</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Income, spending, budget pressure, and category movement for this household month.
              </p>
            </div>
            <Button icon={<Plus size={17} />} onClick={() => setEditing(toForm())}>
              Add
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-white/50">Income</p>
              <p className="mt-1 text-2xl font-black text-emerald-200">{money(totals.income)}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-white/50">Expenses</p>
              <p className="mt-1 text-2xl font-black text-rose-100">{money(totals.expenses)}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-white/50">Net</p>
              <p className={totals.cashflow >= 0 ? 'mt-1 text-2xl font-black text-cyan-100' : 'mt-1 text-2xl font-black text-rose-100'}>
                {money(totals.cashflow)}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-300 text-ink-950">
                <WalletCards size={21} />
              </div>
              <div>
                <p className="text-sm text-white/55">Daily average spend</p>
                <p className="text-2xl font-black text-white">{money(dailyAverageSpend(data.transactions), 2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-amber-300 text-ink-950">
                <TrendingDown size={21} />
              </div>
              <div>
                <p className="text-sm text-white/55">Top category</p>
                <p className="text-2xl font-black text-white">{top.category}</p>
                <p className="text-xs text-white/45">{money(top.amount)} this month</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <SectionHeader title="Budget pressure" eyebrow="Limits" />
          <div className="mt-4 grid gap-4">
            {data.budgets.map((budget) => {
              const usage = budgetUsage(budget, data.transactions);
              return (
                <div key={budget.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-white">{budget.category}</span>
                    <span className="text-white/55">
                      {money(usage.spent)} / {money(budget.limit)}
                    </span>
                  </div>
                  <ProgressBar value={usage.ratio * 100} color={budget.color} />
                </div>
              );
            })}
            {data.budgets.length === 0 && (
              <EmptyState title="No budget lines yet" body="Add your first transaction to begin building the household money picture." icon={<WalletCards size={22} />} />
            )}
          </div>
        </Card>
      </section>

      <section className="grid content-start gap-5">
        <Card className="p-5">
          <SectionHeader title="Category breakdown" eyebrow="Spend mix" />
          {categories.length === 0 ? (
            <EmptyState title="No spending yet" body="Add a transaction to reveal the category mix." icon={<ReceiptText size={22} />} />
          ) : (
            <ChartBox height={288}>
              {(width, height) => (
                <PieChart width={width} height={height}>
                  <Pie data={categories} dataKey="amount" nameKey="category" innerRadius="55%" outerRadius="82%" paddingAngle={3}>
                    {categories.map((entry, index) => (
                      <Cell key={entry.category} fill={data.budgets[index % data.budgets.length]?.color ?? '#22d3ee'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => money(Number(value))}
                    contentStyle={{ background: '#10131b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
                  />
                </PieChart>
              )}
            </ChartBox>
          )}
          <div className="grid gap-2">
            {categories.slice(0, 6).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between gap-3 rounded-lg bg-white/10 p-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-white">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: data.budgets[index % data.budgets.length]?.color ?? '#22d3ee' }}
                  />
                  {category.category}
                </span>
                <span className="text-white/65">{money(category.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Recent transactions" eyebrow="Ledger" />
          {data.transactions.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No transactions yet" body="Add income or an expense to start the household ledger." icon={<ReceiptText size={22} />} />
            </div>
          ) : (
            <ChartBox height={192}>
              {(width, height) => (
                <BarChart width={width} height={height} data={monthBars} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => money(Number(value))}
                    contentStyle={{ background: '#10131b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 2, 2]} fill="#22d3ee" />
                </BarChart>
              )}
            </ChartBox>
          )}
          <div className="mt-4 grid gap-3">
            {data.transactions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
              .map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg bg-white/10 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{transaction.description}</p>
                    <p className="text-xs text-white/45">
                      {format(new Date(transaction.date), 'MMM d')} · {transaction.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={transaction.type === 'income' ? 'font-black text-emerald-200' : 'font-black text-white'}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {money(transaction.amount)}
                    </span>
                    <IconButton label={`Edit ${transaction.description}`} onClick={() => setEditing(toForm(transaction))}>
                      <Edit3 size={16} />
                    </IconButton>
                    <IconButton label={`Delete ${transaction.description}`} onClick={() => deleteTransaction(transaction.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit transaction' : 'Add transaction'} onClose={() => setEditing(null)}>
          <TransactionEditor
            form={editing}
            setForm={setEditing}
            members={data.household.members}
            onSave={saveTransaction}
          />
        </Modal>
      )}
    </div>
  );
}

function ChartBox({
  height,
  children
}: {
  height: number;
  children: (width: number, height: number) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const measure = () => setWidth(Math.max(1, Math.floor(node.getBoundingClientRect().width)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-4 w-full" style={{ height }}>
      {width > 0 ? children(width, height) : null}
    </div>
  );
}

function TransactionEditor({
  form,
  setForm,
  members,
  onSave
}: {
  form: TransactionForm;
  setForm: (form: TransactionForm) => void;
  members: AppData['household']['members'];
  onSave: (form: TransactionForm) => void;
}) {
  const categories = form.type === 'income' ? ['Income'] : expenseCategories;

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as TransactionType })}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </SelectField>
        <Field label="Date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
      </div>
      <Field label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Category" value={form.type === 'income' ? 'Income' : form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectField>
        <Field label="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
      </div>
      <SelectField label="Family member" value={form.memberId} onChange={(event) => setForm({ ...form, memberId: event.target.value })}>
        <option value="">Household</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </SelectField>
      <Button type="submit">{form.id ? 'Save transaction' : 'Add transaction'}</Button>
    </form>
  );
}
