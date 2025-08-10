#!/bin/bash

# Скрипт для настройки баз данных для разных окружений
# Использование: ./scripts/database-setup.sh [development|staging|production]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Проверяем, что PostgreSQL запущен
check_postgres() {
    if ! pg_isready -q; then
        error "PostgreSQL не запущен. Запустите: brew services start postgresql@15"
        exit 1
    fi
    log "PostgreSQL запущен"
}

# Создание базы данных
create_database() {
    local db_name=$1
    local env=$2
    
    log "Создание базы данных '$db_name' для окружения '$env'..."
    
    if createdb "$db_name" 2>/dev/null; then
        log "✅ База данных '$db_name' создана успешно"
    else
        warn "База данных '$db_name' уже существует"
    fi
}

# Удаление базы данных
drop_database() {
    local db_name=$1
    local env=$2
    
    log "Удаление базы данных '$db_name' для окружения '$env'..."
    
    if dropdb "$db_name" 2>/dev/null; then
        log "✅ База данных '$db_name' удалена успешно"
    else
        warn "База данных '$db_name' не существует"
    fi
}

# Сброс базы данных
reset_database() {
    local db_name=$1
    local env=$2
    
    log "Сброс базы данных '$db_name' для окружения '$env'..."
    drop_database "$db_name" "$env"
    create_database "$db_name" "$env"
}

# Основная функция
main() {
    local environment=${1:-development}
    
    case $environment in
        development)
            DB_NAME="zameni_development"
            ENV_NAME="development"
            ;;
        staging)
            DB_NAME="zameni_staging"
            ENV_NAME="staging"
            ;;
        production)
            DB_NAME="zameni_production"
            ENV_NAME="production"
            ;;
        *)
            error "Неизвестное окружение: $environment"
            echo "Использование: $0 [development|staging|production]"
            exit 1
            ;;
    esac
    
    log "Настройка базы данных для окружения: $ENV_NAME"
    
    # Проверяем PostgreSQL
    check_postgres
    
    # Создаем базу данных
    create_database "$DB_NAME" "$ENV_NAME"
    
    log "✅ Настройка завершена для окружения: $ENV_NAME"
    log "База данных: $DB_NAME"
}

# Обработка аргументов командной строки
case "${1:-}" in
    create)
        main "$2"
        ;;
    drop)
        if [ -z "$2" ]; then
            error "Укажите окружение для удаления"
            exit 1
        fi
        case $2 in
            development) drop_database "zameni_development" "development" ;;
            staging) drop_database "zameni_staging" "staging" ;;
            production) drop_database "zameni_production" "production" ;;
            *) error "Неизвестное окружение: $2" ;;
        esac
        ;;
    reset)
        if [ -z "$2" ]; then
            error "Укажите окружение для сброса"
            exit 1
        fi
        case $2 in
            development) reset_database "zameni_development" "development" ;;
            staging) reset_database "zameni_staging" "staging" ;;
            production) reset_database "zameni_production" "production" ;;
            *) error "Неизвестное окружение: $2" ;;
        esac
        ;;
    list)
        log "Существующие базы данных:"
        psql -l | grep zameni_ || echo "Базы данных zameni_ не найдены"
        ;;
    *)
        main "$1"
        ;;
esac
