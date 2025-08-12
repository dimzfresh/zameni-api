#!/bin/bash

# Скрипт для настройки DNS в российских сервисах

set -e

echo "🇷🇺 Setting up DNS for Russian services..."

# Проверяем наличие необходимых утилит
if ! command -v jq &> /dev/null; then
    echo "📦 Installing jq..."
    sudo apt-get update && sudo apt-get install -y jq
fi

if ! command -v curl &> /dev/null; then
    echo "📦 Installing curl..."
    sudo apt-get update && sudo apt-get install -y curl
fi

# Создаем директорию для конфигурации
mkdir -p ~/.config/dns-updater

echo "🔧 Choose your DNS provider:"
echo "1) Yandex.Cloud"
echo "2) REG.RU"
echo "3) Free services (DuckDNS, No-IP)"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🔧 Setting up Yandex.Cloud DNS..."
        read -p "Enter YC_FOLDER_ID: " yc_folder_id
        read -p "Enter YC_OAUTH_TOKEN: " yc_token
        
        cat > ~/.config/dns-updater/yandex.env << EOF
export YC_FOLDER_ID="$yc_folder_id"
export YC_OAUTH_TOKEN="$yc_token"
EOF
        
        # Добавляем в cron
        (crontab -l 2>/dev/null; echo "*/5 * * * * source ~/.config/dns-updater/yandex.env && $(pwd)/scripts/update-dns-yandex.sh >> /var/log/dns-updater/yandex.log 2>&1") | crontab -
        ;;
        
    2)
        echo "🔧 Setting up REG.RU DNS..."
        read -p "Enter REG.RU username: " reg_username
        read -s -p "Enter REG.RU password: " reg_password
        echo
        
        cat > ~/.config/dns-updater/regru.env << EOF
export REG_USERNAME="$reg_username"
export REG_PASSWORD="$reg_password"
EOF
        
        # Добавляем в cron
        (crontab -l 2>/dev/null; echo "*/5 * * * * source ~/.config/dns-updater/regru.env && $(pwd)/scripts/update-dns-regru.sh >> /var/log/dns-updater/regru.log 2>&1") | crontab -
        ;;
        
    3)
        echo "🔧 Setting up free DNS services..."
        echo "Choose service:"
        echo "1) DuckDNS"
        echo "2) No-IP"
        
        read -p "Enter service choice (1-2): " service_choice
        
        case $service_choice in
            1)
                read -p "Enter DuckDNS token: " duckdns_token
                cat > ~/.config/dns-updater/duckdns.env << EOF
export DUCKDNS_TOKEN="$duckdns_token"
EOF
                (crontab -l 2>/dev/null; echo "*/5 * * * * source ~/.config/dns-updater/duckdns.env && $(pwd)/scripts/update-dns-free.sh duckdns >> /var/log/dns-updater/duckdns.log 2>&1") | crontab -
                ;;
            2)
                read -p "Enter No-IP username: " noip_username
                read -s -p "Enter No-IP password: " noip_password
                echo
                cat > ~/.config/dns-updater/noip.env << EOF
export NOIP_USERNAME="$noip_username"
export NOIP_PASSWORD="$noip_password"
EOF
                (crontab -l 2>/dev/null; echo "*/5 * * * * source ~/.config/dns-updater/noip.env && $(pwd)/scripts/update-dns-free.sh noip >> /var/log/dns-updater/noip.log 2>&1") | crontab -
                ;;
        esac
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Создаем директорию для логов
sudo mkdir -p /var/log/dns-updater
sudo chown $USER:$USER /var/log/dns-updater

echo "✅ DNS updater configured successfully!"
echo "📋 Check logs with: tail -f /var/log/dns-updater/*.log"
