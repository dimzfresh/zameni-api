#!/bin/bash

# Скрипт для обновления DNS записей через Yandex.Cloud API

set -e

DOMAIN="${1:-zameni.app}"
SUBDOMAIN="${2:-api}"
CURRENT_IP=$(curl -s ifconfig.me)

# Переменные окружения для Yandex.Cloud
YC_FOLDER_ID="${YC_FOLDER_ID}"
YC_OAUTH_TOKEN="${YC_OAUTH_TOKEN}"

if [ -z "$YC_FOLDER_ID" ] || [ -z "$YC_OAUTH_TOKEN" ]; then
    echo "❌ Yandex.Cloud credentials not set"
    echo "   Set YC_FOLDER_ID and YC_OAUTH_TOKEN environment variables"
    exit 1
fi

echo "🌐 Updating DNS for $SUBDOMAIN.$DOMAIN to $CURRENT_IP via Yandex.Cloud"

# Получаем список DNS зон
ZONES=$(curl -s -H "Authorization: Bearer $YC_OAUTH_TOKEN" \
    "https://dns.api.cloud.yandex.net/dns/v1/zones?folderId=$YC_FOLDER_ID")

# Находим нужную зону
ZONE_ID=$(echo "$ZONES" | jq -r ".dnsZones[] | select(.zone == \"$DOMAIN.\") | .id")

if [ -z "$ZONE_ID" ]; then
    echo "❌ DNS zone for $DOMAIN not found"
    exit 1
fi

# Обновляем A запись
curl -s -X POST \
    -H "Authorization: Bearer $YC_OAUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"additions\": [{
            \"name\": \"$SUBDOMAIN.$DOMAIN.\",
            \"type\": \"A\",
            \"ttl\": 300,
            \"data\": [\"$CURRENT_IP\"]
        }],
        \"deletions\": [{
            \"name\": \"$SUBDOMAIN.$DOMAIN.\",
            \"type\": \"A\"
        }]
    }" \
    "https://dns.api.cloud.yandex.net/dns/v1/zones/$ZONE_ID:updateRecordSets"

echo "✅ DNS updated successfully"
