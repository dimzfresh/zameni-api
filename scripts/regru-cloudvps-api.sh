#!/bin/bash

# Интерактивный скрипт для работы с REG.RU CloudVPS API

set -e

# Конфигурация
API_BASE="https://api.cloudvps.reg.ru/v1"
TOKEN_FILE="$HOME/.regru-cloudvps-token"

# Функция для API запросов
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ ! -f "$TOKEN_FILE" ]; then
        echo "❌ Token file not found. Please authenticate first."
        return 1
    fi
    
    source "$TOKEN_FILE"
    
    if [ -z "$CLOUDVPS_TOKEN" ]; then
        echo "❌ CLOUDVPS_TOKEN not found in $TOKEN_FILE"
        return 1
    fi
    
    local url="$API_BASE$endpoint"
    local headers="-H 'Authorization: Bearer $CLOUDVPS_TOKEN' -H 'Content-Type: application/json'"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" $headers -d "$data" "$url"
    else
        curl -s -X "$method" $headers "$url"
    fi
}

# Функция аутентификации
authenticate() {
    echo "🔐 REG.RU CloudVPS Authentication"
    echo "Get your API token from: https://cloudvps.reg.ru/account/keys"
    echo ""
    
    read -p "Enter your API token: " token
    
    if [ -z "$token" ]; then
        echo "❌ Token cannot be empty"
        return 1
    fi
    
    # Тестируем токен
    echo "🔍 Testing token..."
    local test_response=$(curl -s -H "Authorization: Bearer $token" "$API_BASE/account")
    
    if echo "$test_response" | jq -e '.account' > /dev/null; then
        echo "✅ Token is valid"
        echo "export CLOUDVPS_TOKEN=\"$token\"" > "$TOKEN_FILE"
        chmod 600 "$TOKEN_FILE"
        echo "💾 Token saved to $TOKEN_FILE"
    else
        echo "❌ Invalid token: $test_response"
        return 1
    fi
}

# Функция получения баланса
get_balance() {
    echo "💰 Getting account balance..."
    local response=$(api_request "GET" "/account")
    echo "$response" | jq -r '.account | "Balance: \(.balance) RUB"'
}

# Функция получения истории биллинга
get_billing_history() {
    echo "📊 Getting billing history..."
    local response=$(api_request "GET" "/account/billing")
    echo "$response" | jq -r '.billing[]? | "Date: \(.date), Amount: \(.amount) RUB, Description: \(.description)"'
}

# Функция получения цен
get_prices() {
    echo "💵 Getting prices..."
    local response=$(api_request "GET" "/prices")
    echo "$response" | jq -r '.prices[]? | "Type: \(.type), Price: \(.price) RUB/\(.period)"'
}

# Функция получения списка серверов
list_servers() {
    echo "🖥️ Getting list of servers (reglets)..."
    local response=$(api_request "GET" "/reglets")
    echo "$response" | jq -r '.reglets[]? | "ID: \(.id), Name: \(.name), Status: \(.status), IP: \(.ip)"'
}

# Функция получения информации о сервере
get_server_info() {
    local server_id="$1"
    if [ -z "$server_id" ]; then
        read -p "Enter server ID: " server_id
    fi
    
    echo "🖥️ Getting server info for ID: $server_id..."
    local response=$(api_request "GET" "/reglets/$server_id")
    echo "$response" | jq -r '.reglet | "ID: \(.id), Name: \(.name), Status: \(.status), IP: \(.ip), Created: \(.created_at)"'
}

# Функция создания снапшота
create_snapshot() {
    local server_id="$1"
    local name="$2"
    
    if [ -z "$server_id" ]; then
        read -p "Enter server ID: " server_id
    fi
    
    if [ -z "$name" ]; then
        read -p "Enter snapshot name: " name
    fi
    
    echo "📸 Creating snapshot for server $server_id..."
    local data="{\"type\": \"create_snapshot\", \"name\": \"$name\"}"
    local response=$(api_request "POST" "/reglets/$server_id/actions" "$data")
    
    if echo "$response" | jq -e '.action' > /dev/null; then
        echo "✅ Snapshot action initiated successfully"
        echo "$response" | jq -r '.action | "ID: \(.id), Status: \(.status)"'
    else
        echo "❌ Error creating snapshot: $response"
    fi
}

# Функция получения статуса действия
get_action_status() {
    local server_id="$1"
    local action_id="$2"
    
    if [ -z "$server_id" ]; then
        read -p "Enter server ID: " server_id
    fi
    
    if [ -z "$action_id" ]; then
        read -p "Enter action ID: " action_id
    fi
    
    echo "📊 Getting action status..."
    local response=$(api_request "GET" "/reglets/$server_id/actions/$action_id")
    echo "$response" | jq -r '.action | "ID: \(.id), Status: \(.status), Type: \(.type)"'
}

# Функция получения списка снапшотов
list_snapshots() {
    local server_id="$1"
    
    if [ -z "$server_id" ]; then
        read -p "Enter server ID: " server_id
    fi
    
    echo "📸 Getting snapshots for server $server_id..."
    local response=$(api_request "GET" "/reglets/$server_id/snapshots")
    echo "$response" | jq -r '.snapshots[]? | "ID: \(.id), Name: \(.name), Status: \(.status), Created: \(.created_at)"'
}

# Функция получения SSH ключей
list_ssh_keys() {
    echo "🔑 Getting SSH keys..."
    local response=$(api_request "GET" "/account/keys")
    echo "$response" | jq -r '.keys[]? | "ID: \(.id), Name: \(.name), Fingerprint: \(.fingerprint)"'
}

# Главное меню
show_menu() {
    echo ""
    echo "🚀 REG.RU CloudVPS API Manager"
    echo "================================"
    echo "1)  Authenticate"
    echo "2)  Get account balance"
    echo "3)  Get billing history"
    echo "4)  Get prices"
    echo "5)  List servers (reglets)"
    echo "6)  Get server info"
    echo "7)  Create snapshot"
    echo "8)  Get action status"
    echo "9)  List snapshots"
    echo "10) List SSH keys"
    echo "0)  Exit"
    echo ""
}

# Основной цикл
while true; do
    show_menu
    read -p "Choose an option: " choice
    
    case $choice in
        1)
            authenticate
            ;;
        2)
            get_balance
            ;;
        3)
            get_billing_history
            ;;
        4)
            get_prices
            ;;
        5)
            list_servers
            ;;
        6)
            get_server_info
            ;;
        7)
            create_snapshot
            ;;
        8)
            get_action_status
            ;;
        9)
            list_snapshots
            ;;
        10)
            list_ssh_keys
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
