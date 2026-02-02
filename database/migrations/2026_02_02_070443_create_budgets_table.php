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
        Schema::create('budgets', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignUuid('currency_id')
                ->constrained('currencies')
                ->restrictOnDelete();

            $table->string('name');

            $table->decimal('total_amount', 20, 2);

            $table->enum('period', ['weekly', 'monthly', 'quarterly', 'yearly']);

            $table->date('start_date');
            $table->date('end_date');

            $table->boolean('is_active')->default(true);
            $table->boolean('rollover_unused')->default(false);

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['start_date', 'end_date']);
            $table->index('period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
