<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$config = [
    'sso_enabled'       => true,
    'sso_provider_url'  => 'http://localhost:8000',
    'sso_client_id'     => '01kzxeyrw52w9k9fd7f3eycj6h',
    'sso_client_secret' => '8oRNPOxJbn7JX1GOd4wIURFWxrpYnekLl1hs0FMD',
    'sso_redirect_uri'  => 'http://localhost:8001/auth/callback',
];

\App\Helpers\SsoConfig::save($config);

$saved = \App\Helpers\SsoConfig::get();
echo "SSO Config saved:\n";
echo "  sso_enabled: "      . ($saved['sso_enabled'] ? 'true' : 'false') . "\n";
echo "  sso_provider_url: " . $saved['sso_provider_url'] . "\n";
echo "  sso_client_id: "    . $saved['sso_client_id'] . "\n";
echo "  sso_client_secret: " . substr($saved['sso_client_secret'], 0, 8) . "... (hidden)\n";
echo "  sso_redirect_uri: " . $saved['sso_redirect_uri'] . "\n";
