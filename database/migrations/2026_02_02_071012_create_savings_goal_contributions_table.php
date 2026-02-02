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
        Schema::create('savings_goal_contributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('savings_goal_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 20, 2);
            $table->text('notes')->nullable();
            $table->timestamp('contributed_at')->useCurrent();

            $table->index('savings_goal_id');
            $table->index('transaction_id');
            $table->index('contributed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_goal_contributions');
    }
};
