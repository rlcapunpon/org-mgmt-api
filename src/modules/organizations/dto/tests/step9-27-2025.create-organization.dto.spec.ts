import { validate } from 'class-validator';
import { CreateOrganizationRequestDto } from '../organization-request.dto';

describe('CreateOrganizationRequestDto', () => {
  describe('Step 09-27-2025.STEP10 - Category-based validation with conditional registered_name', () => {
    describe('INDIVIDUAL category validation', () => {
      it('should validate successfully for INDIVIDUAL category with all required fields including registered_name', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'John Doe Enterprises';
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.first_name = 'John';
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should validate successfully for INDIVIDUAL category without registered_name (optional)', async () => {
        const dto = new CreateOrganizationRequestDto();
        // dto.registered_name is not provided - should still validate for INDIVIDUAL
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.first_name = 'John';
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should fail validation when first_name is missing for INDIVIDUAL category', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'John Doe Enterprises';
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        // dto.first_name is missing - should fail
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.property === 'first_name')).toBe(true);
      });

      it('should fail validation when last_name is missing for INDIVIDUAL category', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'John Doe Enterprises';
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.first_name = 'John';
        // dto.last_name is missing - should fail
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.property === 'last_name')).toBe(true);
      });
    });

    describe('NON_INDIVIDUAL category validation', () => {
      it('should validate successfully for NON_INDIVIDUAL category with all required fields', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'ABC Corporation Inc.';
        dto.category = 'NON_INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should fail validation when registered_name is missing for NON_INDIVIDUAL category', async () => {
        const dto = new CreateOrganizationRequestDto();
        // dto.registered_name is missing - should fail for NON_INDIVIDUAL
        dto.category = 'NON_INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.property === 'registered_name')).toBe(true);
      });

      it('should validate successfully when first_name and last_name are not provided for NON_INDIVIDUAL category', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'ABC Corporation Inc.';
        dto.category = 'NON_INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('Common validation rules', () => {
      it('should fail validation when tin is missing', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'Test Organization';
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        // dto.tin is missing - should fail
        dto.registration_date = new Date('2024-01-01');
        dto.first_name = 'John';
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.property === 'tin')).toBe(true);
      });

      it('should fail validation when registration_date is missing', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'Test Organization';
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        // dto.registration_date is missing - should fail
        dto.first_name = 'John';
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(
          errors.some((error) => error.property === 'registration_date'),
        ).toBe(true);
      });

      it('should validate successfully with OrganizationOperation fields provided', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'Test Organization';
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.first_name = 'John';
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        // OrganizationOperation fields
        dto.fy_start = new Date('2024-01-01');
        dto.fy_end = new Date('2024-12-31');
        dto.vat_reg_effectivity = new Date('2024-01-01');
        dto.registration_effectivity = new Date('2024-01-01');
        dto.payroll_cut_off = ['15', '30'];
        dto.payment_cut_off = ['10', '25'];
        dto.quarter_closing = ['03-31', '06-30', '09-30', '12-31'];
        dto.has_foreign = false;
        dto.has_employees = true;
        dto.is_ewt = false;
        dto.is_fwt = false;
        dto.is_bir_withholding_agent = false;
        dto.accounting_method = 'ACCRUAL';

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should validate successfully without OrganizationOperation fields (they are optional)', async () => {
        const dto = new CreateOrganizationRequestDto();
        dto.registered_name = 'Test Organization';
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.first_name = 'John';
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        // OrganizationOperation fields are optional - not provided

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should validate successfully for INDIVIDUAL category without registered_name', async () => {
        const dto = new CreateOrganizationRequestDto();
        // registered_name not provided for INDIVIDUAL - should still validate
        dto.category = 'INDIVIDUAL';
        dto.tax_classification = 'VAT';
        dto.tin = '001234567890';
        dto.registration_date = new Date('2024-01-01');
        dto.first_name = 'John';
        dto.last_name = 'Doe';
        dto.line_of_business = '6201';
        dto.address_line = '123 Main Street';
        dto.region = 'NCR';
        dto.city = 'Makati';
        dto.zip_code = '1223';
        dto.rdo_code = '001';
        dto.contact_number = '+639123456789';
        dto.email_address = 'john.doe@example.com';
        dto.start_date = new Date('2024-01-01');

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });
  });
});
