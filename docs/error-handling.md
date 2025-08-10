# Обработка ошибок в Zameni API

## Обзор

В нашем API реализована комплексная система обработки ошибок, которая обеспечивает:

- **Понятные сообщения** для пользователей
- **Детальное логирование** для разработчиков
- **Типобезопасность** с TypeScript
- **Единообразную обработку** ошибок базы данных

## Типы ошибок

### 1. HTTP Исключения NestJS

```typescript
import { 
  BadRequestException,      // 400 - Неверный запрос
  UnauthorizedException,    // 401 - Не авторизован
  ForbiddenException,       // 403 - Доступ запрещен
  NotFoundException,        // 404 - Не найдено
  ConflictException,        // 409 - Конфликт данных
  InternalServerErrorException // 500 - Внутренняя ошибка сервера
} from '@nestjs/common';
```

### 2. Ошибки базы данных PostgreSQL

| Код ошибки | Описание | HTTP Статус |
|------------|----------|-------------|
| `23505` | Нарушение уникальности | 409 Conflict |
| `23502` | Нарушение NOT NULL | 400 Bad Request |
| `23503` | Нарушение внешнего ключа | 400 Bad Request |
| `23514` | Нарушение CHECK | 400 Bad Request |
| `42P01` | Неопределенная таблица | 500 Internal Server Error |
| `42703` | Неопределенная колонка | 500 Internal Server Error |
| `ECONNREFUSED` | Отказ в подключении | 500 Internal Server Error |

## DatabaseErrorHandler

Централизованный обработчик ошибок базы данных:

```typescript
import { DatabaseErrorHandler } from '../common/utils/database-error-handler';

try {
  const user = await this.userRepository.save(newUser);
  return user;
} catch (error) {
  // Если это наша кастомная ошибка, пробрасываем её
  if (error instanceof ConflictException) {
    throw error;
  }
  
  // Обрабатываем ошибки базы данных
  DatabaseErrorHandler.handle(error, 'создании пользователя');
}
```

### Методы DatabaseErrorHandler

#### `handle(error, operation)`
Преобразует технические ошибки БД в понятные исключения.

#### `isDatabaseError(error)`
Проверяет, является ли ошибка ошибкой базы данных.

#### `logError(error, operation, context?)`
Логирует ошибку с дополнительным контекстом.

## Примеры использования

### Создание пользователя

```typescript
async create(registerDto: RegisterDto): Promise<User> {
  try {
    // Проверка существования пользователя
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Создание пользователя
    const user = this.userRepository.create(registerDto);
    const savedUser = await this.userRepository.save(user);
    
    if (!savedUser) {
      throw new BadRequestException('Не удалось создать пользователя');
    }

    return savedUser;
  } catch (error) {
    // Обработка кастомных ошибок
    if (error instanceof ConflictException || error instanceof BadRequestException) {
      throw error;
    }
    
    // Обработка ошибок БД
    DatabaseErrorHandler.handle(error, 'создании пользователя');
  }
}
```

### Обновление пользователя

```typescript
async update(id: number, updateData: Partial<User>): Promise<User> {
  try {
    const user = await this.findById(id); // Может выбросить NotFoundException
    
    // Проверка уникальности email
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }
    }

    Object.assign(user, updateData);
    const updatedUser = await this.userRepository.save(user);
    
    if (!updatedUser) {
      throw new BadRequestException('Не удалось обновить пользователя');
    }

    return updatedUser;
  } catch (error) {
    if (error instanceof NotFoundException || 
        error instanceof ConflictException || 
        error instanceof BadRequestException) {
      throw error;
    }
    
    DatabaseErrorHandler.handle(error, 'обновлении пользователя');
  }
}
```

## Логирование ошибок

Все ошибки базы данных автоматически логируются с контекстом:

```typescript
// Пример лога
[Database Error] создании пользователя: {
  code: '23505',
  message: 'duplicate key value violates unique constraint',
  detail: 'Key (email)=(test@example.com) already exists.',
  context: { email: 'test@example.com' },
  timestamp: '2024-01-01T12:00:00.000Z'
}
```

## Тестирование обработки ошибок

```typescript
describe('UsersService', () => {
  it('should handle database constraint violations', async () => {
    // Симулируем ошибку уникальности
    jest.spyOn(userRepository, 'save').mockRejectedValue({
      code: '23505',
      message: 'duplicate key value'
    });

    await expect(service.create(registerDto))
      .rejects
      .toThrow(ConflictException);
  });
});
```

## Лучшие практики

1. **Всегда используйте try-catch** для операций с базой данных
2. **Проверяйте результат** операций сохранения
3. **Логируйте ошибки** для отладки
4. **Возвращайте понятные сообщения** пользователям
5. **Не раскрывайте технические детали** в продакшене
6. **Используйте типизированные исключения** NestJS

## Мониторинг ошибок

Для продакшена рекомендуется:

- Интеграция с системами мониторинга (Sentry, DataDog)
- Алерты на критические ошибки БД
- Метрики по типам ошибок
- Автоматическое восстановление после сбоев БД
