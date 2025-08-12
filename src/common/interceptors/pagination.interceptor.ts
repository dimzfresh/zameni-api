import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PAGINATION } from '../constants/app.constants';

/**
 * Интерцептор для валидации и ограничения параметров пагинации
 * Автоматически применяет ограничения и валидирует запросы
 */
@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const query = request.query;

    // Проверяем только если есть параметры пагинации
    if (query.page || query.limit) {
      this.validatePaginationParams(query);
    }

    return next.handle();
  }

  /**
   * Валидирует параметры пагинации и применяет ограничения
   */
  private validatePaginationParams(query: any): void {
    const page = this.parseAndValidateNumber(
      query.page,
      'page',
      PAGINATION.MIN_LIMIT,
      PAGINATION.MAX_PAGE,
      PAGINATION.DEFAULT_PAGE,
    );
    const limit = this.parseAndValidateNumber(
      query.limit,
      'limit',
      PAGINATION.MIN_LIMIT,
      PAGINATION.MAX_LIMIT,
      PAGINATION.DEFAULT_LIMIT,
    );

    // Проверяем общий объем запрашиваемых данных
    const totalItems = page * limit;
    const MAX_TOTAL_ITEMS = 1000000; // 1 миллион элементов

    if (totalItems > MAX_TOTAL_ITEMS) {
      throw new BadRequestException(
        `Запрос слишком большой. Максимально допустимый объем: ${MAX_TOTAL_ITEMS.toLocaleString()} элементов. ` +
          `Текущий запрос: ${totalItems.toLocaleString()} элементов (страница ${page}, лимит ${limit})`,
      );
    }

    // Обновляем query с валидированными значениями
    query.page = page;
    query.limit = limit;
  }

  /**
   * Парсит и валидирует числовое значение
   */
  private parseAndValidateNumber(
    value: any,
    fieldName: string,
    min: number,
    max: number,
    defaultValue: number,
  ): number {
    if (value === undefined || value === null) {
      return defaultValue;
    }

    const num = parseInt(value, 10);

    if (isNaN(num)) {
      throw new BadRequestException(`${fieldName} должен быть числом`);
    }

    if (num < min) {
      throw new BadRequestException(`${fieldName} не может быть меньше ${min}`);
    }

    if (num > max) {
      throw new BadRequestException(`${fieldName} не может быть больше ${max}`);
    }

    return num;
  }
}
