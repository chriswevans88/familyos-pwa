import { addDays, formatISO, startOfMonth, subDays } from 'date-fns';
import type { AppData, Household } from '../types';

const today = () => new Date();
const iso = (date: Date) => formatISO(date, { representation: 'date' });
const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const memberPalette = ['#22d3ee', '#6ee7b7', '#f5c542', '#fb7185', '#a78bfa', '#f97316'];

export function createBlankHousehold(): Household {
  return {
    id: id('household'),
    name: 'Our Household',
    setupComplete: false,
    theme: 'dark',
    members: [
      { id: id('member'), name: '', role: 'Parent', color: memberPalette[0], avatar: '?' },
      { id: id('member'), name: '', role: 'Parent', color: memberPalette[1], avatar: '?' }
    ]
  };
}

export function createDemoData(setupComplete = true): AppData {
  const base = today();
  const monthStart = startOfMonth(base);
  const members = [
    { id: 'member-avery', name: 'Avery', role: 'Parent', color: memberPalette[0], avatar: 'A' },
    { id: 'member-jordan', name: 'Jordan', role: 'Parent', color: memberPalette[1], avatar: 'J' },
    { id: 'member-riley', name: 'Riley', role: 'Teen', color: memberPalette[2], avatar: 'R' },
    { id: 'member-mia', name: 'Mia', role: 'Kid', color: memberPalette[3], avatar: 'M' }
  ];

  const data: AppData = {
    household: {
      id: 'household-demo',
      name: 'The Morgan Household',
      setupComplete,
      theme: 'dark',
      members
    },
    transactions: [
      {
        id: 'txn-payroll-1',
        type: 'income',
        date: iso(addDays(monthStart, 1)),
        description: 'Avery payroll',
        category: 'Income',
        amount: 5400,
        memberId: 'member-avery'
      },
      {
        id: 'txn-payroll-2',
        type: 'income',
        date: iso(addDays(monthStart, 15)),
        description: 'Jordan payroll',
        category: 'Income',
        amount: 4825,
        memberId: 'member-jordan'
      },
      {
        id: 'txn-groceries-1',
        type: 'expense',
        date: iso(subDays(base, 1)),
        description: 'Whole basket groceries',
        category: 'Groceries',
        amount: 218.44
      },
      {
        id: 'txn-soccer',
        type: 'expense',
        date: iso(subDays(base, 2)),
        description: 'Spring soccer registration',
        category: 'Kids',
        amount: 165
      },
      {
        id: 'txn-target',
        type: 'expense',
        date: iso(subDays(base, 3)),
        description: 'Household supplies',
        category: 'Home',
        amount: 94.82
      },
      {
        id: 'txn-gas',
        type: 'expense',
        date: iso(subDays(base, 4)),
        description: 'Fuel and car wash',
        category: 'Transport',
        amount: 72.4
      },
      {
        id: 'txn-dinner',
        type: 'expense',
        date: iso(subDays(base, 5)),
        description: 'Friday family dinner',
        category: 'Dining',
        amount: 86.2
      },
      {
        id: 'txn-medical',
        type: 'expense',
        date: iso(subDays(base, 7)),
        description: 'Pediatric copay',
        category: 'Health',
        amount: 35
      },
      {
        id: 'txn-streaming',
        type: 'expense',
        date: iso(addDays(monthStart, 6)),
        description: 'Streaming bundle',
        category: 'Subscriptions',
        amount: 48.97
      },
      {
        id: 'txn-utilities',
        type: 'expense',
        date: iso(addDays(monthStart, 9)),
        description: 'Electric utility',
        category: 'Utilities',
        amount: 184.35
      },
      {
        id: 'txn-mortgage',
        type: 'expense',
        date: iso(addDays(monthStart, 2)),
        description: 'Mortgage payment',
        category: 'Housing',
        amount: 2650
      },
      {
        id: 'txn-activities',
        type: 'expense',
        date: iso(subDays(base, 9)),
        description: 'Museum membership',
        category: 'Family Fun',
        amount: 120
      }
    ],
    budgets: [
      { id: 'budget-housing', category: 'Housing', limit: 2800, color: '#22d3ee' },
      { id: 'budget-groceries', category: 'Groceries', limit: 900, color: '#6ee7b7' },
      { id: 'budget-kids', category: 'Kids', limit: 450, color: '#f5c542' },
      { id: 'budget-dining', category: 'Dining', limit: 360, color: '#fb7185' },
      { id: 'budget-transport', category: 'Transport', limit: 520, color: '#a78bfa' },
      { id: 'budget-home', category: 'Home', limit: 500, color: '#f97316' }
    ],
    bills: [
      {
        id: 'bill-mortgage',
        name: 'Mortgage',
        amount: 2650,
        category: 'Housing',
        dueDay: 2,
        frequency: 'monthly',
        autopay: true,
        ownerId: 'member-avery',
        lastPaidDate: iso(addDays(monthStart, 2))
      },
      {
        id: 'bill-electric',
        name: 'Electric utility',
        amount: 184,
        category: 'Utilities',
        dueDay: 11,
        frequency: 'monthly',
        autopay: true,
        ownerId: 'member-jordan'
      },
      {
        id: 'bill-internet',
        name: 'Fiber internet',
        amount: 79,
        category: 'Utilities',
        dueDay: 17,
        frequency: 'monthly',
        autopay: true,
        ownerId: 'member-jordan'
      },
      {
        id: 'bill-daycare',
        name: 'After-school care',
        amount: 310,
        category: 'Kids',
        dueDay: 22,
        frequency: 'monthly',
        autopay: false,
        ownerId: 'member-avery'
      },
      {
        id: 'bill-insurance',
        name: 'Auto insurance',
        amount: 226,
        category: 'Transport',
        dueDay: 28,
        frequency: 'monthly',
        autopay: true,
        ownerId: 'member-jordan'
      },
      {
        id: 'bill-cleaning',
        name: 'House cleaning',
        amount: 145,
        category: 'Home',
        dueDay: 5,
        frequency: 'weekly',
        autopay: false,
        ownerId: 'member-avery'
      }
    ],
    tasks: [
      {
        id: 'task-backpacks',
        title: 'Prep backpacks and lunch cards',
        category: 'School',
        assignedTo: 'member-riley',
        dueDate: iso(base),
        frequency: 'daily',
        priority: 'high',
        completed: false,
        streak: 5
      },
      {
        id: 'task-kitchen',
        title: 'Kitchen reset after dinner',
        category: 'Home',
        assignedTo: 'member-jordan',
        dueDate: iso(base),
        frequency: 'daily',
        priority: 'medium',
        completed: true,
        streak: 11
      },
      {
        id: 'task-trash',
        title: 'Trash and recycling to curb',
        category: 'Home',
        assignedTo: 'member-avery',
        dueDate: iso(addDays(base, 1)),
        frequency: 'weekly',
        priority: 'high',
        completed: false,
        streak: 3
      },
      {
        id: 'task-music',
        title: 'Practice piano',
        category: 'Activities',
        assignedTo: 'member-mia',
        dueDate: iso(base),
        frequency: 'daily',
        priority: 'low',
        completed: false,
        streak: 8
      },
      {
        id: 'task-meal',
        title: 'Plan next week meals',
        category: 'Planning',
        assignedTo: 'member-jordan',
        dueDate: iso(addDays(base, 2)),
        frequency: 'weekly',
        priority: 'medium',
        completed: false,
        streak: 2
      },
      {
        id: 'task-library',
        title: 'Return library books',
        category: 'Errands',
        assignedTo: 'member-riley',
        dueDate: iso(addDays(base, 3)),
        frequency: 'once',
        priority: 'medium',
        completed: false,
        streak: 0
      }
    ],
    goals: [
      {
        id: 'goal-vacation',
        name: 'Lake house week',
        category: 'Vacation',
        target: 4200,
        current: 2875,
        dueDate: iso(addDays(base, 74)),
        color: '#22d3ee',
        notes: 'Deposit due six weeks before travel.'
      },
      {
        id: 'goal-emergency',
        name: 'Emergency cushion',
        category: 'Security',
        target: 15000,
        current: 9250,
        dueDate: iso(addDays(base, 210)),
        color: '#6ee7b7',
        notes: 'Six months of core expenses.'
      },
      {
        id: 'goal-patio',
        name: 'Back patio refresh',
        category: 'Home',
        target: 3200,
        current: 1220,
        dueDate: iso(addDays(base, 122)),
        color: '#f5c542',
        notes: 'Pavers, seating, lighting, and planters.'
      },
      {
        id: 'goal-holidays',
        name: 'Holiday fund',
        category: 'Seasonal',
        target: 1800,
        current: 740,
        dueDate: iso(addDays(base, 185)),
        color: '#fb7185',
        notes: 'Gifts, hosting, school events, and travel.'
      }
    ],
    briefing: {
      id: 'briefing-seed',
      generatedAt: new Date().toISOString(),
      version: 1,
      summary: '',
      sections: [],
      nextAction: ''
    }
  };

  return data;
}
