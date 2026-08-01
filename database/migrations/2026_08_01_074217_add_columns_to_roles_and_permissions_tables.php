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
        Schema::table('roles', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
            $table->enum('type_role', ['system', 'custom'])->default('system')->after('slug');
            $table->string('color', 7)->nullable()->after('type_role')->comment('Hex color code, e.g. #14b8a6');
            $table->boolean('is_active')->default(true)->after('color');
            $table->text('description')->nullable()->after('is_active');
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('guard_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['slug', 'type_role', 'color', 'is_active', 'description']);
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn(['is_active']);
        });
    }
};
