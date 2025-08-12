#!/bin/bash

# Скрипт для настройки SSH конфигурации для динамических IP

set -e

echo "🔧 Setting up SSH configuration for dynamic IP servers..."

# Создаем директорию SSH если её нет
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Запрашиваем данные
read -p "Enter server name (e.g., zameni-server): " SERVER_NAME
read -p "Enter SSH user (default: root): " SSH_USER
SSH_USER=${SSH_USER:-root}
read -p "Enter SSH key path (default: ~/.ssh/id_rsa): " SSH_KEY
SSH_KEY=${SSH_KEY:-~/.ssh/id_rsa}

# Расширяем пути
SSH_KEY=$(eval echo "$SSH_KEY")

# Проверяем существование ключа
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    echo "Please generate SSH key first:"
    echo "  ssh-keygen -t rsa -b 4096 -f $SSH_KEY"
    exit 1
fi

# Создаем SSH конфигурацию
SSH_CONFIG="$HOME/.ssh/config"

# Создаем файл если его нет
if [ ! -f "$SSH_CONFIG" ]; then
    touch "$SSH_CONFIG"
    chmod 600 "$SSH_CONFIG"
fi

# Проверяем, есть ли уже такая конфигурация
if grep -q "Host $SERVER_NAME" "$SSH_CONFIG"; then
    echo "⚠️  Host $SERVER_NAME already exists in SSH config"
    read -p "Do you want to update it? (y/n): " update
    if [ "$update" != "y" ]; then
        echo "❌ Aborted"
        exit 1
    fi
    
    # Удаляем старую конфигурацию
    sed -i "/Host $SERVER_NAME/,/^$/d" "$SSH_CONFIG"
fi

# Добавляем новую конфигурацию
cat >> "$SSH_CONFIG" << EOF

Host $SERVER_NAME
    HostName %h
    User $SSH_USER
    IdentityFile $SSH_KEY
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
EOF

echo "✅ SSH configuration added for $SERVER_NAME"
echo ""
echo "📋 Usage:"
echo "  ssh $SERVER_NAME"
echo ""
echo "🔧 Configuration details:"
echo "  - User: $SSH_USER"
echo "  - Key: $SSH_KEY"
echo "  - StrictHostKeyChecking: disabled"
echo "  - ServerAliveInterval: 60 seconds"
echo ""
echo "💡 Note: You'll need to update HostName manually when IP changes,"
echo "   or use the ssh-connect.sh script for automatic IP detection."
