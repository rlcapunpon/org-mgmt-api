import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidateIf,
} from 'class-validator';
import { Category } from '@prisma/client';

interface ValidationObject {
  category?: Category;
}

export function IsRequiredForIndividual(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredForIndividual',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as ValidationObject;
          const category = obj.category;

          // If category is INDIVIDUAL, this field is required
          if (category === Category.INDIVIDUAL) {
            return value !== null && value !== undefined && value !== '';
          }

          // If category is not INDIVIDUAL, this field is optional
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is required when category is INDIVIDUAL`;
        },
      },
    });
  };
}

export function IsRequiredForNonIndividual(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredForNonIndividual',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as ValidationObject;
          const category = obj.category;

          // If category is NON_INDIVIDUAL, this field is required
          if (category === Category.NON_INDIVIDUAL) {
            return value !== null && value !== undefined && value !== '';
          }

          // If category is not NON_INDIVIDUAL, this field is optional
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is required when category is NON_INDIVIDUAL`;
        },
      },
    });
  };
}

// Conditional validation decorators that combine requirement and type validation
export function IsStringForIndividual(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    // First apply the conditional requirement
    IsRequiredForIndividual(validationOptions)(object, propertyName);

    // Then apply string validation only when required
    ValidateIf((obj: ValidationObject) => obj.category === Category.INDIVIDUAL)(
      object,
      propertyName,
    );
    // Note: @IsString() should be applied separately in the DTO
  };
}

export function IsStringForNonIndividual(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    // First apply the conditional requirement
    IsRequiredForNonIndividual(validationOptions)(object, propertyName);

    // Then apply string validation only when required
    ValidateIf(
      (obj: ValidationObject) => obj.category === Category.NON_INDIVIDUAL,
    )(object, propertyName);
    // Note: @IsString() should be applied separately in the DTO
  };
}
