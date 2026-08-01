<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Shield\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users   = ['dev', 'admin', 'user'];
        $default = [
            'email_verified_at' => now(),
            'password'          => Hash::make('123'),
            'remember_token'    => Str::random(10)
        ];

        foreach ($users as $value) {
            $user = User::firstOrCreate(
                ['username' => $value],
                array_merge($default, [
                    'name'      => ucwords($value),
                    'email'     => $value . '@gmail.com',
                    'is_active' => '1',
                ])
            );
            
            // Assign role strictly by slug
            $role = Role::where('slug', $value)->first();
            if ($role && !$user->hasRole($role->name)) {
                $user->assignRole($role);
            }
        }
    }
}
