import { format } from 'date-fns';
import type { AppData, BriefingSnapshot } from '../types';
import {
  completionRate,
  goalProgress,
  householdHealthBreakdown,
  money,
  nextBestAction,
  nextGoalDeadline,
  overBudgetCount,
  spendByCategory,
  tasksDue,
  totalsForMonth,
  upcomingBills
} from './calculations';

export function generateWeeklyBriefing(data: AppData, version = 1): BriefingSnapshot {
  const isBlankHousehold =
    data.transactions.length === 0 &&
    data.budgets.length === 0 &&
    data.bills.length === 0 &&
    data.tasks.length === 0 &&
    data.goals.length === 0;

  if (isBlankHousehold) {
    return {
      id: `briefing-${Date.now()}-${version}`,
      generatedAt: new Date().toISOString(),
      version,
      summary:
        `${data.household.name} is ready for setup. Add the first transaction, recurring bill, task, or goal and FamilyOS will turn it into a weekly operating report.`,
      sections: [
        {
          title: 'Financial Pulse',
          accent: '#22d3ee',
          body: 'No income or spending has been added yet. Start with one income entry or one common expense to create the first cashflow signal.'
        },
        {
          title: 'Upcoming Obligations',
          accent: '#f5c542',
          body: 'No recurring bills are being tracked yet. Add rent, mortgage, utilities, subscriptions, or insurance to turn on payment radar.'
        },
        {
          title: 'Task Load',
          accent: '#6ee7b7',
          body: 'No chores or responsibilities are assigned yet. Add one daily or weekly task to make family load visible.'
        },
        {
          title: 'Goal Momentum',
          accent: '#fb7185',
          body: 'No family goals are active yet. Create a shared goal such as emergency savings, a trip, or a home project.'
        },
        {
          title: 'Tonight Win',
          accent: '#a78bfa',
          body: 'Add one real household item now. FamilyOS becomes more useful as soon as the first signal is in place.'
        }
      ],
      nextAction: 'Add one transaction, recurring bill, task, or goal to start the household operating picture.'
    };
  }

  const totals = totalsForMonth(data.transactions);
  const topSpend = spendByCategory(data.transactions)[0];
  const bills = upcomingBills(data.bills, 10);
  const weekTasks = tasksDue(data.tasks, 'week');
  const openTasks = weekTasks.filter((task) => !task.completed);
  const averageGoalProgress =
    data.goals.length === 0
      ? 0
      : data.goals.reduce((total, goal) => total + goalProgress(goal), 0) / data.goals.length;
  const nextGoal = nextGoalDeadline(data.goals);
  const health = householdHealthBreakdown(data);
  const recommendation = nextBestAction(data);
  const overBudget = overBudgetCount(data);
  const financialDirection =
    totals.cashflow >= 0
      ? `positive by ${money(totals.cashflow)}`
      : `underwater by ${money(Math.abs(totals.cashflow))}`;
  const dueSoon = bills.reduce((total, bill) => total + bill.amount, 0);
  const taskRate = completionRate(weekTasks);
  const summary =
    `${data.household.name} is operating at ${health.score}/100 this week. ` +
    `Cashflow is ${financialDirection}, ${bills.length} obligations need attention, and ${Math.round(taskRate)}% of the visible task load is complete.`;
  const nextAction =
    totals.cashflow < 0
      ? 'Trim one flexible category this week and move the saved amount directly into the emergency cushion.'
      : openTasks.length > 2
        ? `Clear ${openTasks[0].title.toLowerCase()} first, then reassign one open task to rebalance the week.`
        : nextGoal
          ? `Add a focused contribution to ${nextGoal.name} while cashflow is still healthy.`
          : 'Run a ten-minute family reset and choose one shared priority for the week.';

  return {
    id: `briefing-${Date.now()}-${version}`,
    generatedAt: new Date().toISOString(),
    version,
    summary,
    sections: [
      {
        title: 'Financial Pulse',
        accent: '#22d3ee',
        body:
          `Money score: ${health.moneyScore}/100. Month-to-date income is ${money(totals.income)} against ${money(totals.expenses)} in expenses, leaving cashflow ${financialDirection}. ` +
          `${topSpend ? `${topSpend.category} is the largest flexible category at ${money(topSpend.amount)}.` : 'No expense category is dominating yet.'} ` +
          `${overBudget > 0 ? `${overBudget} budget ${overBudget === 1 ? 'line is' : 'lines are'} over target.` : 'No tracked budget line is over target.'}`
      },
      {
        title: 'Upcoming Obligations',
        accent: '#f5c542',
        body:
          bills.length > 0
            ? `Bill readiness score: ${health.billScore}/100. ${bills.length} recurring payments land in the next 10 days, totaling ${money(dueSoon)}. The closest one is ${bills[0].name} for ${money(bills[0].amount)}.`
            : 'No recurring payments are due in the next 10 days. This is a good window for planning and catch-up.'
      },
      {
        title: 'Task Load',
        accent: '#6ee7b7',
        body:
          openTasks.length > 0
            ? `Task momentum score: ${health.taskScore}/100. ${openTasks.length} of ${weekTasks.length} visible tasks remain open this week. The highest leverage move is finishing "${openTasks[0].title}".`
            : `Task momentum score: ${health.taskScore}/100. All ${weekTasks.length} visible tasks are complete. Keep the streak by assigning one small maintenance task for tomorrow.`
      },
      {
        title: 'Goal Momentum',
        accent: '#fb7185',
        body:
          nextGoal
            ? `Family goals average ${Math.round(averageGoalProgress)}% funded. ${nextGoal.name} is next on the calendar at ${Math.round(goalProgress(nextGoal))}% complete.`
            : 'Every visible goal is funded. Consider creating a new shared goal before extra cash gets absorbed by everyday spending.'
      },
      {
        title: 'Tonight Win',
        accent: '#a78bfa',
        body: `${recommendation.title}. ${recommendation.body}`
      }
    ],
    nextAction
  };
}

export function briefingToText(briefing: BriefingSnapshot) {
  const sections = briefing.sections
    .map((section) => `${section.title}\n${section.body}`)
    .join('\n\n');
  return `FamilyOS Weekly Briefing
Generated ${format(new Date(briefing.generatedAt), 'PPpp')}

${briefing.summary}

${sections}

Recommended next action
${briefing.nextAction}
`;
}
