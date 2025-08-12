#!/bin/bash

# Скрипт для обновления DNS записей через REG.RU API

set -e

DOMAIN="${1:-zameni.app}"
SUBDOMAIN="${2:-api}"
CURRENT_IP=$(curl -s ifconfig.me)

# Переменные окружения для REG.RU
REG_USERNAME="${REG_USERNAME}"
REG_PASSWORD="${REG_PASSWORD}"

if [ -z "$REG_USERNAME" ] || [ -z "$REG_PASSWORD" ]; then
    echo "❌ REG.RU credentials not set"
    echo "   Set REG_USERNAME and REG_PASSWORD environment variables"
    exit 1
fi

echo "🌐 Updating DNS for $SUBDOMAIN.$DOMAIN to $CURRENT_IP via REG.RU"

# Получаем токен авторизации
TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$REG_USERNAME\",
        \"password\": \"$REG_PASSWORD\"
    }" \
    "https://api.reg.ru/api/regru2/auth" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get auth token"
    exit 1
fi

# Обновляем A запись
RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"domain\": \"$DOMAIN\",
        \"subdomain\": \"$SUBDOMAIN\",
        \"type\": \"A\",
        \"content\": \"$CURRENT_IP\",
        \"ttl\": 300
    }" \
    "https://api.reg.ru/api/regru2/dns/update")

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ DNS updated successfully"
else
    echo "❌ Failed to update DNS: $RESPONSE"
    exit 1
fi
