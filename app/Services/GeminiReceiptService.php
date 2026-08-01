<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiReceiptService
{
    protected string $apiKey;
    protected string $apiUrl;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY', '');
        $this->apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $this->apiKey;
    }

    /**
     * Scan receipt image and extract transaction metadata
     *
     * @param string $imagePath Absolute path or URL to image file
     * @return array
     */
    public function scanReceipt(string $imagePath): array
    {
        if (empty($this->apiKey) || $this->apiKey === 'your_gemini_api_key_here') {
            throw new \Exception('GEMINI_API_KEY belum dikonfigurasi di file .env');
        }

        if (!file_exists($imagePath)) {
            throw new \Exception('File foto struk tidak ditemukan di server.');
        }

        $imageData = base64_encode(file_get_contents($imagePath));
        $mimeType  = mime_content_type($imagePath) ?: 'image/jpeg';

        $prompt = <<<PROMPT
Anda adalah asisten AI ekstraksi struk belanja. Analisis gambar struk/nota ini dan berikan output HANYA dalam format JSON valid tanpa tanda markdown (tanpa ```json ... ```) dengan struktur berikut:
{
    "merchant_name": "Nama toko / tempat transaksi (misal: Indomaret, Alfamart, Starbucks)",
    "total_amount": 15000,
    "transaction_date": "YYYY-MM-DD",
    "description": "Ringkasan transaksi singkat (misal: Pembelian Indomaret - JAVANA TEH MLATI 350)",
    "suggested_category": "Rekomendasi nama kategori (misal: Groceries, Food & Dining, Fuel, Entertainment, Shopping)",
    "items": [
        {
            "name": "Nama barang/item",
            "qty": 1,
            "price": 15000
        }
    ]
}
Catatan:
1. "total_amount" HARUS berupa angka murni (number), ambil dari nilai TOTAL / HARGA JUAL bersih setelah diskon.
2. "transaction_date" sesuaikan dengan tanggal di struk dalam format YYYY-MM-DD. Jika tidak ada tahun/tanggal, gunakan tanggal hari ini.
3. HANYA kembalikan JSON murni.
PROMPT;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($this->apiUrl, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data'      => $imageData
                            ]
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.1,
                'responseMimeType' => 'application/json',
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini OCR Failed: ' . $response->body());
            throw new \Exception('Gagal memproses struk dengan AI Gemini: ' . $response->json('error.message', 'API Error'));
        }

        $resultText = $response->json('candidates.0.content.parts.0.text');
        
        // Clean markdown backticks if any
        $cleanJson = trim(preg_replace('/^```json\s*|\s*```$/i', '', $resultText));
        $parsed = json_decode($cleanJson, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Gemini OCR Invalid JSON: ' . $resultText);
            throw new \Exception('Gagal memparsing hasil analisis AI Gemini.');
        }

        return $parsed;
    }
}
