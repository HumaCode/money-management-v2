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
        Schema::table('budget_categories', function (Blueprint $table) {
            $table->date('spent_date')->nullable()->after('spent_amount');
            $table->index('spent_date');
            $table->text('notes')->nullable()->after('spent_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budget_categories', function (Blueprint $table) {
            $table->dropColumn('spent_date');
            $table->dropColumn('notes');
        });
    }
};
