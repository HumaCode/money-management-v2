FROM dunglas/frankenphp:latest-php8.2-alpine

# Copy Composer binary from official Composer image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application source code
COPY . /app

# Install composer dependencies for production
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Ensure correct permissions for storage and bootstrap/cache
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# Expose FrankenPHP internal port
EXPOSE 8080

CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
