import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateOrganizationOperationDto } from '../update-organization-operation.dto';
import { AccountingMethod } from '@prisma/client';

describe('UpdateOrganizationOperationDto', () => {
  let dto: UpdateOrganizationOperationDto;

  beforeEach(() => {
    dto = new UpdateOrganizationOperationDto();
  });

  it('should pass when all fields are undefined (empty update)', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('date field transformations', () => {
    it('should transform fy_start string to Date', async () => {
      const plainObject = { fy_start: '2025-01-01' };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBe(0);
      expect(transformedDto.fy_start).toBeInstanceOf(Date);
    });

    it('should transform fy_end string to Date', async () => {
      const plainObject = { fy_end: '2025-12-31' };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBe(0);
      expect(transformedDto.fy_end).toBeInstanceOf(Date);
    });

    it('should transform vat_reg_effectivity string to Date', async () => {
      const plainObject = { vat_reg_effectivity: '2025-01-01' };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBe(0);
      expect(transformedDto.vat_reg_effectivity).toBeInstanceOf(Date);
    });

    it('should transform registration_effectivity string to Date', async () => {
      const plainObject = { registration_effectivity: '2025-01-01' };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBe(0);
      expect(transformedDto.registration_effectivity).toBeInstanceOf(Date);
    });

    it('should leave date fields undefined when not provided', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.fy_start).toBeUndefined();
      expect(dto.fy_end).toBeUndefined();
      expect(dto.vat_reg_effectivity).toBeUndefined();
      expect(dto.registration_effectivity).toBeUndefined();
    });
  });

  describe('array field validations', () => {
    it('should pass when payroll_cut_off is array of strings', async () => {
      dto.payroll_cut_off = ['15/30', '31/15'];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when payroll_cut_off contains non-string values', async () => {
      (dto as any).payroll_cut_off = ['15/30', 123];

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should pass when payment_cut_off is array of strings', async () => {
      dto.payment_cut_off = ['15/30', '31/15'];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when payment_cut_off is not an array', async () => {
      (dto as any).payment_cut_off = 'not-an-array';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should pass when quarter_closing is array of strings', async () => {
      dto.quarter_closing = ['03/31', '06/30', '09/30', '12/31'];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('boolean field transformations', () => {
    it('should transform has_foreign string "true" to boolean true', async () => {
      const plainObject = { has_foreign: 'true' };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBe(0);
      expect(transformedDto.has_foreign).toBe(true);
    });

    it('should transform has_foreign string "false" to boolean false', async () => {
      const plainObject = { has_foreign: 'false' };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBe(0);
      expect(transformedDto.has_foreign).toBe(false);
    });

    it('should accept has_foreign as boolean true', async () => {
      dto.has_foreign = true;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.has_foreign).toBe(true);
    });

    it('should accept has_foreign as boolean false', async () => {
      dto.has_foreign = false;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.has_foreign).toBe(false);
    });

    it('should fail when has_foreign is invalid string', async () => {
      const plainObject = { has_foreign: 'invalid' };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should transform has_employees string values correctly', async () => {
      const plainObject = {
        has_employees: 'true',
        is_ewt: 'false',
        is_fwt: 'true',
        is_bir_withholding_agent: 'false'
      };
      const transformedDto = plainToClass(UpdateOrganizationOperationDto, plainObject);

      const errors = await validate(transformedDto);
      expect(errors.length).toBe(0);
      expect(transformedDto.has_employees).toBe(true);
      expect(transformedDto.is_ewt).toBe(false);
      expect(transformedDto.is_fwt).toBe(true);
      expect(transformedDto.is_bir_withholding_agent).toBe(false);
    });
  });

  describe('accounting_method validation', () => {
    it('should pass when accounting_method is valid enum value', async () => {
      dto.accounting_method = AccountingMethod.ACCRUAL;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when accounting_method is invalid enum value', async () => {
      (dto as any).accounting_method = 'INVALID_METHOD';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  it('should pass when all fields are provided with valid values', async () => {
    dto.fy_start = new Date('2025-01-01');
    dto.fy_end = new Date('2025-12-31');
    dto.vat_reg_effectivity = new Date('2025-01-01');
    dto.registration_effectivity = new Date('2025-01-01');
    dto.payroll_cut_off = ['15/30'];
    dto.payment_cut_off = ['15/30'];
    dto.quarter_closing = ['03/31', '06/30', '09/30', '12/31'];
    dto.has_foreign = false;
    dto.has_employees = true;
    dto.is_ewt = false;
    dto.is_fwt = true;
    dto.is_bir_withholding_agent = false;
    dto.accounting_method = AccountingMethod.ACCRUAL;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});