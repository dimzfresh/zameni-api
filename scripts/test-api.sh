#!/bin/bash

# Тестовый скрипт для проверки API Zameni
# Убедитесь, что сервер запущен на http://localhost:3000

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api"

echo "🧪 Тестирование API Zameni"
echo "=========================="

# Проверка доступности сервера
echo "1. Проверка доступности сервера..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200" && echo "✅ Сервер доступен" || echo "❌ Сервер недоступен"

# Регистрация пользователя
echo ""
echo "2. Регистрация пользователя..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Тестовый Пользователь",
    "password": "password123"
  }')

echo "Ответ регистрации: $REGISTER_RESPONSE"

# Извлечение токена из ответа (если регистрация успешна)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Токен получен: ${TOKEN:0:20}..."
    
    # Получение профиля
    echo ""
    echo "3. Получение профиля пользователя..."
    PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/users/current" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Ответ профиля: $PROFILE_RESPONSE"
    
    # Получение списка пользователей
    echo ""
    echo "4. Получение списка пользователей..."
    USERS_RESPONSE=$(curl -s -X GET "$API_URL/users" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Ответ списка пользователей: $USERS_RESPONSE"
    
    # Получение списка администраторов
    echo ""
    echo "5. Получение списка администраторов..."
    ADMINS_RESPONSE=$(curl -s -X GET "$API_URL/users/admins" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Ответ списка администраторов: $ADMINS_RESPONSE"
    
else
    echo "❌ Не удалось получить токен"
fi

echo ""
echo "🎉 Тестирование завершено!"
echo "📖 Документация API доступна по адресу: $API_URL"
