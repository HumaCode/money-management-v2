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
        Schema::create('budget_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('budget_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('category_id')->constrained()->onDelete('cascade');
            $table->decimal('allocated_amount', 20, 2);
            $table->decimal('spent_amount', 20, 2)->default(0);

            $table->unique(['budget_id', 'category_id']);
            $table->index('budget_id');
            $table->index('category_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_categories');
    }
};
