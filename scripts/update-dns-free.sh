#!/bin/bash

# Скрипт для обновления DNS записей через бесплатные сервисы (No-IP, DuckDNS)

set -e

SERVICE="${1:-duckdns}"
DOMAIN="${2:-zameni}"
CURRENT_IP=$(curl -s ifconfig.me)

echo "🌐 Updating DNS for $DOMAIN via $SERVICE to $CURRENT_IP"

case $SERVICE in
    "duckdns")
        TOKEN="${DUCKDNS_TOKEN}"
        if [ -z "$TOKEN" ]; then
            echo "❌ DUCKDNS_TOKEN not set"
            exit 1
        fi
        
        RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip=$CURRENT_IP")
        if [ "$RESPONSE" = "OK" ]; then
            echo "✅ DuckDNS updated successfully"
        else
            echo "❌ DuckDNS update failed: $RESPONSE"
            exit 1
        fi
        ;;
        
    "noip")
        USERNAME="${NOIP_USERNAME}"
        PASSWORD="${NOIP_PASSWORD}"
        
        if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
            echo "❌ NOIP_USERNAME or NOIP_PASSWORD not set"
            exit 1
        fi
        
        RESPONSE=$(curl -s -u "$USERNAME:$PASSWORD" \
            "https://dynupdate.no-ip.com/nic/update?hostname=$DOMAIN&myip=$CURRENT_IP")
        
        if echo "$RESPONSE" | grep -q "good"; then
            echo "✅ No-IP updated successfully"
        else
            echo "❌ No-IP update failed: $RESPONSE"
            exit 1
        fi
        ;;
        
    *)
        echo "❌ Unknown service: $SERVICE"
        echo "   Supported services: duckdns, noip"
        exit 1
        ;;
esac
