-- Создание базы данных для Zameni API
-- Выполните этот скрипт в PostgreSQL

-- Создание базы данных (если не существует)
-- CREATE DATABASE zameni_db;

-- Подключение к базе данных
-- \c zameni_db;

-- Создание расширений (если нужны)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Примечание: Таблицы будут созданы автоматически TypeORM
-- при запуске приложения в режиме разработки (synchronize: true)

-- Проверка подключения
SELECT version();
