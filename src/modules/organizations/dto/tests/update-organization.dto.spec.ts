import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateOrganizationDto } from '../update-organization.dto';
import { Category, SubCategory, TaxClassification } from '@prisma/client';

describe('UpdateOrganizationDto', () => {
  let dto: UpdateOrganizationDto;

  beforeEach(() => {
    dto = new UpdateOrganizationDto();
  });

  it('should pass when all fields are undefined (empty update)', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass when name is provided and valid', async () => {
    dto.name = 'Updated Corporation Name';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when name is not a string', async () => {
    (dto as any).name = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass when category is valid enum value', async () => {
    dto.category = Category.INDIVIDUAL;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when category is invalid enum value', async () => {
    (dto as any).category = 'INVALID_CATEGORY';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });

  it('should pass when subcategory is valid enum value', async () => {
    dto.subcategory = SubCategory.SELF_EMPLOYED;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when subcategory is invalid enum value', async () => {
    (dto as any).subcategory = 'INVALID_SUBCATEGORY';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });

  it('should pass when tax_classification is valid enum value', async () => {
    dto.tax_classification = TaxClassification.VAT;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when tax_classification is invalid enum value', async () => {
    (dto as any).tax_classification = 'INVALID_CLASSIFICATION';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });

  it('should pass when tin is provided as string', async () => {
    dto.tin = '123-456-789-000';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when tin is not a string', async () => {
    (dto as any).tin = 123456789;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass when address is provided as string', async () => {
    dto.address = '123 Main Street, City, Province 1234';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when address is not a string', async () => {
    (dto as any).address = 12345;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass when registration_date is provided as valid date', async () => {
    dto.registration_date = new Date('2025-01-01');

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass when registration_date is provided as string and transformed', async () => {
    const plainObject = {
      registration_date: '2025-01-01',
    };

    const transformedDto = plainToClass(UpdateOrganizationDto, plainObject);
    const errors = await validate(transformedDto);

    expect(errors.length).toBe(0);
    expect(transformedDto.registration_date).toBeInstanceOf(Date);
  });

  it('should pass when multiple fields are provided', async () => {
    dto.name = 'Updated Name';
    dto.category = Category.NON_INDIVIDUAL;
    dto.subcategory = SubCategory.CORPORATION;
    dto.tax_classification = TaxClassification.VAT;
    dto.tin = '123-456-789-000';
    dto.address = 'New Address';
    dto.registration_date = new Date('2025-01-01');

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});