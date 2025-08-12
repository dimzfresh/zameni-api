# GitHub Actions Setup

Документация по настройке автоматического деплоя и мониторинга через GitHub Actions.

## Обзор

Настроены 4 основных workflow для автоматизации:

1. **deploy.yml** - Автоматический деплой при push в main
2. **deploy-job.yml** - Ручной деплой с выбором окружения
3. **rollback-job.yml** - Откат к предыдущей версии
4. **monitor-job.yml** - Мониторинг сервера каждые 6 часов

## Предварительные требования

### 1. Сервер подготовлен

- Ubuntu сервер с Docker и Docker Compose
- SSH доступ настроен
- Приложение развернуто в `/opt/zameni-api`

### 2. Домен настроен

- DNS записи настроены
- SSL сертификаты установлены
- Nginx настроен как reverse proxy

### 3. Telegram бот (опционально)

Для уведомлений создайте Telegram бота:
1. Напишите @BotFather в Telegram
2. Создайте нового бота: `/newbot`
3. Получите токен бота
4. Добавьте бота в чат и получите chat_id

## Настройка GitHub Secrets

### Обязательные секреты

Перейдите в ваш GitHub репозиторий → Settings → Secrets and variables → Actions

#### `SERVER_HOST`
IP адрес или домен вашего сервера
```
192.168.1.100
# или
api.zameni.app
```

#### `SSH_USER`
Пользователь для SSH подключения
```
root
```

#### `SSH_PRIVATE_KEY`
Приватный SSH ключ (весь ключ включая заголовки)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...
-----END OPENSSH PRIVATE KEY-----
```

#### `DOMAIN`
Основной домен приложения
```
api.zameni.app
```

### Опциональные секреты (для уведомлений)

#### `TELEGRAM_BOT_TOKEN`
Токен вашего Telegram бота
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

#### `TELEGRAM_CHAT_ID`
ID чата для уведомлений
```
-1001234567890
```

## Workflows

### 1. deploy.yml - Автоматический деплой

**Триггер**: Push в ветку `main`

**Действия**:
1. Проверка кода
2. Установка зависимостей
3. Запуск тестов
4. Сборка приложения
5. Деплой на сервер
6. Проверка здоровья
7. Уведомление в Telegram

**Использование**:
```bash
git push origin main
```

### 2. deploy-job.yml - Ручной деплой

**Триггер**: Ручной запуск (workflow_dispatch)

**Параметры**:
- `environment`: production/staging/development
- `force_rebuild`: true/false

**Действия**:
1. Проверка кода
2. Установка зависимостей
3. Запуск тестов
4. Сборка приложения
5. Деплой на выбранное окружение
6. Проверка здоровья
7. Уведомление в Telegram

**Использование**:
1. GitHub → Actions → Manual Deploy Job
2. Выберите окружение
3. Выберите force rebuild (опционально)
4. Нажмите "Run workflow"

### 3. rollback-job.yml - Откат

**Триггер**: Ручной запуск (workflow_dispatch)

**Параметры**:
- `commit_hash`: хеш коммита для отката
- `environment`: production/staging/development

**Действия**:
1. Переключение на указанный коммит
2. Проверка кода
3. Установка зависимостей
4. Запуск тестов
5. Сборка приложения
6. Откат на сервере
7. Проверка здоровья
8. Уведомление в Telegram

**Использование**:
1. GitHub → Actions → Rollback Job
2. Введите хеш коммита
3. Выберите окружение
4. Нажмите "Run workflow"

### 4. monitor-job.yml - Мониторинг

**Триггер**: 
- Ручной запуск (workflow_dispatch)
- Автоматически каждые 6 часов (cron)

**Действия**:
1. Проверка использования диска
2. Проверка использования памяти
3. Проверка загрузки CPU
4. Проверка статуса Docker контейнеров
5. Проверка логов на ошибки
6. Проверка здоровья приложения
7. Отправка отчета в Telegram

**Использование**:
- Автоматически каждые 6 часов
- Ручной запуск: GitHub → Actions → Monitor Job → Run workflow

## Настройка на сервере

### 1. Подготовка директории

```bash
sudo mkdir -p /opt/zameni-api
sudo chown $USER:$USER /opt/zameni-api
cd /opt/zameni-api
```

### 2. Клонирование репозитория

```bash
git clone https://github.com/your-username/zameni-api.git .
```

### 3. Настройка окружения

```bash
cp .env.example .env.production
# Отредактируйте .env.production
```

### 4. Первый запуск

```bash
docker-compose -f docker-compose.production.yml up -d --build
```

## Устранение неполадок

### Проблемы с SSH

1. **Permission denied**:
   ```bash
   chmod 600 ~/.ssh/id_rsa
   ```

2. **Host key verification failed**:
   ```bash
   ssh-keygen -R your-server-ip
   ```

3. **Connection timeout**:
   - Проверьте firewall на сервере
   - Проверьте правильность IP/домена

### Проблемы с деплоем

1. **Docker build failed**:
   - Проверьте Dockerfile
   - Проверьте зависимости в package.json

2. **Health check failed**:
   - Проверьте логи: `docker-compose logs`
   - Проверьте конфигурацию nginx
   - Проверьте SSL сертификаты

3. **Permission denied on server**:
   ```bash
   sudo chown -R $USER:$USER /opt/zameni-api
   ```

### Проблемы с уведомлениями

1. **Telegram bot not working**:
   - Проверьте правильность токена
   - Проверьте chat_id
   - Убедитесь, что бот добавлен в чат

2. **Notifications not sent**:
   - Проверьте GitHub Secrets
   - Проверьте права доступа к secrets

## Безопасность

### SSH ключи

- Используйте SSH ключи вместо паролей
- Храните приватные ключи в GitHub Secrets
- Регулярно ротируйте ключи

### Секреты

- Никогда не коммитьте секреты в код
- Используйте GitHub Secrets для всех чувствительных данных
- Регулярно обновляйте токены и ключи

### Сервер

- Настройте firewall (ufw)
- Используйте не-root пользователя
- Регулярно обновляйте систему

## Мониторинг и логи

### GitHub Actions логи

- GitHub → Actions → [Workflow] → [Run] → Jobs
- Логи каждого шага доступны для просмотра

### Серверные логи

```bash
# Docker логи
docker-compose -f docker-compose.production.yml logs

# Nginx логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Системные логи
sudo journalctl -u docker
sudo journalctl -u nginx
```

### Telegram уведомления

Настройте уведомления для:
- Успешных деплоев
- Ошибок деплоя
- Отчетов мониторинга
- Откатов

## Расширение

### Добавление новых окружений

1. Создайте `docker-compose.staging.yml`
2. Добавьте окружение в deploy-job.yml
3. Настройте соответствующие secrets

### Добавление новых проверок

1. Добавьте шаги в monitor-job.yml
2. Настройте соответствующие уведомления

### Интеграция с другими сервисами

- Slack уведомления
- Email уведомления
- Webhook уведомления
- Интеграция с мониторинг системами
