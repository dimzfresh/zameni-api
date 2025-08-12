import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Простой валидатор для номеров телефонов
 * Принимает только цифры, длина от 7 до 15 символов
 * Не зависит от региона или страны
 */
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null || value === '') {
            return true; // Пропускаем пустые значения (для опциональных полей)
          }

          if (typeof value !== 'string') {
            return false;
          }

          // Убираем все пробелы, скобки, дефисы и плюсы
          const cleanPhone = value.replace(/[\s\(\)\-\+]/g, '');

          // Проверяем, что остались только цифры
          if (!/^\d+$/.test(cleanPhone)) {
            return false;
          }

          // Проверяем длину (от 7 до 15 цифр)
          if (cleanPhone.length < 7 || cleanPhone.length > 15) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} должен содержать от 7 до 15 цифр`;
        },
      },
    });
  };
}

/**
 * Валидатор для номера телефона как числа
 * Принимает только цифры, без форматирования
 */
export function IsPhoneNumberAsNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumberAsNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null || value === '') {
            return true;
          }

          // Принимаем как строку, так и число
          const phoneStr = String(value);

          // Проверяем, что содержит только цифры
          if (!/^\d+$/.test(phoneStr)) {
            return false;
          }

          // Проверяем длину (от 7 до 15 цифр)
          if (phoneStr.length < 7 || phoneStr.length > 15) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} должен быть числом от 7 до 15 цифр`;
        },
      },
    });
  };
}

/**
 * Валидатор для простых номеров (только цифры, без форматирования)
 */
export function IsDigitsOnly(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDigitsOnly',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null || value === '') {
            return true;
          }

          if (typeof value !== 'string') {
            return false;
          }

          // Проверяем, что строка содержит только цифры
          return /^\d+$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} должен содержать только цифры`;
        },
      },
    });
  };
}

/**
 * Валидатор для номеров с минимальной длиной
 */
export function IsPhoneNumberWithMinLength(
  minLength: number = 7,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumberWithMinLength',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value === undefined || value === null || value === '') {
            return true;
          }

          if (typeof value !== 'string') {
            return false;
          }

          // Убираем все пробелы, скобки, дефисы и плюсы
          const cleanPhone = value.replace(/[\s\(\)\-\+]/g, '');

          // Проверяем, что остались только цифры
          if (!/^\d+$/.test(cleanPhone)) {
            return false;
          }

          // Проверяем минимальную длину
          if (cleanPhone.length < minLength) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} должен быть валидным номером телефона с минимум ${minLength} цифрами`;
        },
      },
    });
  };
}
