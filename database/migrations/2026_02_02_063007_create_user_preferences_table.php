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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->onDelete('cascade');
            $table->unsignedInteger('default_currency_id')->nullable();
            $table->tinyInteger('fiscal_year_start_month')->default(1); // 1-12
            $table->string('theme')->default('system'); // light, dark, system
            $table->string('language', 5)->default('en'); // en, id
            $table->string('date_format')->default('DD/MM/YYYY');
            $table->string('number_format')->default('1,000.00');
            $table->boolean('notification_email')->default(true);
            $table->boolean('notification_push')->default(true);
            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
