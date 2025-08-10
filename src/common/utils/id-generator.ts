import { ID_GENERATION } from '../constants/app.constants';

/**
 * Утилиты для генерации уникальных идентификаторов
 */
export class IdGenerator {
  /**
   * Генерирует уникальный ID для запроса
   */
  static generateRequestId(): string {
    return `${ID_GENERATION.REQUEST_ID_PREFIX}_${Date.now()}_${this.generateRandomSuffix()}`;
  }

  /**
   * Генерирует уникальный ID для сообщения в очереди
   */
  static generateMessageId(): string {
    return `${ID_GENERATION.MESSAGE_ID_PREFIX}_${Date.now()}_${this.generateRandomSuffix()}`;
  }

  /**
   * Генерирует случайный суффикс для ID
   */
  private static generateRandomSuffix(): string {
    return Math.random()
      .toString(ID_GENERATION.BASE_36)
      .substr(2, ID_GENERATION.RANDOM_SUFFIX_LENGTH);
  }

  /**
   * Генерирует уникальный ID с кастомным префиксом
   */
  static generateCustomId(prefix: string): string {
    return `${prefix}_${Date.now()}_${this.generateRandomSuffix()}`;
  }
}
