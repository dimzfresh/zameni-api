import { validate } from 'class-validator';
import {
  IsPhoneNumber,
  IsDigitsOnly,
  IsPhoneNumberWithMinLength,
} from './phone.validator';

class TestPhoneDto {
  @IsPhoneNumber()
  phone: string;
}

class TestDigitsOnlyDto {
  @IsDigitsOnly()
  phone: string;
}

class TestMinLengthDto {
  @IsPhoneNumberWithMinLength(10)
  phone: string;
}

describe('Phone Validators', () => {
  describe('IsPhoneNumber', () => {
    it('should validate Russian phone numbers', async () => {
      const dto = new TestPhoneDto();

      // Валидные номера
      dto.phone = '+7 (999) 123-45-67';
      let errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '8 (999) 123-45-67';
      errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '+79991234567';
      errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '89991234567';
      errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '9991234567';
      errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate international phone numbers', async () => {
      const dto = new TestPhoneDto();

      dto.phone = '+1234567890';
      let errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '+44 20 7946 0958';
      errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '+1-555-123-4567';
      errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid phone numbers', async () => {
      const dto = new TestPhoneDto();

      // Слишком короткий
      dto.phone = '123456';
      let errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      // Слишком длинный
      dto.phone = '+12345678901234567890';
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      // Содержит буквы
      dto.phone = '+7 (999) ABC-45-67';
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      // Содержит специальные символы
      dto.phone = '+7 (999) 123-45-67!';
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow empty values for optional fields', async () => {
      const dto = new TestPhoneDto();

      dto.phone = '';
      let errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = undefined;
      errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = null;
      errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('IsDigitsOnly', () => {
    it('should validate digits only', async () => {
      const dto = new TestDigitsOnlyDto();

      dto.phone = '1234567890';
      let errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '9991234567';
      errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject non-digits', async () => {
      const dto = new TestDigitsOnlyDto();

      dto.phone = '123-456-7890';
      let errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      dto.phone = '+1234567890';
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      dto.phone = '123 456 7890';
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('IsPhoneNumberWithMinLength', () => {
    it('should validate minimum length', async () => {
      const dto = new TestMinLengthDto();

      dto.phone = '1234567890'; // 10 цифр
      let errors = await validate(dto);
      expect(errors).toHaveLength(0);

      dto.phone = '12345678901'; // 11 цифр
      errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject numbers shorter than minimum', async () => {
      const dto = new TestMinLengthDto();

      dto.phone = '123456789'; // 9 цифр
      let errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      dto.phone = '12345678'; // 8 цифр
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
