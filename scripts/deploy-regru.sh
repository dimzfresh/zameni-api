#!/bin/bash

# Комплексный скрипт деплоя для REG.RU серверов

set -e

echo "🚀 Starting REG.RU deployment..."

# Проверяем, что мы на Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    echo "❌ This script is designed for Ubuntu servers"
    exit 1
fi

# Обновляем систему
echo "📦 Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

# Устанавливаем необходимые пакеты
echo "📦 Installing required packages..."
sudo apt-get install -y curl wget git jq ufw

# Устанавливаем Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Устанавливаем Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Настраиваем файрвол
echo "🔥 Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Создаем .env.production
echo "⚙️ Setting up environment..."
if [ ! -f .env.production ]; then
    cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=zameni_production
DB_USERNAME=postgres
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
EOF
    echo "✅ Created .env.production"
fi

# Спрашиваем про DNS настройку
read -p "Do you want to set up DNS? (y/n): " setup_dns
if [ "$setup_dns" = "y" ]; then
    echo "🔧 Running DNS setup..."
    ./scripts/setup-regru-dns.sh
fi

# Спрашиваем про SSL настройку
read -p "Do you want to set up SSL? (y/n): " setup_ssl
if [ "$setup_ssl" = "y" ]; then
    echo "🔒 Running SSL setup..."
    ./scripts/setup-ssl-regru.sh
fi

# Запускаем приложение
echo "🚀 Starting application..."
docker-compose -f docker-compose.production.yml up -d --build

# Ждем запуска
echo "⏳ Waiting for services to start..."
sleep 30

# Проверяем статус
echo "📊 Service status:"
docker-compose -f docker-compose.production.yml ps

# Создаем вспомогательные скрипты
echo "🔧 Creating helper scripts..."

# Скрипт статуса
cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 Service Status:"
docker-compose -f docker-compose.production.yml ps
echo ""
echo "📋 Recent Logs:"
docker-compose -f docker-compose.production.yml logs --tail=10
EOF

# Скрипт перезапуска
cat > restart.sh << 'EOF'
#!/bin/bash
echo "🔄 Restarting services..."
docker-compose -f docker-compose.production.yml restart
echo "✅ Services restarted"
EOF

# Скрипт обновления
cat > update.sh << 'EOF'
#!/bin/bash
echo "📦 Updating application..."
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build
echo "✅ Application updated"
EOF

chmod +x status.sh restart.sh update.sh

echo "✅ REG.RU deployment completed!"
echo ""
echo "📋 Available commands:"
echo "  ./status.sh  - Check service status"
echo "  ./restart.sh - Restart services"
echo "  ./update.sh  - Update application"
echo ""
echo "🌐 Your application should be available at:"
echo "  - HTTP:  http://$(curl -s ifconfig.me)"
echo "  - HTTPS: https://$(curl -s ifconfig.me) (if SSL configured)"
echo "  - Docs:  https://$(curl -s ifconfig.me)/docs"
