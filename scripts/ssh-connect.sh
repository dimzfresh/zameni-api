#!/bin/bash

# Скрипт для автоматического подключения к серверу с динамическим IP

set -e

# Конфигурация
TOKEN_FILE="$HOME/.regru-cloudvps-token"
API_BASE="https://api.cloudvps.reg.ru/v1"
SERVER_ID="${1:-1}"
SSH_USER="${2:-root}"
SSH_KEY="${3:-~/.ssh/id_rsa}"

echo "🔌 Connecting to server with dynamic IP..."

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

# Получаем IP сервера через API
echo "🌐 Getting server IP from REG.RU CloudVPS API..."
SERVER_INFO=$(curl -s -H "Authorization: Bearer $CLOUDVPS_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_BASE/reglets/$SERVER_ID")

SERVER_IP=$(echo "$SERVER_INFO" | jq -r '.reglet.ip')

if [ "$SERVER_IP" = "null" ] || [ -z "$SERVER_IP" ]; then
    echo "❌ Failed to get server IP"
    echo "Response: $SERVER_INFO"
    exit 1
fi

echo "✅ Server IP: $SERVER_IP"

# Удаляем старый ключ хоста из known_hosts
echo "🧹 Removing old host key from known_hosts..."
ssh-keygen -R "$SERVER_IP" 2>/dev/null || true

# Проверяем доступность сервера
echo "🔍 Checking server availability..."
if ! ping -c 1 -W 5 "$SERVER_IP" > /dev/null 2>&1; then
    echo "⚠️  Server is not responding to ping, but trying SSH anyway..."
fi

# Подключаемся к серверу
echo "🚀 Connecting to $SSH_USER@$SERVER_IP..."
echo "   Using key: $SSH_KEY"
echo ""

# Используем StrictHostKeyChecking=no для автоматического принятия ключа
ssh -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -i "$SSH_KEY" \
    "$SSH_USER@$SERVER_IP"
