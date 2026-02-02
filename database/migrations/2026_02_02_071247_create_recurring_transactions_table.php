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
        Schema::create('recurring_transactions', function (Blueprint $table) {
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

            $table->enum('type', ['income', 'expense']);

            $table->string('description');

            $table->enum('frequency', [
                'daily',
                'weekly',
                'bi_weekly',
                'monthly',
                'quarterly',
                'yearly',
            ]);

            $table->tinyInteger('day_of_month')->nullable(); // 1–31
            $table->tinyInteger('day_of_week')->nullable();  // 0–6 (Sun–Sat)

            $table->date('start_date');
            $table->date('end_date')->nullable();

            $table->date('next_occurrence_date');

            $table->boolean('is_active')->default(true);

            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index(['next_occurrence_date', 'is_active']);
            $table->index('frequency');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};
