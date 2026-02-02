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
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('type', [
                'budget_limit',
                'savings_goal',
                'bill_reminder',
                'recurring',
                'system',
            ]);

            $table->string('title');
            $table->text('message');

            // Polymorphic UUID reference
            $table->uuid('related_model_id')->nullable();
            $table->string('related_model_type')->nullable();

            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_read']);
            $table->index(['user_id', 'type']);
            $table->index(['related_model_type', 'related_model_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
