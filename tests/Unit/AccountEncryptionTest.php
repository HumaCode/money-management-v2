<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Models\AccountType;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AccountEncryptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_account_number_is_stored_encrypted_and_decrypted_on_access()
    {
        $user = User::factory()->create(['username' => 'testuser']);
        $currency = Currency::create([
            'code' => 'IDR',
            'name' => 'Indonesian Rupiah',
            'symbol' => 'Rp',
            'exchange_rate' => 1.0,
            'is_default' => true,
        ]);
        $type = AccountType::create([
            'name' => 'Bank',
            'slug' => 'bank',
            'code' => 'bank',
        ]);

        $plainAccountNumber = '1234567890123456';

        $account = Account::create([
            'user_id' => $user->id,
            'account_type_id' => $type->id,
            'currency_id' => $currency->id,
            'name' => 'Rekening Utama',
            'account_number' => $plainAccountNumber,
            'balance' => 1000000,
        ]);

        // 1. Model property access decrypts automatically
        $this->assertEquals($plainAccountNumber, $account->account_number);

        // 2. Check raw DB value is encrypted and not plain text
        $rawDbValue = DB::table('accounts')->where('id', $account->id)->value('account_number');
        $this->assertNotEquals($plainAccountNumber, $rawDbValue);
        $this->assertEquals($plainAccountNumber, Crypt::decryptString($rawDbValue));

        // 3. Masked account number still works
        $this->assertEquals('**** **** 3456', $account->masked_account_number);
    }
}
