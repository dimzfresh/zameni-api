# Управление базой данных

## 📊 Информация о подключении

- **Хост**: localhost
- **Порт**: 5432
- **База данных**: zameni_db
- **Пользователь**: postgres
- **Пароль**: password
- **URL**: postgresql://postgres:password@localhost:5432/zameni_db

## 🔧 Установка инструментов

### PostgreSQL Client (psql)
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows
# Скачайте с официального сайта PostgreSQL
```

### Docker
```bash
# macOS
brew install docker

# Ubuntu/Debian
sudo apt-get install docker.io

# Windows
# Скачайте Docker Desktop
```

## 📋 Скрипты для работы с БД

### Просмотр таблиц
```bash
./scripts/db-view-tables.sh
```

### Просмотр данных в таблице
```bash
./scripts/db-view-data.sh [имя_таблицы]
# Пример: ./scripts/db-view-data.sh users
```

### Создание дампа базы данных
```bash
./scripts/db-dump.sh [имя_файла]
# Пример: ./scripts/db-dump.sh backup_20241210.sql
```

## 🔍 Ручные команды

### Подключение к БД через psql
```bash
psql -h localhost -p 5432 -U postgres -d zameni_db
```

### Просмотр таблиц
```sql
\dt
```

### Просмотр структуры таблицы
```sql
\d users
```

### Просмотр данных
```sql
SELECT * FROM users LIMIT 10;
```

### Создание дампа
```bash
pg_dump -h localhost -p 5432 -U postgres -d zameni_db > backup.sql
```

### Восстановление из дампа
```bash
psql -h localhost -p 5432 -U postgres -d zameni_db < backup.sql
```

## 🗄️ Структура базы данных

### Таблица users
- **id**: Уникальный идентификатор пользователя
- **email**: Email пользователя (уникальный)
- **name**: Имя пользователя
- **password**: Хешированный пароль
- **phone**: Номер телефона
- **role**: Роль пользователя (user, admin)
- **status**: Статус пользователя (active, banned, deleted)
- **created_at**: Дата создания
- **updated_at**: Дата обновления

### Таблица jobs (если есть)
- **id**: Уникальный идентификатор заказа
- **title**: Название заказа
- **description**: Описание заказа
- **user_id**: ID пользователя-заказчика
- **status**: Статус заказа
- **created_at**: Дата создания
- **updated_at**: Дата обновления

## 🛠️ GUI клиенты

### pgAdmin
- Бесплатный веб-интерфейс для PostgreSQL
- Скачать: https://www.pgadmin.org/

### DBeaver
- Универсальный клиент для баз данных
- Скачать: https://dbeaver.io/

### TablePlus
- Современный клиент для macOS
- Скачать: https://tableplus.com/

## 🔐 Безопасность

### Изменение пароля
```sql
ALTER USER postgres PASSWORD 'новый_пароль';
```

### Создание нового пользователя
```sql
CREATE USER zameni_user WITH PASSWORD 'пароль';
GRANT ALL PRIVILEGES ON DATABASE zameni_db TO zameni_user;
```

### Резервное копирование
```bash
# Ежедневный дамп
pg_dump -h localhost -U postgres zameni_db > daily_backup_$(date +%Y%m%d).sql

# Сжатый дамп
pg_dump -h localhost -U postgres zameni_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

## 🚨 Устранение неполадок

### Ошибка подключения
```bash
# Проверьте, что PostgreSQL запущен
brew services list | grep postgresql

# Запустите PostgreSQL
brew services start postgresql
```

### Ошибка аутентификации
```bash
# Проверьте файл pg_hba.conf
# Добавьте строку для локального подключения:
# local   all             postgres                                peer
```

### Ошибка доступа к базе данных
```sql
-- Создайте базу данных, если она не существует
CREATE DATABASE zameni_db;

-- Предоставьте права пользователю
GRANT ALL PRIVILEGES ON DATABASE zameni_db TO postgres;
```
