import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from '../services/schedules.service';
import { OrganizationObligation, ScheduleStatus } from '@prisma/client';

describe('SchedulesService', () => {
  let service: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulesService],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
  });

  describe('generateSchedulesForObligation', () => {
    const mockObligation = {
      id: 'obl1',
      organization_id: 'org1',
      obligation_id: 'tax1',
      start_date: new Date(),
      end_date: null,
      status: 'ACTIVE' as any,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
      organization: {
        id: 'org1',
        name: 'Test Org',
        category: 'NON_INDIVIDUAL' as any,
        tax_classification: 'VAT' as any,
        tin: null,
        subcategory: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      obligation: {
        id: 'tax1',
        name: 'VAT Return',
        description: 'Monthly VAT return',
        frequency: 'monthly',
        due_rule: '15th of month',
        category: 'TAX' as any,
        subcategory: 'VAT' as any,
        created_at: new Date(),
        updated_at: new Date(),
      },
    } as any;

    it('should generate monthly schedules with 15th of month due rule', () => {
      const startDate = new Date(Date.UTC(2024, 0, 1));
      const endDate = new Date(Date.UTC(2024, 2, 31));

      const schedules = service.generateSchedulesForObligation(mockObligation, startDate, endDate);

      expect(schedules).toHaveLength(3);
      expect(schedules[0]).toMatchObject({
        org_obligation_id: 'obl1',
        period: '2024-01',
        due_date: new Date(Date.UTC(2024, 0, 15)),
        status: ScheduleStatus.DUE,
        filed_at: null,
      });
      expect(schedules[1]).toMatchObject({
        period: '2024-02',
        due_date: new Date(Date.UTC(2024, 1, 15)),
      });
      expect(schedules[2]).toMatchObject({
        period: '2024-03',
        due_date: new Date(Date.UTC(2024, 2, 15)),
      });
    });

    it('should generate quarterly schedules with last day of quarter due rule', () => {
      const quarterlyObligation = {
        ...mockObligation,
        obligation: {
          ...mockObligation.obligation,
          frequency: 'quarterly',
          due_rule: 'last day of quarter',
        },
      };

      const startDate = new Date(Date.UTC(2024, 0, 1));
      const endDate = new Date(Date.UTC(2024, 11, 31));

      const schedules = service.generateSchedulesForObligation(quarterlyObligation, startDate, endDate);

      expect(schedules).toHaveLength(4);
      expect(schedules[0]).toMatchObject({
        period: '2024-Q1',
        due_date: new Date(Date.UTC(2024, 2, 31)),
      });
      expect(schedules[1]).toMatchObject({
        period: '2024-Q2',
        due_date: new Date(Date.UTC(2024, 5, 30)),
      });
      expect(schedules[2]).toMatchObject({
        period: '2024-Q3',
        due_date: new Date(Date.UTC(2024, 8, 30)),
      });
      expect(schedules[3]).toMatchObject({
        period: '2024-Q4',
        due_date: new Date(Date.UTC(2024, 11, 31)),
      });
    });

    it('should generate annual schedules', () => {
      const annualObligation = {
        ...mockObligation,
        obligation: {
          ...mockObligation.obligation,
          frequency: 'annual',
          due_rule: 'last day of month',
        },
      };

      const startDate = new Date(Date.UTC(2024, 0, 1));
      const endDate = new Date(Date.UTC(2026, 11, 31));

      const schedules = service.generateSchedulesForObligation(annualObligation, startDate, endDate);

      expect(schedules).toHaveLength(3);
      expect(schedules[0]).toMatchObject({
        period: '2024',
        due_date: new Date(Date.UTC(2024, 11, 31)),
      });
      expect(schedules[1]).toMatchObject({
        period: '2025',
        due_date: new Date(Date.UTC(2025, 11, 31)),
      });
      expect(schedules[2]).toMatchObject({
        period: '2026',
        due_date: new Date(Date.UTC(2026, 11, 31)),
      });
    });

    it('should throw error for unsupported frequency', () => {
      const invalidObligation = {
        ...mockObligation,
        obligation: {
          ...mockObligation.obligation,
          frequency: 'daily',
        },
      };

      expect(() => {
        service.generateSchedulesForObligation(invalidObligation, new Date(), new Date());
      }).toThrow('Unsupported frequency: daily');
    });

    it('should throw error for unsupported due rule', () => {
      const invalidObligation = {
        ...mockObligation,
        obligation: {
          ...mockObligation.obligation,
          due_rule: 'invalid rule',
        },
      };

      expect(() => {
        service.generateSchedulesForObligation(invalidObligation, new Date(), new Date());
      }).toThrow('Unsupported due rule format: invalid rule');
    });
  });
});
