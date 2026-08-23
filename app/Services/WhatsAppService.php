<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = env('WA_GATEWAY_URL', 'http://localhost:8003/api/v1/whatsapp/messages');
        $this->apiKey  = env('WA_GATEWAY_KEY', '');
    }

    /**
     * Format phone number to Indonesian international format (628xxx)
     */
    public static function formatPhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^\d]/', '', $phone);
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '62' . substr($cleaned, 1);
        }
        return $cleaned;
    }

    /**
     * Send WhatsApp Message via SIGATE WA Gateway
     */
    public function sendMessage(string $targetPhone, string $message): bool
    {
        $formattedPhone = self::formatPhoneNumber($targetPhone);

        try {
            $response = Http::withHeaders([
                'x-api-key'    => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])->timeout(10)->post($this->baseUrl, [
                'number'       => $formattedPhone,
                'message'      => $message,
                'message_type' => 'text',
                'watermark'    => false,
            ]);

            Log::info("WA OTP payload sent to $formattedPhone, status: " . $response->status() . ", body: " . $response->body());
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WA Gateway Exception: ' . $e->getMessage());
            return false;
        }
    }
}
