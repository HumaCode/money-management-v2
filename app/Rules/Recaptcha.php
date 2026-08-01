<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Recaptcha implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $secretKey = env('RECAPTCHA_SECRET_KEY', '6Lfu-W8tAAAAAJ4Ku7Qm0aIQkfuZZilcTxTygoLT');

        if (empty($value)) {
            $fail('Verifikasi reCAPTCHA wajib dicentang.');
            return;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret'   => $secretKey,
                'response' => $value,
                'remoteip' => request()->ip(),
            ]);

            $body = $response->json();

            if (!$response->successful() || !($body['success'] ?? false)) {
                Log::warning('reCAPTCHA Verification Failed: ' . json_encode($body));
                $fail('Verifikasi reCAPTCHA gagal, silakan coba lagi.');
            }
        } catch (\Throwable $e) {
            Log::error('reCAPTCHA Verification Error: ' . $e->getMessage());
            $fail('Terjadi kesalahan saat memverifikasi reCAPTCHA.');
        }
    }
}
