#!/bin/bash

# Базовый скрипт для обновления DNS записей
# Используется как шаблон для других DNS провайдеров

set -e

DOMAIN="${1:-zameni.app}"
SUBDOMAIN="${2:-api}"
CURRENT_IP=$(curl -s ifconfig.me)

echo "🌐 Updating DNS for $SUBDOMAIN.$DOMAIN to $CURRENT_IP"

# Здесь должна быть логика конкретного DNS провайдера
echo "❌ No DNS provider configured. Please use specific scripts:"
echo "   - scripts/update-dns-yandex.sh"
echo "   - scripts/update-dns-regru.sh"
echo "   - scripts/update-dns-free.sh"

exit 1
