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
        Schema::create('currencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('code', 3)->unique(); // ISO 4217: IDR, USD, EUR
            $table->string('name');
            $table->string('symbol', 10);
            $table->string('format')->default('#,##0.00');
            $table->boolean('is_active')->default(true);

            $table->index('code');
            $table->index('is_active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
