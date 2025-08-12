# REG.RU CloudVPS Integration

Документация по интеграции с REG.RU CloudVPS для автоматического управления серверами и DNS.

## Обзор

REG.RU CloudVPS предоставляет API для управления виртуальными серверами (reglets), снапшотами, SSH ключами и другими ресурсами. Наша интеграция включает:

- Автоматическое управление DNS записями
- Создание и управление снапшотами
- Мониторинг серверов
- Автоматическое подключение к серверам с динамическими IP

## API возможности

Полная документация API доступна в интерактивном режиме: [https://api.cloudvps.reg.ru/v1/ui/](https://api.cloudvps.reg.ru/v1/ui/)

### Основные эндпоинты

- `GET /account` - Информация об аккаунте и балансе
- `GET /account/keys` - Список SSH ключей
- `GET /account/billing` - История биллинга
- `GET /prices` - Тарифы и цены
- `GET /reglets` - Список серверов
- `GET /reglets/{id}` - Информация о сервере
- `POST /reglets/{id}/actions` - Выполнение действий (снапшоты, перезагрузка)
- `GET /reglets/{id}/snapshots` - Список снапшотов сервера

## Скрипты

### Основные скрипты

#### `scripts/regru-cloudvps-api.sh`
Интерактивный менеджер для работы с API:
```bash
./scripts/regru-cloudvps-api.sh
```

Функции:
- Аутентификация с API токеном
- Просмотр баланса и истории биллинга
- Управление серверами и снапшотами
- Просмотр SSH ключей

#### `scripts/test-regru-api.sh`
Тестирование API эндпоинтов:
```bash
./scripts/test-regru-api.sh
```

#### `scripts/ssh-connect.sh`
Автоматическое подключение к серверу с динамическим IP:
```bash
./scripts/ssh-connect.sh [SERVER_ID] [USER] [SSH_KEY]
```

### DNS скрипты

#### `scripts/setup-regru-dns.sh`
Настройка DNS записей через REG.RU API:
```bash
./scripts/setup-regru-dns.sh
```

#### `scripts/update-dns-regru.sh`
Обновление DNS записи:
```bash
./scripts/update-dns-regru.sh [DOMAIN] [SUBDOMAIN]
```

### SSL скрипты

#### `scripts/setup-ssl-regru.sh`
Настройка SSL сертификатов Let's Encrypt:
```bash
./scripts/setup-ssl-regru.sh
```

### SSH скрипты

#### `scripts/setup-ssh-config.sh`
Настройка SSH конфигурации для динамических IP:
```bash
./scripts/setup-ssh-config.sh
```

## Настройка

### 1. Получение API токена

1. Войдите в [REG.RU CloudVPS](https://cloudvps.reg.ru)
2. Перейдите в раздел "Account" → "API Keys"
3. Создайте новый API ключ
4. Скопируйте токен

### 2. Аутентификация

```bash
./scripts/regru-cloudvps-api.sh
# Выберите опцию 1 (Authenticate)
# Введите ваш API токен
```

### 3. Настройка DNS

```bash
./scripts/setup-regru-dns.sh
# Следуйте инструкциям для настройки домена
```

### 4. Настройка SSL

```bash
./scripts/setup-ssl-regru.sh
# Введите домен и поддомен
```

## Автоматизация

### Cron задачи

DNS обновление каждые 5 минут:
```bash
*/5 * * * * /path/to/scripts/update-dns-regru.sh
```

SSL обновление ежедневно:
```bash
0 12 * * * /usr/bin/certbot renew
```

### GitHub Actions

Настроены автоматические workflows:
- `deploy.yml` - Автоматический деплой при push в main
- `deploy-job.yml` - Ручной деплой с выбором окружения
- `rollback-job.yml` - Откат к предыдущей версии
- `monitor-job.yml` - Мониторинг сервера каждые 6 часов

## Устранение неполадок

### Проблемы с API

1. **401 Unauthorized**: Проверьте правильность API токена
2. **404 Not Found**: Проверьте правильность эндпоинта
3. **403 Forbidden**: Проверьте права доступа токена

### Проблемы с DNS

1. Проверьте логи: `tail -f /var/log/regru-dns.log`
2. Проверьте конфигурацию: `cat ~/.config/regru-dns/config.env`
3. Тестируйте вручную: `./scripts/update-dns-regru.sh`

### Проблемы с SSH

1. Проверьте SSH ключ: `ssh-keygen -l -f ~/.ssh/id_rsa`
2. Проверьте права: `chmod 600 ~/.ssh/id_rsa`
3. Тестируйте подключение: `./scripts/ssh-connect.sh`

## Безопасность

- API токены хранятся в `~/.regru-cloudvps-token` с правами 600
- SSH ключи должны иметь права 600
- DNS конфигурация хранится в `~/.config/regru-dns/` с правами 600
- Все скрипты используют HTTPS для API запросов

## Мониторинг

### Логи

- DNS обновления: `/var/log/regru-dns.log`
- SSL обновления: `/var/log/letsencrypt/`
- Docker контейнеры: `docker-compose logs`

### Уведомления

Настроены Telegram уведомления для:
- Успешных деплоев
- Ошибок деплоя
- Отчетов мониторинга
- Откатов

## Ссылки

- [REG.RU CloudVPS API Documentation](https://developers.cloudvps.reg.ru/)
- [Interactive API UI](https://api.cloudvps.reg.ru/v1/ui/)
- [SSH Keys Management](https://developers.cloudvps.reg.ru/ssh-keys/list.html)
