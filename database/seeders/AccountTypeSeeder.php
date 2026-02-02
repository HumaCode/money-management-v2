<?php

namespace Database\Seeders;

use App\Models\AccountType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accountTypes = [
            ['name' => 'Checking', 'slug' => 'checking', 'icon' => '💳', 'is_active' => true],
            ['name' => 'Savings', 'slug' => 'savings', 'icon' => '🏦', 'is_active' => true],
            ['name' => 'Credit Card', 'slug' => 'credit-card', 'icon' => '💳', 'is_active' => true],
            ['name' => 'E-Wallet', 'slug' => 'e-wallet', 'icon' => '📱', 'is_active' => true],
            ['name' => 'Cash', 'slug' => 'cash', 'icon' => '💵', 'is_active' => true],
            ['name' => 'Investment', 'slug' => 'investment', 'icon' => '📈', 'is_active' => true],
        ];

        foreach ($accountTypes as $type) {
            AccountType::create($type);
        }
    }
}
