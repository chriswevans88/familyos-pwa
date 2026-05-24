import { createBlankHousehold, createDemoData } from '../data/seed';
import { generateWeeklyBriefing } from './briefing';
import type {
  AppData,
  BillFrequency,
  FamilyTask,
  Goal,
  Household,
  Member,
  RecurringBill,
  TaskFrequency,
  TaskPriority,
  ThemePreference,
  Transaction,
  TransactionType
} from '../types';

export const STORAGE_KEY = 'familyos:data:v1';

export function withFreshBriefing(data: AppData, version = data.briefing.version): AppData {
  return {
    ...data,
    briefing: generateWeeklyBriefing(data, version)
  };
}

export function createSeededData(setupComplete = true): AppData {
  return withFreshBriefing(createDemoData(setupComplete), 1);
}

export function createBlankData(household: Partial<Household> = {}): AppData {
  const baseHousehold = createBlankHousehold();
  return withFreshBriefing(
    {
      household: {
        ...baseHousehold,
        ...household,
        members: household.members && household.members.length > 0 ? household.members : baseHousehold.members
      },
      transactions: [],
      budgets: [],
      bills: [],
      tasks: [],
      goals: [],
      briefing: {
        id: 'briefing-blank',
        generatedAt: new Date().toISOString(),
        version: 1,
        summary: '',
        sections: [],
        nextAction: ''
      }
    },
    1
  );
}

export function loadAppData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createBlankData({ setupComplete: false });
    return normalizeAppData(JSON.parse(raw), createDemoData(true));
  } catch {
    return createSeededData(true);
  }
}

