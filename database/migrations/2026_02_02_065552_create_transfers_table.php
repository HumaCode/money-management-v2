<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignUuid('from_account_id')
                ->constrained('accounts')
                ->cascadeOnDelete();

            $table->foreignUuid('to_account_id')
                ->constrained('accounts')
                ->cascadeOnDelete();

            $table->foreignUuid('from_currency_id')
                ->constrained('currencies')
                ->restrictOnDelete();

            $table->foreignUuid('to_currency_id')
                ->constrained('currencies')
                ->restrictOnDelete();

            $table->decimal('amount', 20, 2);

            $table->decimal('exchange_rate', 12, 6)->default(1.0);
            $table->decimal('fee', 20, 2)->default(0);

            $table->text('notes')->nullable();
            $table->date('transfer_date');

            $table->timestamps();

            $table->index(['user_id', 'transfer_date']);
            $table->index('from_account_id');
            $table->index('to_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
