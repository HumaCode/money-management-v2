<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed default currencies
        $currencies = [
            ['code' => 'IDR', 'name' => 'Indonesian Rupiah', 'symbol' => 'Rp', 'format' => '#,##0', 'is_active' => true],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'format' => '#,##0.00', 'is_active' => true],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'format' => '#,##0.00', 'is_active' => true],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'symbol' => 'S$', 'format' => '#,##0.00', 'is_active' => true],
            ['code' => 'MYR', 'name' => 'Malaysian Ringgit', 'symbol' => 'RM', 'format' => '#,##0.00', 'is_active' => true],
        ];

        foreach ($currencies as $currency) {
            Currency::create($currency);
        }
    }
}
