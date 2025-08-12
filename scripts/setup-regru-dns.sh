#!/bin/bash

# Скрипт для настройки DNS записей через REG.RU API

set -e

echo "🔧 Setting up REG.RU DNS..."

# Запрашиваем данные
read -p "Enter domain (e.g., zameni.app): " DOMAIN
read -p "Enter subdomain (e.g., api): " SUBDOMAIN
read -p "Enter REG.RU username: " REG_USERNAME
read -s -p "Enter REG.RU password: " REG_PASSWORD
echo

# Проверяем подключение к API
echo "🔍 Testing REG.RU API connection..."

TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$REG_USERNAME\",
        \"password\": \"$REG_PASSWORD\"
    }" \
    "https://api.reg.ru/api/regru2/auth" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to authenticate with REG.RU API"
    exit 1
fi

echo "✅ Authentication successful"

# Получаем текущий IP
CURRENT_IP=$(curl -s ifconfig.me)
echo "🌐 Current IP: $CURRENT_IP"

# Создаем/обновляем A запись
echo "📝 Creating/updating A record for $SUBDOMAIN.$DOMAIN..."

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
    echo "✅ DNS record created/updated successfully"
else
    echo "❌ Failed to create/update DNS record: $RESPONSE"
    exit 1
fi

# Сохраняем конфигурацию
mkdir -p ~/.config/regru-dns
cat > ~/.config/regru-dns/config.env << EOF
export DOMAIN="$DOMAIN"
export SUBDOMAIN="$SUBDOMAIN"
export REG_USERNAME="$REG_USERNAME"
export REG_PASSWORD="$REG_PASSWORD"
EOF

chmod 600 ~/.config/regru-dns/config.env

# Добавляем в cron для автоматического обновления
(crontab -l 2>/dev/null; echo "*/5 * * * * source ~/.config/regru-dns/config.env && $(pwd)/scripts/update-dns-regru.sh >> /var/log/regru-dns.log 2>&1") | crontab -

# Создаем директорию для логов
sudo mkdir -p /var/log
touch /var/log/regru-dns.log
chmod 644 /var/log/regru-dns.log

echo "✅ REG.RU DNS setup completed!"
echo "📋 DNS will be updated every 5 minutes"
echo "🔍 Check logs with: tail -f /var/log/regru-dns.log"
