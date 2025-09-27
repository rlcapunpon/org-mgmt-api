import { validate } from 'class-validator';
import {
  UpdateOrganizationStatusDto,
  UpdateOrganizationRegistrationDto,
} from '../update-organization-status-registration.dto';

describe('UpdateOrganizationStatusDto', () => {
  let dto: UpdateOrganizationStatusDto;

  beforeEach(() => {
    dto = new UpdateOrganizationStatusDto();
  });

  describe('status validation', () => {
    it('should pass when status is valid', async () => {
      dto.status = 'PENDING';
      dto.reason = 'EXPIRED';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when status is APPROVED', async () => {
      dto.status = 'APPROVED';
      dto.reason = 'PAYMENT_PENDING';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when status is REJECTED', async () => {
      dto.status = 'REJECTED';
      dto.reason = 'VIOLATIONS';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when status is invalid', async () => {
      (dto as any).status = 'INVALID_STATUS';
      dto.reason = 'EXPIRED';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should fail when status is empty', async () => {
      dto.status = '';
      dto.reason = 'EXPIRED';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when status is not a string', async () => {
      (dto as any).status = 123;
      dto.reason = 'EXPIRED';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('reason validation', () => {
    it('should pass when reason is valid', async () => {
      dto.status = 'PENDING';
      dto.reason = 'EXPIRED';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when reason is OPTED_OUT', async () => {
      dto.status = 'PENDING';
      dto.reason = 'OPTED_OUT';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when reason is PAYMENT_PENDING', async () => {
      dto.status = 'PENDING';
      dto.reason = 'PAYMENT_PENDING';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when reason is VIOLATIONS', async () => {
      dto.status = 'PENDING';
      dto.reason = 'VIOLATIONS';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when reason is invalid', async () => {
      dto.status = 'PENDING';
      (dto as any).reason = 'INVALID_REASON';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should fail when reason is empty', async () => {
      dto.status = 'PENDING';
      dto.reason = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('description validation', () => {
    it('should pass when description is provided', async () => {
      dto.status = 'PENDING';
      dto.reason = 'EXPIRED';
      dto.description = 'Optional description';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when description is undefined', async () => {
      dto.status = 'PENDING';
      dto.reason = 'EXPIRED';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when description is not a string', async () => {
      dto.status = 'PENDING';
      dto.reason = 'EXPIRED';
      (dto as any).description = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});

describe('UpdateOrganizationRegistrationDto', () => {
  let dto: UpdateOrganizationRegistrationDto;

  beforeEach(() => {
    dto = new UpdateOrganizationRegistrationDto();
  });

  it('should pass when all fields are undefined (empty update)', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('string field validations', () => {
    const stringFields = [
      'first_name',
      'middle_name',
      'last_name',
      'trade_name',
      'line_of_business',
      'address_line',
      'region',
      'city',
      'zip_code',
      'tin',
      'rdo_code',
      'contact_number',
      'tax_type',
      'start_date',
      'reg_date',
    ];

    stringFields.forEach((field) => {
      it(`should pass when ${field} is provided as string`, async () => {
        (dto as any)[field] = 'test value';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it(`should fail when ${field} is not a string`, async () => {
        (dto as any)[field] = 123;

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
      });
    });
  });

  describe('email_address validation', () => {
    it('should pass when email_address is valid email', async () => {
      dto.email_address = 'test@example.com';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when email_address is invalid email', async () => {
      dto.email_address = 'invalid-email';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail when email_address is not a string', async () => {
      (dto as any).email_address = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  it('should pass when multiple fields are provided', async () => {
    dto.first_name = 'John';
    dto.last_name = 'Doe';
    dto.email_address = 'john.doe@example.com';
    dto.contact_number = '+639123456789';
    dto.line_of_business = '6201';
    dto.address_line = '123 Main Street';
    dto.region = 'NCR';
    dto.city = 'Makati';
    dto.zip_code = '1223';
    dto.tin = '001234567890';
    dto.rdo_code = '001';
    dto.tax_type = 'VAT';
    dto.start_date = '2024-01-01';
    dto.reg_date = '2024-01-01';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});