export function saveAppData(data: AppData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function downloadJson(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `familyos-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportedData(text: string): AppData {
  const parsed = JSON.parse(text) as unknown;
  if (!looksLikeFamilyOsExport(parsed)) {
    throw new Error('This file does not look like a FamilyOS export.');
  }
  const normalized = normalizeAppData(parsed, createDemoData(true));
  return withFreshBriefing(normalized, (normalized.briefing?.version ?? 0) + 1);
}

function normalizeAppData(input: unknown, fallback: AppData): AppData {
  if (!isRecord(input)) return withFreshBriefing(fallback, fallback.briefing.version);

  const household = normalizeHousehold(input.household, fallback.household);
  const memberIds = new Set(household.members.map((member) => member.id));
  const fallbackMemberId = household.members[0]?.id;

  const data: AppData = {
    household,
    transactions: normalizeArray(input.transactions, fallback.transactions, normalizeTransaction),
    budgets: normalizeArray(input.budgets, fallback.budgets, normalizeBudget),
    bills: normalizeArray(input.bills, fallback.bills, (value, fallbackBill) =>
      normalizeBill(value, fallbackBill, memberIds, fallbackMemberId)
    ),
    tasks: normalizeArray(input.tasks, fallback.tasks, (value, fallbackTask) =>
      normalizeTask(value, fallbackTask, memberIds, fallbackMemberId)
    ),
    goals: normalizeArray(input.goals, fallback.goals, normalizeGoal),
    briefing: fallback.briefing
  };

  const version = isRecord(input.briefing) ? positiveNumber(input.briefing.version, fallback.briefing.version) : fallback.briefing.version;
  return withFreshBriefing(data, version);
}

function looksLikeFamilyOsExport(value: unknown) {
  return (
    isRecord(value) &&
    isRecord(value.household) &&
    ['transactions', 'budgets', 'bills', 'tasks', 'goals'].every((key) => value[key] === undefined || Array.isArray(value[key]))
  );
}

function normalizeHousehold(value: unknown, fallback: Household): Household {
  if (!isRecord(value)) return fallback;
  const members = normalizeArray(value.members, fallback.members, normalizeMember);
  return {
    id: nonEmptyString(value.id, fallback.id),
    name: nonEmptyString(value.name, fallback.name),
    setupComplete: typeof value.setupComplete === 'boolean' ? value.setupComplete : fallback.setupComplete,
    theme: oneOf<ThemePreference>(value.theme, ['dark', 'ember', 'ocean'], fallback.theme),
    members: members.length > 0 ? members : fallback.members
  };
}

function normalizeMember(value: unknown, fallback: Member): Member {
  if (!isRecord(value)) return fallback;
  const name = nonEmptyString(value.name, fallback.name);
  return {
    id: nonEmptyString(value.id, fallback.id),
    name,
    role: nonEmptyString(value.role, fallback.role),
    color: nonEmptyString(value.color, fallback.color),
    avatar: nonEmptyString(value.avatar, name.charAt(0).toUpperCase() || fallback.avatar)
  };
}

function normalizeTransaction(value: unknown, fallback: Transaction): Transaction {
  if (!isRecord(value)) return fallback;
  const type = oneOf<TransactionType>(value.type, ['income', 'expense'], fallback.type);
  return {
    id: nonEmptyString(value.id, fallback.id),
    type,
    date: isoDateString(value.date, fallback.date),
    description: nonEmptyString(value.description, fallback.description),
    category: nonEmptyString(value.category, type === 'income' ? 'Income' : fallback.category),
    amount: positiveNumber(value.amount, fallback.amount),
    memberId: optionalString(value.memberId)
  };
}

function normalizeBudget(value: unknown, fallback: AppData['budgets'][number]) {
  if (!isRecord(value)) return fallback;
  return {
    id: nonEmptyString(value.id, fallback.id),
    category: nonEmptyString(value.category, fallback.category),
    limit: positiveNumber(value.limit, fallback.limit),
    color: nonEmptyString(value.color, fallback.color)
  };
}

function normalizeBill(
  value: unknown,
  fallback: RecurringBill,
  memberIds: Set<string>,
  fallbackMemberId?: string
): RecurringBill {
  if (!isRecord(value)) return fallback;
  const ownerId = optionalString(value.ownerId);
  const frequency = oneOf<BillFrequency>(value.frequency, ['weekly', 'monthly', 'yearly'], fallback.frequency);
  const dueDay = Math.round(positiveNumber(value.dueDay, fallback.dueDay));
  return {
    id: nonEmptyString(value.id, fallback.id),
    name: nonEmptyString(value.name, fallback.name),
    amount: positiveNumber(value.amount, fallback.amount),
    category: nonEmptyString(value.category, fallback.category),
    dueDay: frequency === 'weekly' ? clamp(dueDay, 0, 6) : clamp(dueDay, 1, 31),
    frequency,
    autopay: typeof value.autopay === 'boolean' ? value.autopay : fallback.autopay,
    ownerId: ownerId && memberIds.has(ownerId) ? ownerId : fallbackMemberId,
    lastPaidDate: optionalIsoDateString(value.lastPaidDate)
  };
}

function normalizeTask(
  value: unknown,
  fallback: FamilyTask,
  memberIds: Set<string>,
  fallbackMemberId?: string
): FamilyTask {
  if (!isRecord(value)) return fallback;
  const assignedTo = optionalString(value.assignedTo);
  return {
    id: nonEmptyString(value.id, fallback.id),
    title: nonEmptyString(value.title, fallback.title),
    category: nonEmptyString(value.category, fallback.category),
    assignedTo: assignedTo && memberIds.has(assignedTo) ? assignedTo : fallbackMemberId ?? fallback.assignedTo,
    dueDate: isoDateString(value.dueDate, fallback.dueDate),
    frequency: oneOf<TaskFrequency>(value.frequency, ['daily', 'weekly', 'once'], fallback.frequency),
    priority: oneOf<TaskPriority>(value.priority, ['low', 'medium', 'high'], fallback.priority),
    completed: typeof value.completed === 'boolean' ? value.completed : fallback.completed,
    streak: Math.max(0, Math.round(positiveNumber(value.streak, fallback.streak)))
  };
}

function normalizeGoal(value: unknown, fallback: Goal): Goal {
  if (!isRecord(value)) return fallback;
  const target = positiveNumber(value.target, fallback.target);
  return {
    id: nonEmptyString(value.id, fallback.id),
    name: nonEmptyString(value.name, fallback.name),
    category: nonEmptyString(value.category, fallback.category),
    target,
    current: clamp(positiveNumber(value.current, fallback.current), 0, target),
    dueDate: isoDateString(value.dueDate, fallback.dueDate),
    color: nonEmptyString(value.color, fallback.color),
    notes: typeof value.notes === 'string' ? value.notes : fallback.notes
  };
}

function normalizeArray<T>(value: unknown, fallback: T[], normalize: (value: unknown, fallback: T) => T) {
  const source = Array.isArray(value) ? value : fallback;
  const fallbackFirst = fallback[0];
  if (!fallbackFirst) return [] as T[];
  if (source.length === 0) return [];
  return source.map((item, index) => normalize(item, fallback[index] ?? fallbackFirst));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function positiveNumber(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function isoDateString(value: unknown, fallback: string) {
  return optionalIsoDateString(value) ?? fallback;
}

function optionalIsoDateString(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : value.slice(0, 10);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
