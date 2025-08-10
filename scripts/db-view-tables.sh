#!/bin/bash

# Скрипт для просмотра таблиц в базе данных
# Использование: ./scripts/db-view-tables.sh

echo "🔍 Просмотр таблиц в базе данных..."

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Проверяем подключение к БД
echo "📊 Подключение к базе данных: $DB_NAME"
echo "📍 Хост: $DB_HOST:$DB_PORT"
echo "👤 Пользователь: $DB_USERNAME"

# Если psql доступен, используем его
if command -v psql &> /dev/null; then
    echo "✅ psql найден, используем для подключения..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "\dt"
elif command -v docker &> /dev/null; then
    echo "✅ Docker найден, используем для подключения..."
    docker exec -it $(docker ps -q --filter "name=postgres") psql -U $DB_USERNAME -d $DB_NAME -c "\dt"
else
    echo "❌ psql и docker не найдены"
    echo "📋 Установите PostgreSQL client или Docker для работы с БД"
    echo ""
    echo "🔧 Альтернативные способы:"
    echo "1. Установите PostgreSQL: brew install postgresql"
    echo "2. Установите Docker: brew install docker"
    echo "3. Используйте pgAdmin или другой GUI клиент"
    echo ""
    echo "📊 Информация о подключении:"
    echo "   Хост: $DB_HOST"
    echo "   Порт: $DB_PORT"
    echo "   База: $DB_NAME"
    echo "   Пользователь: $DB_USERNAME"
    echo "   URL: $DATABASE_URL"
fi
