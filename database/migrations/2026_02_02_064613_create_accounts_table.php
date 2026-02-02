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
        Schema::create('accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignUuid('account_type_id')
                ->constrained('account_types')
                ->restrictOnDelete();

            $table->foreignUuid('currency_id')
                ->constrained('currencies')
                ->restrictOnDelete();

            $table->string('name');
            $table->string('institution_name')->nullable();
            $table->string('account_number')->nullable();

            $table->decimal('balance', 20, 2)->default(0);
            $table->decimal('credit_limit', 20, 2)->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
