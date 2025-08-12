#!/bin/bash

# Скрипт для тестирования REG.RU CloudVPS API эндпоинтов

set -e

API_BASE="https://api.cloudvps.reg.ru/v1"
TOKEN_FILE="$HOME/.regru-cloudvps-token"

echo "🧪 Testing REG.RU CloudVPS API endpoints..."

# Проверяем наличие токена
if [ ! -f "$TOKEN_FILE" ]; then
    echo "❌ Token file not found: $TOKEN_FILE"
    echo "Please run: ./scripts/regru-cloudvps-api.sh and authenticate first"
    exit 1
fi

source "$TOKEN_FILE"

if [ -z "$CLOUDVPS_TOKEN" ]; then
    echo "❌ CLOUDVPS_TOKEN not found"
    exit 1
fi

echo "✅ Using token from $TOKEN_FILE"

# Список эндпоинтов для тестирования
endpoints=(
    "/account"
    "/account/keys"
    "/account/billing"
    "/prices"
    "/reglets"
    "/reglets/1"
    "/reglets/1/actions"
    "/reglets/1/snapshots"
)

# Функция тестирования эндпоинта
test_endpoint() {
    local endpoint="$1"
    local url="$API_BASE$endpoint"
    
    echo "🔍 Testing: $endpoint"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -H "Authorization: Bearer $CLOUDVPS_TOKEN" \
        -H "Content-Type: application/json" \
        "$url")
    
    local http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    local body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    if [ "$http_status" = "200" ]; then
        echo "✅ $endpoint - OK (200)"
        if echo "$body" | jq -e '.' > /dev/null 2>&1; then
            echo "   Valid JSON response"
        else
            echo "   ⚠️  Response is not valid JSON"
        fi
    elif [ "$http_status" = "404" ]; then
        echo "❌ $endpoint - Not Found (404)"
    elif [ "$http_status" = "401" ]; then
        echo "🔒 $endpoint - Unauthorized (401)"
    elif [ "$http_status" = "403" ]; then
        echo "🚫 $endpoint - Forbidden (403)"
    else
        echo "❓ $endpoint - Status: $http_status"
    fi
    
    echo ""
}

# Тестируем каждый эндпоинт
for endpoint in "${endpoints[@]}"; do
    test_endpoint "$endpoint"
done

echo "🎯 API testing completed!"
echo ""
echo "📋 Summary:"
echo "- Check for 200 responses (success)"
echo "- 404 means endpoint doesn't exist"
echo "- 401/403 means authentication/authorization issues"
