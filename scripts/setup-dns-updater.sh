#!/bin/bash

# Скрипт для настройки автоматического обновления DNS записей

set -e

echo "🔧 Setting up DNS updater..."

# Проверяем наличие cron
if ! command -v crontab &> /dev/null; then
    echo "❌ cron is not available"
    exit 1
fi

# Создаем директорию для логов
mkdir -p /var/log/dns-updater

# Добавляем задачу в cron (каждые 5 минут)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/bin/curl -s ifconfig.me > /tmp/current_ip && /path/to/update-dns.sh >> /var/log/dns-updater/update.log 2>&1") | crontab -

echo "✅ DNS updater configured to run every 5 minutes"
echo "📋 Logs will be saved to /var/log/dns-updater/update.log"
echo "🔍 Check status with: tail -f /var/log/dns-updater/update.log"
