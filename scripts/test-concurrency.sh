#!/bin/bash

# Скрипт для тестирования многопоточности API
# Тестирует одновременные запросы на регистрацию

BASE_URL="http://localhost:3000"
CONCURRENT_REQUESTS=100
TIMEOUT=30

echo "🚀 Тестирование многопоточности API"
echo "=================================="
echo "URL: $BASE_URL"
echo "Количество одновременных запросов: $CONCURRENT_REQUESTS"
echo "Таймаут: ${TIMEOUT}с"
echo ""

# Проверяем, что сервер запущен
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Сервер не запущен на $BASE_URL"
    echo "Запустите: npm run start:dev"
    exit 1
fi

echo "✅ Сервер доступен"
echo ""

# Создаем временный файл для результатов
RESULTS_FILE="/tmp/concurrency_test_$(date +%s).json"

echo "📊 Начинаем тестирование..."

# Функция для создания одного запроса регистрации
make_request() {
    local id=$1
    local email="test${id}@example.com"
    local name="Test User ${id}"
    local password="password123"
    
    # Генерируем уникальный email
    local timestamp=$(date +%s%N)
    local unique_email="test${id}_${timestamp}@example.com"
    
    local start_time=$(date +%s%N)
    
    response=$(curl -s -w "\n%{http_code}\n%{time_total}\n" \
        -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$unique_email\",
            \"name\": \"$name\",
            \"password\": \"$password\"
        }" \
        --max-time $TIMEOUT)
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # в миллисекундах
    
    # Парсим ответ
    local http_code=$(echo "$response" | tail -n 2 | head -n 1)
    local response_time=$(echo "$response" | tail -n 1)
    local response_body=$(echo "$response" | head -n -2)
    
    echo "{\"id\":$id,\"email\":\"$unique_email\",\"http_code\":$http_code,\"duration_ms\":$duration,\"response_time\":$response_time}" >> "$RESULTS_FILE"
    
    if [ "$http_code" = "201" ]; then
        echo "✅ Запрос $id: УСПЕХ (${duration}ms)"
    else
        echo "❌ Запрос $id: ОШИБКА $http_code (${duration}ms)"
    fi
}

# Очищаем файл результатов
> "$RESULTS_FILE"

# Запускаем одновременные запросы
echo "🔄 Запускаем $CONCURRENT_REQUESTS одновременных запросов..."
for i in $(seq 1 $CONCURRENT_REQUESTS); do
    make_request $i &
done

# Ждем завершения всех запросов
wait

echo ""
echo "📈 Анализ результатов..."

# Анализируем результаты
if [ -f "$RESULTS_FILE" ]; then
    total_requests=$(wc -l < "$RESULTS_FILE")
    successful_requests=$(grep -c '"http_code":201' "$RESULTS_FILE")
    failed_requests=$((total_requests - successful_requests))
    
    # Вычисляем среднее время ответа
    avg_duration=$(awk -F'"' '/duration_ms/ {sum+=$4; count++} END {if(count>0) printf "%.2f", sum/count}' "$RESULTS_FILE")
    
    # Находим минимальное и максимальное время
    min_duration=$(awk -F'"' '/duration_ms/ {if(min=="") min=$4; if($4<min) min=$4} END {print min}' "$RESULTS_FILE")
    max_duration=$(awk -F'"' '/duration_ms/ {if($4>max) max=$4} END {print max}' "$RESULTS_FILE")
    
    echo ""
    echo "📊 Результаты тестирования:"
    echo "=========================="
    echo "Всего запросов: $total_requests"
    echo "Успешных: $successful_requests"
    echo "Неудачных: $failed_requests"
    echo "Успешность: $(( (successful_requests * 100) / total_requests ))%"
    echo ""
    echo "⏱️ Время ответа:"
    echo "  Среднее: ${avg_duration}ms"
    echo "  Минимальное: ${min_duration}ms"
    echo "  Максимальное: ${max_duration}ms"
    
    if [ $successful_requests -eq $total_requests ]; then
        echo ""
        echo "🎉 ВСЕ ЗАПРОСЫ УСПЕШНЫ! API отлично справляется с многопоточностью"
    elif [ $successful_requests -gt $((total_requests * 80 / 100)) ]; then
        echo ""
        echo "✅ Хорошая производительность! Большинство запросов успешны"
    else
        echo ""
        echo "⚠️ Есть проблемы с многопоточностью. Рекомендуется оптимизация"
    fi
    
    # Очищаем временный файл
    rm "$RESULTS_FILE"
else
    echo "❌ Ошибка при анализе результатов"
fi

echo ""
echo "🏁 Тестирование завершено"
