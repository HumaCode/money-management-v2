<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class SsoConfig
{
    protected static string $file = 'sso_config.json';

    public static function get(): array
    {
        if (!Storage::exists(self::$file)) {
            return self::defaults();
        }

        $data = json_decode(Storage::get(self::$file), true);
        return array_merge(self::defaults(), $data ?? []);
    }

    public static function save(array $data): void
    {
        $current = self::get();
        $merged  = array_merge($current, $data);
        Storage::put(self::$file, json_encode($merged, JSON_PRETTY_PRINT));
    }

    public static function isEnabled(): bool
    {
        return (bool) (self::get()['sso_enabled'] ?? false);
    }

    protected static function defaults(): array
    {
        return [
            'sso_enabled'       => false,
            'sso_provider_url'  => 'http://localhost:8000',
            'sso_client_id'     => '',
            'sso_client_secret' => '',
            'sso_redirect_uri'  => '',
        ];
    }
}
