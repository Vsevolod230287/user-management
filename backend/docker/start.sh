#!/bin/sh

# Wait for database to be ready - SENZA netcat
echo "Waiting for database..."
while ! timeout 1 bash -c "cat < /dev/null > /dev/tcp/db/3306" 2>/dev/null; do
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
echo "Running migrations..."
php artisan migrate --force

# Run seeders
echo "Running seeders..."
php artisan db:seed --force

# Start PHP-FPM in background
php-fpm &

# Start Nginx in foreground
nginx -g "daemon off;"
