#!/bin/bash

# Скрипт для создания дампа базы данных
# Использование: ./scripts/db-dump.sh [имя_файла]

echo "💾 Создание дампа базы данных..."

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Определяем имя файла дампа
DUMP_FILE=${1:-"zameni_db_dump_$(date +%Y%m%d_%H%M%S).sql"}

echo "📊 База данных: $DB_NAME"
echo "📁 Файл дампа: $DUMP_FILE"

# Если pg_dump доступен, используем его
if command -v pg_dump &> /dev/null; then
    echo "✅ pg_dump найден, создаем дамп..."
    pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME > "$DUMP_FILE"
    echo "✅ Дамп создан: $DUMP_FILE"
elif command -v docker &> /dev/null; then
    echo "✅ Docker найден, создаем дамп через контейнер..."
    docker exec -it $(docker ps -q --filter "name=postgres") pg_dump -U $DB_USERNAME -d $DB_NAME > "$DUMP_FILE"
    echo "✅ Дамп создан: $DUMP_FILE"
else
    echo "❌ pg_dump и docker не найдены"
    echo "📋 Установите PostgreSQL client или Docker для создания дампа"
    echo ""
    echo "🔧 Альтернативные способы:"
    echo "1. Установите PostgreSQL: brew install postgresql"
    echo "2. Установите Docker: brew install docker"
    echo "3. Используйте pgAdmin для экспорта"
    echo ""
    echo "📊 Информация о подключении:"
    echo "   Хост: $DB_HOST"
    echo "   Порт: $DB_PORT"
    echo "   База: $DB_NAME"
    echo "   Пользователь: $DB_USERNAME"
    echo "   URL: $DATABASE_URL"
fi
