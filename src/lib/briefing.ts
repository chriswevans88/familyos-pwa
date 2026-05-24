import { format } from 'date-fns';
import type { AppData, BriefingSnapshot } from '../types';
import {
  completionRate,
  dataHealthScore,
  goalProgress,
  money,
  nextGoalDeadline,
  spendByCategory,
  tasksDue,
  totalsForMonth,
  upcomingBills
} from './calculations';

export function generateWeeklyBriefing(data: AppData, version = 1): BriefingSnapshot {
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
  const healthScore = dataHealthScore(data);
  const financialDirection =
    totals.cashflow >= 0
      ? `positive by ${money(totals.cashflow)}`
      : `underwater by ${money(Math.abs(totals.cashflow))}`;
  const dueSoon = bills.reduce((total, bill) => total + bill.amount, 0);
  const taskRate = completionRate(weekTasks);
  const summary =
    `${data.household.name} is running at a ${healthScore}/100 household rhythm score. ` +
    `Cashflow is ${financialDirection}, ${bills.length} obligations are due soon, and ${Math.round(taskRate)}% of this week's task load is complete.`;
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
          `Month-to-date income is ${money(totals.income)} against ${money(totals.expenses)} in expenses, leaving cashflow ${financialDirection}. ` +
          `${topSpend ? `${topSpend.category} is the largest flexible category at ${money(topSpend.amount)}.` : 'No expense category is dominating yet.'}`
      },
      {
        title: 'Upcoming Obligations',
        accent: '#f5c542',
        body:
          bills.length > 0
            ? `${bills.length} recurring payments land in the next 10 days, totaling ${money(dueSoon)}. The closest one is ${bills[0].name} for ${money(bills[0].amount)}.`
            : 'No recurring payments are due in the next 10 days. This is a good window for planning and catch-up.'
      },
      {
        title: 'Task Load',
        accent: '#6ee7b7',
        body:
          openTasks.length > 0
            ? `${openTasks.length} of ${weekTasks.length} visible tasks remain open this week. The highest leverage move is finishing "${openTasks[0].title}".`
            : `All ${weekTasks.length} visible tasks are complete. Keep the streak by assigning one small maintenance task for tomorrow.`
      },
      {
        title: 'Goal Momentum',
        accent: '#fb7185',
        body:
          nextGoal
            ? `Family goals average ${Math.round(averageGoalProgress)}% funded. ${nextGoal.name} is next on the calendar at ${Math.round(goalProgress(nextGoal))}% complete.`
            : 'Every visible goal is funded. Consider creating a new shared goal before extra cash gets absorbed by everyday spending.'
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
