export type ThemePreference = 'dark' | 'ember' | 'ocean';

export type AppMode = 'onboarding' | 'guided-demo' | 'demo' | 'real';

export type AppTab = 'home' | 'money' | 'bills' | 'tasks' | 'goals' | 'briefing' | 'settings';

export interface Member {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
}

export interface Household {
  id: string;
  name: string;
  setupComplete: boolean;
  theme: ThemePreference;
  members: Member[];
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  description: string;
  category: string;
  amount: number;
  memberId?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  color: string;
}

export type BillFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDay: number;
  frequency: BillFrequency;
  autopay: boolean;
  ownerId?: string;
  lastPaidDate?: string;
}

export type TaskFrequency = 'daily' | 'weekly' | 'once';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface FamilyTask {
  id: string;
  title: string;
  category: string;
  assignedTo: string;
  dueDate: string;
  frequency: TaskFrequency;
  priority: TaskPriority;
  completed: boolean;
  streak: number;
}

export interface Goal {
  id: string;
  name: string;
  category: string;
  target: number;
  current: number;
  dueDate: string;
  color: string;
  notes: string;
}

export interface BriefingSection {
  title: string;
  body: string;
  accent: string;
}

export interface BriefingSnapshot {
  id: string;
  generatedAt: string;
  version: number;
  summary: string;
  sections: BriefingSection[];
  nextAction: string;
}

export interface AppData {
  appMode: AppMode;
  household: Household;
  transactions: Transaction[];
  budgets: Budget[];
  bills: RecurringBill[];
  tasks: FamilyTask[];
  goals: Goal[];
  briefing: BriefingSnapshot;
}
