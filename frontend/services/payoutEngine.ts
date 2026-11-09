import { StateRule } from '../types';

/**
 * Calculates the exact 4th Friday of a given month & year.
 * Applies the mandatory holiday rule: If the 4th Friday falls on a Federal Bank Holiday
 * (such as Christmas Day Dec 25, 2026), payout moves to Thursday Dec 24.
 */
export function calculateFourthFridayPayday(year: number, monthIndex: number): {
  payday: Date;
  isAdjustedForHoliday: boolean;
  holidayNote?: string;
} {
  // Find all Fridays in the given month (0-indexed month)
  const fridays: Date[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const candidate = new Date(year, monthIndex, day);
    if (candidate.getDay() === 5) {
      fridays.push(candidate);
    }
  }

  const fourthFriday = fridays[3] || fridays[fridays.length - 1];

  // Specific check for Federal Holiday: Dec 25 (Christmas)
  if (fourthFriday.getMonth() === 11 && fourthFriday.getDate() === 25) {
    const adjusted = new Date(fourthFriday);
    adjusted.setDate(adjusted.getDate() - 1); // Move to Thursday Dec 24
    return {
      payday: adjusted,
      isAdjustedForHoliday: true,
      holidayNote: 'Dec 25 is Christmas Day. Payout adjusted to Thursday, Dec 24 as per Federal Holiday Banking Rule.'
    };
  }

  return {
    payday: fourthFriday,
    isAdjustedForHoliday: false
  };
}

/**
 * Returns cutoff date for a given payday.
 * Rule: Cutoff is 11:59 pm on the last day of the prior month.
 */
export function getPriorMonthCutoff(year: number, monthIndex: number): Date {
  // Last day of prior calendar month
  return new Date(year, monthIndex, 0, 23, 59, 59);
}

/**
 * Calculates next upcoming payout cycle details
 */
export function getNextUpcomingPayoutCycle(now: Date = new Date()) {
  let year = now.getFullYear();
  let month = now.getMonth();

  let cycle = calculateFourthFridayPayday(year, month);
  if (now > cycle.payday) {
    // Current month's payday has passed, move to next month
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    cycle = calculateFourthFridayPayday(year, month);
  }

  const cutoff = getPriorMonthCutoff(year, month);
  const diffMs = cycle.payday.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    nextPayDate: cycle.payday,
    cutoffDate: cutoff,
    daysRemaining,
    isAdjusted: cycle.isAdjustedForHoliday,
    holidayNote: cycle.holidayNote
  };
}

/**
 * Validates a member payout amount against state compliance limits.
 */
export function evaluateStateCompliance(
  stateCode: string,
  stateRules: StateRule[],
  currentAnnualPaid: number,
  baseReward: number = 25
): {
  approvedAmount: number;
  isCapped: boolean;
  ruleApplied: StateRule;
  capMessage?: string;
} {
  const rule = stateRules.find(r => r.state.toUpperCase() === stateCode.toUpperCase()) || {
    state: stateCode,
    maxPerReferral: 25,
    annualCap: 500,
    rewardTypes: 'CASH_OR_GIFT',
    prizesCountTowardCap: true,
    legalNotice: 'Standard state insurance referral guidelines apply.'
  };

  let approvedAmount = Math.min(baseReward, rule.maxPerReferral);
  const remainingAllowance = Math.max(0, rule.annualCap - currentAnnualPaid);

  if (remainingAllowance <= 0) {
    return {
      approvedAmount: 0,
      isCapped: true,
      ruleApplied: rule,
      capMessage: `Annual limit of $${rule.annualCap} reached for ${rule.state}. Payout placed on hold.`
    };
  }

  if (approvedAmount > remainingAllowance) {
    approvedAmount = remainingAllowance;
    return {
      approvedAmount,
      isCapped: true,
      ruleApplied: rule,
      capMessage: `Partial payment of $${approvedAmount} allowed before hitting annual cap of $${rule.annualCap}.`
    };
  }

  return {
    approvedAmount,
    isCapped: false,
    ruleApplied: rule
  };
}
