import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Обработчик ошибок базы данных PostgreSQL
 * Преобразует технические ошибки БД в понятные пользователю сообщения
 */
export class DatabaseErrorHandler {
  /**
   * Обрабатывает ошибки базы данных и преобразует их в соответствующие исключения
   */
  static handle(error: any, operation: string): never {
    console.error(`Ошибка базы данных при ${operation}:`, error);

    // Если это уже наше кастомное исключение, пробрасываем его
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof InternalServerErrorException
    ) {
      throw error;
    }

    // Обработка специфических ошибок PostgreSQL
    switch (error.code) {
      case '23505': // unique_violation
        throw new ConflictException('Запись с такими данными уже существует');

      case '23502': // not_null_violation
        throw new BadRequestException('Не все обязательные поля заполнены');

      case '23503': // foreign_key_violation
        throw new BadRequestException(
          'Нельзя выполнить операцию из-за связанных данных',
        );

      case '23514': // check_violation
        throw new BadRequestException('Данные не соответствуют ограничениям');

      case '42P01': // undefined_table
        throw new InternalServerErrorException(
          'Ошибка конфигурации базы данных',
        );

      case '42703': // undefined_column
        throw new InternalServerErrorException('Ошибка структуры базы данных');

      case 'ECONNREFUSED':
        throw new InternalServerErrorException(
          'Не удается подключиться к базе данных',
        );

      case 'ENOTFOUND':
        throw new InternalServerErrorException('База данных недоступна');

      default:
        // Для неизвестных ошибок возвращаем общее сообщение
        throw new BadRequestException(
          `Ошибка при выполнении операции "${operation}". Попробуйте позже.`,
        );
    }
  }

  /**
   * Проверяет, является ли ошибка ошибкой базы данных
   */
  static isDatabaseError(error: any): boolean {
    if (!error || !error.code) {
      return false;
    }

    return (
      error.code.startsWith('23') || // PostgreSQL constraint violations
      error.code.startsWith('42') || // PostgreSQL syntax errors
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND'
    );
  }

  /**
   * Логирует ошибку для отладки
   */
  static logError(error: any, operation: string, context?: any): void {
    console.error(`[Database Error] ${operation}:`, {
      code: error.code,
      message: error.message,
      detail: error.detail,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
