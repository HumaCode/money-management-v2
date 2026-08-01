<?php

namespace App\Http\Middleware;

use App\Helpers\ResponseHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateMobileApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $rawKey = env('MOBILE_API_KEY', 'humacode2026');
        $expectedHash = hash('sha256', $rawKey);

        // Accept key from X-App-Key / X-Api-Key header or app_key parameter
        $clientKey = $request->header('X-App-Key') 
            ?? $request->header('X-Api-Key') 
            ?? $request->header('x-app-key')
            ?? $request->header('x-api-key')
            ?? $request->input('app_key');

        if (!$clientKey) {
            return ResponseHelper::unauthorized('Header X-App-Key diperlukan untuk mengakses Mobile API.');
        }

        // Compare timing-safe hash
        $clientHash = hash('sha256', $clientKey);
        $isValidRaw  = hash_equals($rawKey, $clientKey);
        $isValidHash = hash_equals($expectedHash, $clientKey) || hash_equals($expectedHash, $clientHash);

        if (!$isValidRaw && !$isValidHash) {
            return ResponseHelper::forbidden('API Secret Key tidak valid (Akses Ditolak).');
        }

        return $next($request);
    }
}
