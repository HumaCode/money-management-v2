<?php
// First get CSRF token and session cookie
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8001/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIEJAR, __DIR__ . '/cookie.txt');
curl_setopt($ch, CURLOPT_COOKIEFILE, __DIR__ . '/cookie.txt');
curl_setopt($ch, CURLOPT_HEADER, true);
$resp = curl_exec($ch);
curl_close($ch);

// Extract XSRF-TOKEN from cookie file
$cookieContent = file_get_contents(__DIR__ . '/cookie.txt');
echo "=== COOKIE FILE ===\n";
echo $cookieContent . "\n";

// Extract XSRF token from cookie
preg_match('/XSRF-TOKEN\s+([^\s]+)/', $cookieContent, $matches);
$xsrfToken = urldecode($matches[1] ?? '');
echo "XSRF Token: " . $xsrfToken . "\n\n";

// Now POST login
$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, 'http://localhost:8001/login');
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_COOKIEJAR, __DIR__ . '/cookie.txt');
curl_setopt($ch2, CURLOPT_COOKIEFILE, __DIR__ . '/cookie.txt');
curl_setopt($ch2, CURLOPT_HEADER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
    'X-Requested-With: XMLHttpRequest',
    'X-XSRF-TOKEN: ' . $xsrfToken,
    'Referer: http://localhost:8001/login',
    'Origin: http://localhost:8001',
]);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode([
    'identity'             => 'dev',
    'password'             => '123',
    'remember'             => false,
    'g-recaptcha-response' => 'fake-token-for-local',
]));

$resp2 = curl_exec($ch2);
$httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch2, CURLINFO_HEADER_SIZE);
curl_close($ch2);

$body = substr($resp2, $headerSize);
$headers = substr($resp2, 0, $headerSize);

echo "=== HTTP STATUS: $httpCode ===\n";
echo "=== RESPONSE HEADERS ===\n";
echo $headers . "\n";
echo "=== RESPONSE BODY ===\n";
echo $body . "\n";
