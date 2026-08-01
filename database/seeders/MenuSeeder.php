<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Traits\HasMenuPermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class MenuSeeder extends Seeder
{
    use HasMenuPermission;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear caches
        Cache::forget('menus_data');
        Cache::forget('menus_url_list');

        $menus = [
            // Category: MAIN
            [
                'name'        => 'Dashboard',
                'url'         => 'dashboard',
                'category'    => 'MAIN',
                'icon'        => 'LayoutDashboard',
                'is_active'   => 1,
                'orders'      => 1,
                'permissions' => ['menu', 'read', 'show'],
            ],

            // Category: MASTER
            [
                'name' => 'Categories',
                'url' => 'categories',
                'category' => 'MASTER',
                'icon' => 'Tags',
                'is_active' => 1,
                'orders' => 2,
            ],
            [
                'name' => 'Accounts',
                'url' => 'accounts',
                'category' => 'MASTER',
                'icon' => 'Wallet',
                'is_active' => 1,
                'orders' => 3,
            ],
            [
                'name' => 'Budgets',
                'url' => 'budgets',
                'category' => 'MASTER',
                'icon' => 'PieChart',
                'is_active' => 1,
                'orders' => 4,
            ],
            [
                'name' => 'Savings Goals',
                'url' => 'saving-goals',
                'category' => 'MASTER',
                'icon' => 'Target',
                'is_active' => 1,
                'orders' => 5,
            ],

            // Category: TRANSACTIONS
            [
                'name' => 'All Transactions',
                'url' => 'transactions',
                'category' => 'TRANSACTIONS',
                'icon' => 'ArrowLeftRight',
                'is_active' => 1,
                'orders' => 6,
            ],
            [
                'name' => 'Recurring',
                'url' => 'recurring-transactions',
                'category' => 'TRANSACTIONS',
                'icon' => 'Repeat',
                'is_active' => 1,
                'orders' => 7,
            ],

            // Category: REPORTS
            [
                'name' => 'Analytics',
                'url' => 'analytics',
                'category' => 'REPORTS',
                'icon' => 'BarChart3',
                'is_active' => 1,
                'orders' => 8,
            ],

            // Category: SETTINGS
            [
                'name' => 'Profile',
                'url' => 'profile',
                'category' => 'SETTINGS',
                'icon' => 'User',
                'is_active' => 1,
                'orders' => 9,
            ],
            [
                'name' => 'Preferences',
                'url' => 'preferences',
                'category' => 'SETTINGS',
                'icon' => 'Settings',
                'is_active' => 1,
                'orders' => 10,
            ],
        ];

        foreach ($menus as $data) {
            // Ambil dan pisahkan 'permissions' dari array utama jika ada
            $customPermissions = $data['permissions'] ?? null;

            // Hapus 'permissions' dari array agar updateOrCreate tidak error
            unset($data['permissions']);

            $menu = Menu::updateOrCreate(
                ['url' => $data['url']],
                $data
            );

            // Pasangkan permission dan daftarkan ke roles ['dev', 'admin', 'user']
            $this->attachMenupermission($menu, $customPermissions, ['dev']);
        }
    }
}
