import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PAGINATION } from '../constants/app.constants';

/**
 * DTO для валидации параметров пагинации в query string
 * Защищает от перегрузки системы при запросах с большими значениями
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    minimum: PAGINATION.MIN_LIMIT,
    maximum: PAGINATION.MAX_PAGE,
    default: PAGINATION.DEFAULT_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Номер страницы должен быть целым числом' })
  @Min(PAGINATION.MIN_LIMIT, { message: `Номер страницы не может быть меньше ${PAGINATION.MIN_LIMIT}` })
  @Max(PAGINATION.MAX_PAGE, { message: `Номер страницы не может быть больше ${PAGINATION.MAX_PAGE}` })
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 10,
    minimum: PAGINATION.MIN_LIMIT,
    maximum: PAGINATION.MAX_LIMIT,
    default: PAGINATION.DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Количество элементов должно быть целым числом' })
  @Min(PAGINATION.MIN_LIMIT, { message: `Количество элементов не может быть меньше ${PAGINATION.MIN_LIMIT}` })
  @Max(PAGINATION.MAX_LIMIT, { message: `Количество элементов не может быть больше ${PAGINATION.MAX_LIMIT}` })
  limit?: number = PAGINATION.DEFAULT_LIMIT;

  /**
   * Получает валидированные параметры пагинации
   */
  getPaginationParams(): { page: number; limit: number; offset: number } {
    const page = Math.max(PAGINATION.MIN_LIMIT, Math.min(PAGINATION.MAX_PAGE, this.page || PAGINATION.DEFAULT_PAGE));
    const limit = Math.max(PAGINATION.MIN_LIMIT, Math.min(PAGINATION.MAX_LIMIT, this.limit || PAGINATION.DEFAULT_LIMIT));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Проверяет, не превышает ли запрос максимально допустимый объем данных
   */
  isRequestTooLarge(): boolean {
    const { page, limit } = this.getPaginationParams();
    const totalItems = page * limit;
    
    // Если запрашивается больше 1 миллиона элементов - считаем запрос слишком большим
    const MAX_TOTAL_ITEMS = 1000000;
    return totalItems > MAX_TOTAL_ITEMS;
  }
}
