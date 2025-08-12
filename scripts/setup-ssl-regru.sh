#!/bin/bash

# Скрипт для настройки SSL сертификатов Let's Encrypt для REG.RU

set -e

echo "🔒 Setting up SSL certificates for REG.RU..."

# Запрашиваем данные
read -p "Enter domain (e.g., zameni.app): " DOMAIN
read -p "Enter subdomain (e.g., api): " SUBDOMAIN

FULL_DOMAIN="$SUBDOMAIN.$DOMAIN"

echo "🌐 Setting up SSL for $FULL_DOMAIN"

# Устанавливаем Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Останавливаем Nginx для получения сертификата
echo "🛑 Stopping Nginx..."
sudo systemctl stop nginx || true

# Получаем сертификат
echo "🔐 Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --email admin@$DOMAIN \
    --agree-tos \
    --no-eff-email \
    -d $FULL_DOMAIN

# Создаем директорию для SSL
sudo mkdir -p ssl

# Копируем сертификаты
echo "📋 Copying certificates..."
sudo cp /etc/letsencrypt/live/$FULL_DOMAIN/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/$FULL_DOMAIN/privkey.pem ssl/key.pem

# Устанавливаем правильные права
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
chmod 600 ssl/cert.pem ssl/key.pem

# Обновляем nginx.conf
echo "⚙️ Updating Nginx configuration..."
if [ -f nginx.conf ]; then
    # Обновляем server_name в nginx.conf
    sed -i "s/server_name _;/server_name $FULL_DOMAIN;/" nginx.conf
    echo "✅ Nginx configuration updated"
else
    echo "⚠️ nginx.conf not found, please update manually"
fi

# Запускаем Nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx

# Настраиваем автоматическое обновление сертификатов
echo "🔄 Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && sudo cp /etc/letsencrypt/live/$FULL_DOMAIN/fullchain.pem $(pwd)/ssl/cert.pem && sudo cp /etc/letsencrypt/live/$FULL_DOMAIN/privkey.pem $(pwd)/ssl/key.pem && sudo chown $USER:$USER $(pwd)/ssl/cert.pem $(pwd)/ssl/key.pem && sudo systemctl reload nginx") | crontab -

echo "✅ SSL setup completed!"
echo "🔒 Certificate will be renewed automatically"
echo "🌐 Your site is now available at: https://$FULL_DOMAIN"
