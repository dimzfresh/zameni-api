#!/bin/bash

# Скрипт для просмотра данных в таблицах
# Использование: ./scripts/db-view-data.sh [имя_таблицы]

echo "🔍 Просмотр данных в таблицах..."

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

TABLE_NAME=${1:-"users"}

echo "📊 База данных: $DB_NAME"
echo "📋 Таблица: $TABLE_NAME"

# Если psql доступен, используем его
if command -v psql &> /dev/null; then
    echo "✅ psql найден, просматриваем данные..."
    echo "📋 Содержимое таблицы $TABLE_NAME:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "SELECT * FROM $TABLE_NAME LIMIT 10;"
elif command -v docker &> /dev/null; then
    echo "✅ Docker найден, просматриваем данные через контейнер..."
    echo "📋 Содержимое таблицы $TABLE_NAME:"
    docker exec -it $(docker ps -q --filter "name=postgres") psql -U $DB_USERNAME -d $DB_NAME -c "SELECT * FROM $TABLE_NAME LIMIT 10;"
else
    echo "❌ psql и docker не найдены"
    echo "📋 Установите PostgreSQL client или Docker для просмотра данных"
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
    echo ""
    echo "🔍 Доступные таблицы (предположительно):"
    echo "   - users (пользователи)"
    echo "   - jobs (заказы)"
    echo "   - typeorm_metadata (метаданные TypeORM)"
fi
