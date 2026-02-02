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
        Schema::create('savings_goals', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignUuid('account_id')
                ->constrained('accounts')
                ->cascadeOnDelete();

            $table->foreignUuid('currency_id')
                ->constrained('currencies')
                ->restrictOnDelete();

            $table->string('name');
            $table->text('description')->nullable();

            $table->decimal('target_amount', 20, 2);
            $table->decimal('current_amount', 20, 2)->default(0);
            $table->decimal('monthly_target', 20, 2)->nullable();

            $table->date('target_date')->nullable();

            $table->enum('status', ['active', 'paused', 'completed', 'cancelled'])
                ->default('active');

            $table->string('icon')->nullable();
            $table->string('color', 7)->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('target_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_goals');
    }
};
