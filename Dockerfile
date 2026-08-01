FROM dunglas/frankenphp:latest-php8.2-alpine

# Install PHP extensions for Laravel (MySQL, BCMath, GD, Zip, OpCache, Intl, etc.)
RUN install-php-extensions \
    pdo_mysql \
    gd \
    bcmath \
    zip \
    intl \
    opcache \
    exif

# Copy custom Caddyfile/FrankenPHP configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Set working directory
WORKDIR /app

# Copy application source code
COPY . /app

# Ensure correct permissions for storage and bootstrap/cache
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# Expose FrankenPHP internal port
EXPOSE 8080

CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
