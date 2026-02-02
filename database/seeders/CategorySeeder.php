<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /**
         * INCOME ROOT
         */
        $salary = Category::create([
            'user_id' => null,
            'parent_id' => null,
            'name' => 'Salary',
            'slug' => 'salary',
            'type' => 'income',
            'icon' => '💰',
            'color' => '#10b981',
            'is_active' => true,
        ]);

        $business = Category::create([
            'user_id' => null,
            'parent_id' => null,
            'name' => 'Business Income',
            'slug' => 'business-income',
            'type' => 'income',
            'icon' => '💼',
            'color' => '#3b82f6',
            'is_active' => true,
        ]);

        /**
         * INCOME CHILD
         */
        Category::create([
            'user_id' => null,
            'parent_id' => $salary->id,
            'name' => 'Monthly Salary',
            'slug' => 'monthly-salary',
            'type' => 'income',
            'icon' => '📅',
            'color' => '#22c55e',
            'is_active' => true,
        ]);

        Category::create([
            'user_id' => null,
            'parent_id' => $business->id,
            'name' => 'Online Business',
            'slug' => 'online-business',
            'type' => 'income',
            'icon' => '🛒',
            'color' => '#2563eb',
            'is_active' => true,
        ]);

        /**
         * EXPENSE ROOT
         */
        $food = Category::create([
            'user_id' => null,
            'parent_id' => null,
            'name' => 'Food & Dining',
            'slug' => 'food-dining',
            'type' => 'expense',
            'icon' => '🍔',
            'color' => '#ef4444',
            'is_active' => true,
        ]);

        $transport = Category::create([
            'user_id' => null,
            'parent_id' => null,
            'name' => 'Transportation',
            'slug' => 'transportation',
            'type' => 'expense',
            'icon' => '🚗',
            'color' => '#f97316',
            'is_active' => true,
        ]);

        /**
         * EXPENSE CHILD
         */
        Category::create([
            'user_id' => null,
            'parent_id' => $food->id,
            'name' => 'Street Food',
            'slug' => 'street-food',
            'type' => 'expense',
            'icon' => '🌮',
            'color' => '#dc2626',
            'is_active' => true,
        ]);

        Category::create([
            'user_id' => null,
            'parent_id' => $transport->id,
            'name' => 'Fuel',
            'slug' => 'fuel',
            'type' => 'expense',
            'icon' => '⛽',
            'color' => '#ea580c',
            'is_active' => true,
        ]);
    }
}
