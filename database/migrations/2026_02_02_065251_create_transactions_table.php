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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignUuid('account_id')
                ->constrained('accounts')
                ->cascadeOnDelete();

            $table->foreignUuid('category_id')
                ->constrained('categories')
                ->restrictOnDelete();

            $table->foreignUuid('currency_id')
                ->constrained('currencies')
                ->restrictOnDelete();

            $table->decimal('amount', 20, 2);

            $table->enum('type', ['income', 'expense', 'transfer']);

            $table->string('description');
            $table->text('notes')->nullable();

            $table->date('transaction_date');

            $table->string('reference_number')->nullable();
            $table->string('receipt_path')->nullable();

            // Self-referencing UUID (transfer / recurring)
            $table->foreignUuid('transfer_transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->nullOnDelete();

            $table->boolean('is_recurring')->default(false);

            $table->foreignUuid('parent_recurring_transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['user_id', 'transaction_date']);
            $table->index(['user_id', 'type']);
            $table->index(['account_id', 'transaction_date']);
            $table->index('transaction_date');
            $table->index('is_recurring');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
