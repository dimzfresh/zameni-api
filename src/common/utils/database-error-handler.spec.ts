import { ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseErrorHandler } from './database-error-handler';

describe('DatabaseErrorHandler', () => {
  describe('handle', () => {
    it('should throw ConflictException for unique constraint violation', () => {
      const error = { code: '23505', message: 'duplicate key value' };
      
      expect(() => {
        DatabaseErrorHandler.handle(error, 'создании пользователя');
      }).toThrow(ConflictException);
    });

    it('should throw BadRequestException for not null constraint violation', () => {
      const error = { code: '23502', message: 'null value in column' };
      
      expect(() => {
        DatabaseErrorHandler.handle(error, 'создании пользователя');
      }).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for foreign key violation', () => {
      const error = { code: '23503', message: 'foreign key violation' };
      
      expect(() => {
        DatabaseErrorHandler.handle(error, 'удалении пользователя');
      }).toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException for connection refused', () => {
      const error = { code: 'ECONNREFUSED', message: 'connection refused' };
      
      expect(() => {
        DatabaseErrorHandler.handle(error, 'подключении к БД');
      }).toThrow(InternalServerErrorException);
    });

    it('should re-throw existing custom exceptions', () => {
      const customError = new ConflictException('Custom error');
      
      expect(() => {
        DatabaseErrorHandler.handle(customError, 'операции');
      }).toThrow(ConflictException);
    });

    it('should throw BadRequestException for unknown errors', () => {
      const error = { code: 'UNKNOWN', message: 'unknown error' };
      
      expect(() => {
        DatabaseErrorHandler.handle(error, 'тестовой операции');
      }).toThrow(BadRequestException);
    });
  });

  describe('isDatabaseError', () => {
    it('should return true for PostgreSQL constraint violations', () => {
      const error = { code: '23505' };
      expect(DatabaseErrorHandler.isDatabaseError(error)).toBe(true);
    });

    it('should return true for PostgreSQL syntax errors', () => {
      const error = { code: '42703' };
      expect(DatabaseErrorHandler.isDatabaseError(error)).toBe(true);
    });

    it('should return true for connection errors', () => {
      const error = { code: 'ECONNREFUSED' };
      expect(DatabaseErrorHandler.isDatabaseError(error)).toBe(true);
    });

    it('should return false for non-database errors', () => {
      const error = { code: 'CUSTOM_ERROR' };
      expect(DatabaseErrorHandler.isDatabaseError(error)).toBe(false);
    });

    it('should return false for errors without code', () => {
      const error = { message: 'Some error' };
      expect(DatabaseErrorHandler.isDatabaseError(error)).toBe(false);
    });
  });
});
