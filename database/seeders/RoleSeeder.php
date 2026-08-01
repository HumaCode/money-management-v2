<?php

namespace Database\Seeders;

use App\Models\Shield\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name'        => 'developer',
                'slug'        => 'dev',
                'type_role'   => 'system',
                'color'       => '#6366f1', // Indigo / Purple accent
                'is_active'   => true,
                'description' => 'Akses penuh seluruh sistem, developer & konfigurasi teknis.',
                'guard_name'  => 'web',
            ],
            [
                'name'        => 'administrator',
                'slug'        => 'admin',
                'type_role'   => 'system',
                'color'       => '#14b8a6', // Teal / Green accent
                'is_active'   => true,
                'description' => 'Pengelola sistem, manajemen pengguna, transaksi, dan laporan.',
                'guard_name'  => 'web',
            ],
            [
                'name'        => 'user pengguna',
                'slug'        => 'user',
                'type_role'   => 'custom',
                'color'       => '#3b82f6', // Blue accent
                'is_active'   => true,
                'description' => 'Pengguna aplikasi standar untuk mencatat keuangan pribadi.',
                'guard_name'  => 'web',
            ],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );
        }
    }
}
