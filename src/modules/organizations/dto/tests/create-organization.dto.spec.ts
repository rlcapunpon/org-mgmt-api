import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateOrganizationDto } from '../create-organization.dto';
import { Category, SubCategory, TaxClassification } from '@prisma/client';

describe('CreateOrganizationDto', () => {
  let dto: CreateOrganizationDto;

  beforeEach(() => {
    dto = new CreateOrganizationDto();
  });

  describe('name validation', () => {
    it('should pass when name is provided', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when name is empty', async () => {
      dto.name = '';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name is not a string', async () => {
      (dto as any).name = 123;
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('category validation', () => {
    it('should pass when category is valid enum value', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when category is invalid', async () => {
      dto.name = 'ABC Corporation';
      (dto as any).category = 'INVALID_CATEGORY';
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('subcategory validation', () => {
    it('should pass when subcategory is optional and valid', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.subcategory = SubCategory.SELF_EMPLOYED;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass when subcategory is undefined', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('tin_registration validation', () => {
    it('should pass when tin_registration is exactly 12 characters', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when tin_registration is less than 12 characters', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '00123456789';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('should fail when tin_registration is more than 12 characters', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '0012345678901';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isLength');
    });
  });

  describe('email_address validation', () => {
    it('should pass when email_address is valid', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'john.doe@example.com';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when email_address is invalid', async () => {
      dto.name = 'ABC Corporation';
      dto.category = Category.INDIVIDUAL;
      dto.tax_classification = TaxClassification.VAT;
      dto.first_name = 'John';
      dto.last_name = 'Doe';
      dto.line_of_business = '6201';
      dto.address_line = '123 Main Street';
      dto.region = 'NCR';
      dto.city = 'Makati';
      dto.zip_code = '1223';
      dto.tin_registration = '001234567890';
      dto.rdo_code = '001';
      dto.contact_number = '+639123456789';
      dto.email_address = 'invalid-email';
      dto.tax_type = TaxClassification.VAT;
      dto.start_date = new Date('2024-01-01');
      dto.reg_date = new Date('2024-01-01');

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('date transformations', () => {
    it('should transform string dates to Date objects', async () => {
      const plainObject = {
        name: 'ABC Corporation',
        category: Category.INDIVIDUAL,
        tax_classification: TaxClassification.VAT,
        first_name: 'John',
        last_name: 'Doe',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        tin_registration: '001234567890',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        tax_type: TaxClassification.VAT,
        start_date: '2024-01-01',
        reg_date: '2024-01-01',
      };

      const transformedDto = plainToClass(CreateOrganizationDto, plainObject);
      const errors = await validate(transformedDto);

      expect(errors.length).toBe(0);
      expect(transformedDto.start_date).toBeInstanceOf(Date);
      expect(transformedDto.reg_date).toBeInstanceOf(Date);
    });
  });

  describe('optional fields transformation', () => {
    it('should transform provided optional fields to null when undefined', async () => {
      const plainObject = {
        name: 'ABC Corporation',
        category: Category.INDIVIDUAL,
        tax_classification: TaxClassification.VAT,
        first_name: 'John',
        last_name: 'Doe',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        tin_registration: '001234567890',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        tax_type: TaxClassification.VAT,
        start_date: new Date('2024-01-01'),
        reg_date: new Date('2024-01-01'),
        tin: undefined,
        middle_name: undefined,
        trade_name: undefined,
        address: undefined,
        registration_date: undefined,
      };

      const transformedDto = plainToClass(CreateOrganizationDto, plainObject);
      const errors = await validate(transformedDto);

      expect(errors.length).toBe(0);
      expect(transformedDto.tin).toBeNull();
      expect(transformedDto.middle_name).toBeNull();
      expect(transformedDto.trade_name).toBeNull();
      expect(transformedDto.address).toBeNull();
      expect(transformedDto.registration_date).toBeNull();
    });

    it('should leave optional fields undefined when not provided', async () => {
      const plainObject = {
        name: 'ABC Corporation',
        category: Category.INDIVIDUAL,
        tax_classification: TaxClassification.VAT,
        first_name: 'John',
        last_name: 'Doe',
        line_of_business: '6201',
        address_line: '123 Main Street',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        tin_registration: '001234567890',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        tax_type: TaxClassification.VAT,
        start_date: new Date('2024-01-01'),
        reg_date: new Date('2024-01-01'),
      };

      const transformedDto = plainToClass(CreateOrganizationDto, plainObject);
      const errors = await validate(transformedDto);

      expect(errors.length).toBe(0);
      expect(transformedDto.tin).toBeUndefined();
      expect(transformedDto.middle_name).toBeUndefined();
      expect(transformedDto.trade_name).toBeUndefined();
      expect(transformedDto.address).toBeUndefined();
      expect(transformedDto.registration_date).toBeUndefined();
    });
  });
});