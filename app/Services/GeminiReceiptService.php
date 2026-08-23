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
        $model = env('GEMINI_MODEL', 'gemini-3.1-flash-lite');
        $this->apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $this->apiKey;
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
Anda adalah asisten AI ekstraksi struk belanja. Analisis gambar struk/nota ini secara presisi dan berikan output HANYA dalam format JSON valid tanpa tanda markdown (tanpa ```json ... ```) dengan struktur JSON berikut:
{
    "merchant_name": "Nama toko / tempat transaksi (misal: Indomaret, Alfamart, Starbucks)",
    "total_amount": 0,
    "discount": 0,
    "discount_title": "Nama/keterangan persis dari diskon yang tertera pada struk (misal: Diskon Frisian Flag, Voucher Belanja, Member Discount)",
    "discounts": [
        {
            "name": "Nama voucher / diskon persis dari struk (contoh: VC SAYAP MAS UTA, VC PT SMU, VC AKASHA WIRA I, VC MEMBER 5000/INDOMARET)",
            "amount": 1700
        }
    ],
    "transaction_date": "YYYY-MM-DD",
    "description": "Ringkasan transaksi singkat",
    "suggested_category": "Rekomendasi nama kategori (misal: Groceries, Food & Dining, Fuel, Entertainment, Shopping)",
    "items": [
        {
            "name": "Nama barang/item persis dari struk",
            "qty": 1,
            "price": 0,
            "total_price": 0
        }
    ]
}
Catatan Penting:
1. "total_amount": Angka murni (integer) total bayar/bersih akhir yang ada di struk.
2. "discount": Angka murni (integer) total potongan harga / hemat jika ada, jika tidak ada isi 0.
3. "discount_title": Tuliskan nama/keterangan label diskon persis seperti yang tertulis di struk jika ada (contoh: "DISKON FRISIAN FLAG"). Jika tidak ada label khusus, isi null.
4. "discounts": Ekstrak SEMUA rincian voucher / potongan diskon individual yang tertera pada struk ke dalam daftar `discounts` (dengan `name` persis seperti label di struk dan `amount` nominal angka positifnya). Jangan lewatkan voucher/diskon apapun yang ada di struk. Jika tidak ada rincian voucher, isi [].
5. "items": Ekstrak SEMUA baris barang/produk yang tertera pada gambar struk beserta jumlah (qty), harga satuan (price), dan subtotal item (total_price). Jangan abaikan item apapun.
6. "transaction_date": Tanggal transaksi dari struk (YYYY-MM-DD). Jika tidak ada, gunakan tanggal hari ini.
7. HANYA kembalikan string JSON valid tanpa penjelasan tambahan.
PROMPT;

        $response = Http::timeout(90)->withHeaders([
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
