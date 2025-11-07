FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip git curl \
    nginx \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create nginx directory and copy config
RUN mkdir -p /etc/nginx/sites-available
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Copy start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

WORKDIR /var/www/html

# Expose port
EXPOSE 80

CMD ["/usr/local/bin/start.sh"]
