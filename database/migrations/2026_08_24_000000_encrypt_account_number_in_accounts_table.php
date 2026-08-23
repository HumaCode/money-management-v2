<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->text('account_number')->nullable()->change();
        });

        // Encrypt any existing plain-text account_number records in database
        $accounts = DB::table('accounts')->whereNotNull('account_number')->where('account_number', '!=', '')->get();
        foreach ($accounts as $account) {
            try {
                Crypt::decryptString($account->account_number);
            } catch (\Exception $e) {
                DB::table('accounts')
                    ->where('id', $account->id)
                    ->update([
                        'account_number' => Crypt::encryptString($account->account_number),
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $accounts = DB::table('accounts')->whereNotNull('account_number')->where('account_number', '!=', '')->get();
        foreach ($accounts as $account) {
            try {
                $decrypted = Crypt::decryptString($account->account_number);
                DB::table('accounts')
                    ->where('id', $account->id)
                    ->update([
                        'account_number' => $decrypted,
                    ]);
            } catch (\Exception $e) {
                // Ignore if decryption fails
            }
        }

        Schema::table('accounts', function (Blueprint $table) {
            $table->string('account_number')->nullable()->change();
        });
    }
};
