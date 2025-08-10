# Управление администраторами

## Создание первого администратора

### Способ 1: Через скрипт (рекомендуется)

```bash
# Создать первого администратора
npm run create:admin
```

Скрипт создаст администратора с данными:
- Email: `admin@zameni.com`
- Пароль: `admin123456`
- Роль: `ADMIN`
- Статус: `ACTIVE`

### Способ 2: Через API (требует существующего админа)

```bash
# Сначала залогиниться как админ
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@zameni.com", "password": "admin123456"}'

# Затем назначить другого пользователя администратором
curl -X POST http://localhost:3000/admin/users/123/make-admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Административные endpoints

### Получение списка пользователей
```bash
GET /admin/users?page=1&limit=10
```

### Поиск пользователей
```bash
GET /admin/users/search?q=john&page=1&limit=10
```

### Фильтрация по роли
```bash
GET /admin/users/role/USER?page=1&limit=10
GET /admin/users/role/ADMIN?page=1&limit=10
```

### Фильтрация по статусу
```bash
GET /admin/users/status/ACTIVE?page=1&limit=10
GET /admin/users/status/BANNED?page=1&limit=10
```

### Управление ролями
```bash
# Назначить администратором
POST /admin/users/123/make-admin

# Убрать права администратора
POST /admin/users/123/remove-admin

# Изменить роль напрямую
PUT /admin/users/123/role/USER
PUT /admin/users/123/role/ADMIN
```

### Управление статусами
```bash
# Заблокировать пользователя
POST /admin/users/123/ban

# Разблокировать пользователя
POST /admin/users/123/unban

# Изменить статус напрямую
PUT /admin/users/123/status/ACTIVE
PUT /admin/users/123/status/BANNED
```

### Статистика
```bash
GET /admin/statistics
```

## Безопасность

### Защита от удаления последнего администратора
Система автоматически предотвращает удаление последнего администратора. При попытке убрать права у последнего админа будет возвращена ошибка 400.

### Авторизация
Все административные endpoints требуют:
1. JWT токен (авторизация)
2. Роль ADMIN (авторизация)

### Логирование
Все административные действия логируются для аудита.

## Рекомендации

1. **Измените пароль по умолчанию** после первого входа
2. **Создайте несколько администраторов** для резервирования
3. **Регулярно проверяйте логи** административных действий
4. **Используйте сложные пароли** для административных аккаунтов
5. **Ограничьте доступ** к административным endpoints по IP в продакшене

## Мониторинг

### Проверка количества администраторов
```bash
curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Просмотр всех администраторов
```bash
curl -X GET http://localhost:3000/admin/users/role/ADMIN \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
