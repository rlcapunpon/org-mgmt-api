import { Injectable } from '@nestjs/common';
import {
  OrganizationObligation,
  ObligationSchedule,
  ScheduleStatus,
} from '@prisma/client';

@Injectable()
export class SchedulesService {
  /**
   * Generates obligation schedules for a given organization obligation within a date range.
   * @param obligation The organization obligation to generate schedules for
   * @param startDate The start date of the period
   * @param endDate The end date of the period
   * @returns Array of obligation schedules
   */
  generateSchedulesForObligation(
    obligation: OrganizationObligation & { obligation: any },
    startDate: Date,
    endDate: Date,
  ): Omit<ObligationSchedule, 'id' | 'created_at' | 'updated_at'>[] {
    const schedules: Omit<
      ObligationSchedule,
      'id' | 'created_at' | 'updated_at'
    >[] = [];

    // Parse the due rule to determine how to calculate due dates
    const dueDateCalculator = this.parseDueRule(
      obligation.obligation.due_rule,
      obligation.obligation.frequency,
    );

    // Generate schedules based on frequency
    switch (obligation.obligation.frequency) {
      case 'monthly':
        schedules.push(
          ...this.generateMonthlySchedules(
            obligation,
            startDate,
            endDate,
            dueDateCalculator,
          ),
        );
        break;
      case 'quarterly':
        schedules.push(
          ...this.generateQuarterlySchedules(
            obligation,
            startDate,
            endDate,
            dueDateCalculator,
          ),
        );
        break;
      case 'annual':
        schedules.push(
          ...this.generateAnnualSchedules(
            obligation,
            startDate,
            endDate,
            dueDateCalculator,
          ),
        );
        break;
      default:
        throw new Error(
          `Unsupported frequency: ${obligation.obligation.frequency}`,
        );
    }

    return schedules;
  }

  private parseDueRule(dueRule: any, frequency: string): (date: Date) => Date {
    // Handle JSON due rule objects from database
    if (typeof dueRule === 'object' && dueRule !== null) {
      if (dueRule.day && dueRule.relative_to) {
        const day = dueRule.day;
        const relativeTo = dueRule.relative_to;

        if (relativeTo === 'fiscal_quarter_end') {
          return (date: Date) =>
            new Date(Date.UTC(date.getFullYear(), date.getMonth() + 3, day));
        } else if (relativeTo === 'calendar_quarter_end') {
          return (date: Date) =>
            new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, day));
        } else if (relativeTo === 'calendar_month_end') {
          return (date: Date) =>
            new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, day));
        } else if (relativeTo === 'fiscal_year_end') {
          return (date: Date) =>
            new Date(Date.UTC(date.getFullYear() + 1, dueRule.month - 1, day));
        }
      } else if (dueRule.conditional) {
        // Handle conditional due dates
        return (date: Date) => new Date(Date.UTC(date.getFullYear(), 11, 31)); // Default to year end
      } else if (dueRule.month && dueRule.day) {
        // Annual due date
        return (date: Date) =>
          new Date(
            Date.UTC(date.getFullYear(), dueRule.month - 1, dueRule.day),
          );
      }
    }

    // Fallback to string parsing for backward compatibility
    const dueRuleStr =
      typeof dueRule === 'string' ? dueRule : JSON.stringify(dueRule);
    if (dueRuleStr.includes('last day of quarter')) {
      return (date: Date) => this.getLastDayOfQuarter(date);
    } else if (dueRule.includes('last day of month')) {
      if (frequency === 'annual') {
        // For annual, "last day of month" means December 31
        return (date: Date) => new Date(Date.UTC(date.getFullYear(), 11, 31));
      } else {
        return (date: Date) => this.getLastDayOfMonth(date);
      }
    } else {
      // Assume it's "Xth of month" format
      const match = dueRule.match(/(\d+)(?:st|nd|rd|th) of month/);
      if (match) {
        const day = parseInt(match[1], 10);
        if (frequency === 'annual') {
          // For annual, "Xth of month" means Xth of December
          return (date: Date) =>
            new Date(Date.UTC(date.getFullYear(), 11, day));
        } else {
          return (date: Date) =>
            new Date(Date.UTC(date.getFullYear(), date.getMonth(), day));
        }
      }
    }
    throw new Error(`Unsupported due rule format: ${dueRule}`);
  }

  private generateMonthlySchedules(
    obligation: OrganizationObligation & { obligation: any },
    startDate: Date,
    endDate: Date,
    dueDateCalculator: (date: Date) => Date,
  ): Omit<ObligationSchedule, 'id' | 'created_at' | 'updated_at'>[] {
    const schedules: Omit<
      ObligationSchedule,
      'id' | 'created_at' | 'updated_at'
    >[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current <= endDate) {
      const dueDate = dueDateCalculator(current);
      if (dueDate >= startDate && dueDate <= endDate) {
        schedules.push({
          org_obligation_id: obligation.id,
          period: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
          due_date: dueDate,
          status: ScheduleStatus.DUE,
          filed_at: null,
        });
      }
      current.setMonth(current.getMonth() + 1);
    }

    return schedules;
  }

  private generateQuarterlySchedules(
    obligation: OrganizationObligation & { obligation: any },
    startDate: Date,
    endDate: Date,
    dueDateCalculator: (date: Date) => Date,
  ): Omit<ObligationSchedule, 'id' | 'created_at' | 'updated_at'>[] {
    const schedules: Omit<
      ObligationSchedule,
      'id' | 'created_at' | 'updated_at'
    >[] = [];
    const current = new Date(
      startDate.getFullYear(),
      Math.floor(startDate.getMonth() / 3) * 3,
      1,
    );

    while (current <= endDate) {
      const dueDate = dueDateCalculator(current);
      if (dueDate >= startDate && dueDate <= endDate) {
        const quarter = Math.floor(current.getMonth() / 3) + 1;
        schedules.push({
          org_obligation_id: obligation.id,
          period: `${current.getFullYear()}-Q${quarter}`,
          due_date: dueDate,
          status: ScheduleStatus.DUE,
          filed_at: null,
        });
      }
      current.setMonth(current.getMonth() + 3);
    }

    return schedules;
  }

  private generateAnnualSchedules(
    obligation: OrganizationObligation & { obligation: any },
    startDate: Date,
    endDate: Date,
    dueDateCalculator: (date: Date) => Date,
  ): Omit<ObligationSchedule, 'id' | 'created_at' | 'updated_at'>[] {
    const schedules: Omit<
      ObligationSchedule,
      'id' | 'created_at' | 'updated_at'
    >[] = [];
    const current = new Date(startDate.getFullYear(), 0, 1);

    while (current <= endDate) {
      const dueDate = dueDateCalculator(current);
      if (dueDate >= startDate && dueDate <= endDate) {
        schedules.push({
          org_obligation_id: obligation.id,
          period: `${current.getFullYear()}`,
          due_date: dueDate,
          status: ScheduleStatus.DUE,
          filed_at: null,
        });
      }
      current.setFullYear(current.getFullYear() + 1);
    }

    return schedules;
  }

  private getLastDayOfMonth(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));
  }

  private getLastDayOfQuarter(date: Date): Date {
    const quarterEndMonth = Math.floor(date.getMonth() / 3) * 3 + 2;
    return new Date(Date.UTC(date.getFullYear(), quarterEndMonth + 1, 0));
  }
}
