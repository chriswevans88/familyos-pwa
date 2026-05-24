import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  isSameMonth,
  max,
} from 'date-fns';
import type { AppData, Budget, FamilyTask, Goal, RecurringBill, Transaction } from '../types';

export const money = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits
  }).format(value);

export const percent = (value: number) => `${Math.round(value)}%`;

export function currentMonthTransactions(transactions: Transaction[]) {
  const now = new Date();
  return transactions.filter((transaction) => isSameMonth(new Date(transaction.date), now));
}

export function totalsForMonth(transactions: Transaction[]) {
  const monthly = currentMonthTransactions(transactions);
  const income = monthly
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = monthly
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
  return { income, expenses, cashflow: income - expenses };
}

export function spendByCategory(transactions: Transaction[]) {
  const map = new Map<string, number>();
  currentMonthTransactions(transactions)
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      map.set(transaction.category, (map.get(transaction.category) ?? 0) + transaction.amount);
    });
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function budgetUsage(budget: Budget, transactions: Transaction[]) {
  const spent =
    spendByCategory(transactions).find((item) => item.category === budget.category)?.amount ?? 0;
  const ratio = budget.limit === 0 ? 0 : spent / budget.limit;
  return { spent, ratio, remaining: Math.max(0, budget.limit - spent) };
}

export function nextBillDueDate(bill: RecurringBill, from = new Date()) {
  if (bill.frequency === 'weekly') {
    const next = addDays(from, Math.max(0, (bill.dueDay - from.getDay() + 7) % 7));
    return next;
  }
  if (bill.frequency === 'yearly') {
    const current = new Date(from.getFullYear(), 11, Math.min(bill.dueDay, 31));
    return differenceInCalendarDays(current, from) < 0
      ? new Date(from.getFullYear() + 1, 11, Math.min(bill.dueDay, 31))
      : current;
  }
  const lastDay = endOfMonth(from).getDate();
  const current = new Date(from.getFullYear(), from.getMonth(), Math.min(bill.dueDay, lastDay));
  if (differenceInCalendarDays(current, from) >= 0) return current;
  const nextMonth = addMonths(from, 1);
  return new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth(),
    Math.min(bill.dueDay, endOfMonth(nextMonth).getDate())
  );
}

export function upcomingBills(bills: RecurringBill[], days = 14) {
  const now = new Date();
  return bills
    .map((bill) => {
      const dueDate = nextBillDueDate(bill, now);
      return { ...bill, dueDate, daysAway: differenceInCalendarDays(dueDate, now) };
    })
    .filter((bill) => bill.daysAway <= days)
    .sort((a, b) => a.daysAway - b.daysAway);
}

export function dueLabel(date: Date) {
  const days = differenceInCalendarDays(date, new Date());
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)}d late`;
  return `${format(date, 'MMM d')} · ${days}d`;
}

export function tasksDue(tasks: FamilyTask[], mode: 'today' | 'week' | 'all') {
  const now = new Date();
  const weekEnd = addDays(now, 7);
  return tasks
    .filter((task) => {
      const due = new Date(task.dueDate);
      if (mode === 'today') return differenceInCalendarDays(due, now) <= 0;
      if (mode === 'week') return !isAfter(due, weekEnd);
      return true;
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate));
}

export function completionRate(tasks: FamilyTask[]) {
  if (tasks.length === 0) return 0;
  return (tasks.filter((task) => task.completed).length / tasks.length) * 100;
}

export function goalProgress(goal: Goal) {
  return goal.target === 0 ? 0 : Math.min(100, (goal.current / goal.target) * 100);
}

export function dataHealthScore(data: AppData) {
  const { income, expenses } = totalsForMonth(data.transactions);
  const budgetRatios = data.budgets.map((budget) => budgetUsage(budget, data.transactions).ratio);
  const averageBudgetRatio =
    budgetRatios.length === 0
      ? 0
      : budgetRatios.reduce((total, ratio) => total + Math.min(1.4, ratio), 0) / budgetRatios.length;
  const cashflowScore = income === 0 ? 55 : Math.max(0, Math.min(100, ((income - expenses) / income) * 100 + 58));
  const taskScore = completionRate(tasksDue(data.tasks, 'week'));
  const goalScore =
    data.goals.length === 0
      ? 0
      : data.goals.reduce((total, goal) => total + goalProgress(goal), 0) / data.goals.length;
  return Math.round(cashflowScore * 0.42 + (100 - averageBudgetRatio * 100) * 0.25 + taskScore * 0.18 + goalScore * 0.15);
}

export function dailyAverageSpend(transactions: Transaction[]) {
  const today = new Date().getDate();
  const expenses = totalsForMonth(transactions).expenses;
  return expenses / Math.max(1, today);
}

export function topCategory(transactions: Transaction[]) {
  return spendByCategory(transactions)[0] ?? { category: 'None yet', amount: 0 };
}

export function nextGoalDeadline(goals: Goal[]) {
  return goals
    .filter((goal) => goal.current < goal.target)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
}

export function latestTransactionDate(transactions: Transaction[]) {
  if (transactions.length === 0) return new Date();
  return max(transactions.map((transaction) => new Date(transaction.date)));
}
