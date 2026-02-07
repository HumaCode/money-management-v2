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
        Schema::table('budgets', function (Blueprint $table) {
            $table->decimal('total_spent', 15, 2)->default(0)->after('rollover_unused');
            $table->decimal('progress_percentage', 5, 2)->default(0)->after('total_spent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn('total_spent');
            $table->dropColumn('progress_percentage');
        });
    }
};
