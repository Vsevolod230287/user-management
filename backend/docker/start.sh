#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 3306; do
  sleep 1
done

echo "Database is ready!"

# Install dependencies if vendor doesn't exist
if [ ! -d "vendor" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader
fi

# Generate application key if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
fi

# Run migrations
php artisan migrate --force

# Start PHP-FPM in background
php-fpm &

# Start Nginx in foreground
nginx -g "daemon off;"
