#!/bin/bash

# Скрипт для тестирования Kafka
# Проверяет работу Kafka и отправляет тестовые сообщения

# Определяем окружение
ENVIRONMENT=${1:-development}

case $ENVIRONMENT in
    development|dev)
        KAFKA_HOST="localhost:9092"
        KAFKA_CONTAINER="kafka-dev"
        KAFKA_UI_PORT="8080"
        ;;
    staging)
        KAFKA_HOST="localhost:9093"
        KAFKA_CONTAINER="kafka-staging"
        KAFKA_UI_PORT="8081"
        ;;
    production|prod)
        KAFKA_HOST="localhost:9094"
        KAFKA_CONTAINER="kafka-prod"
        KAFKA_UI_PORT="8083"
        ;;
    *)
        echo "❌ Неизвестное окружение: $ENVIRONMENT"
        echo "Использование: $0 [development|staging|production]"
        exit 1
        ;;
esac

TOPIC="test.topic"

echo "🚀 Тестирование Kafka ($ENVIRONMENT)"
echo "===================================="
echo "Kafka Host: $KAFKA_HOST"
echo "Kafka Container: $KAFKA_CONTAINER"
echo "Kafka UI Port: $KAFKA_UI_PORT"
echo "Test Topic: $TOPIC"
echo ""

# Проверяем, что Kafka запущена
echo "🔍 Проверяем статус Kafka..."
if ! docker ps | grep -q $KAFKA_CONTAINER; then
    echo "❌ Kafka не запущена для окружения $ENVIRONMENT"
    echo "Запустите: npm run kafka:up:$ENVIRONMENT"
    exit 1
fi

echo "✅ Kafka запущена"
echo ""

# Проверяем доступность Kafka
echo "🔍 Проверяем доступность Kafka..."
if ! docker exec $KAFKA_CONTAINER kafka-topics --list --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo "❌ Kafka недоступна"
    exit 1
fi

echo "✅ Kafka доступна"
echo ""

# Создаем тестовый топик
echo "📝 Создаем тестовый топик..."
if docker exec $KAFKA_CONTAINER kafka-topics --create --topic $TOPIC --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>/dev/null; then
    echo "✅ Топик $TOPIC создан"
else
    echo "ℹ️ Топик $TOPIC уже существует"
fi
echo ""

# Отправляем тестовые сообщения
echo "📤 Отправляем тестовые сообщения..."

# Создаем временный файл с сообщениями
cat > /tmp/kafka_test_messages.txt << EOF
{"id": 1, "message": "Тестовое сообщение 1", "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
{"id": 2, "message": "Тестовое сообщение 2", "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
{"id": 3, "message": "Тестовое сообщение 3", "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
{"id": 4, "message": "Тестовое сообщение 4", "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
{"id": 5, "message": "Тестовое сообщение 5", "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF

# Отправляем сообщения
docker exec -i $KAFKA_CONTAINER kafka-console-producer --topic $TOPIC --bootstrap-server localhost:9092 < /tmp/kafka_test_messages.txt

echo "✅ 5 тестовых сообщений отправлено"
echo ""

# Читаем сообщения
echo "📥 Читаем сообщения из топика..."
echo "Последние сообщения в топике $TOPIC:"
echo "----------------------------------------"

docker exec $KAFKA_CONTAINER kafka-console-consumer --topic $TOPIC --bootstrap-server localhost:9092 --from-beginning --max-messages 5 --timeout-ms 5000

echo ""
echo "----------------------------------------"

# Проверяем статистику топика
echo "📊 Статистика топика $TOPIC:"
docker exec kafka kafka-topics --describe --topic $TOPIC --bootstrap-server localhost:9092

echo ""
echo "🌐 Kafka UI доступен по адресу: http://localhost:8080"
echo ""

# Очищаем временные файлы
rm -f /tmp/kafka_test_messages.txt

echo "🏁 Тестирование Kafka завершено"
