FROM dunglas/frankenphp:latest-php8.3-alpine

# Environment for Composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy Composer binary from official Composer image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy application files
COPY . /app

# Copy .env.example to .env if .env does not exist for build step
RUN cp -n .env.example .env || true

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Ensure correct permissions for storage and bootstrap/cache
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

EXPOSE 8080

CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
