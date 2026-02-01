<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'id'                => Str::uuid(),
                'name'              => 'Super Administrator',
                'username'          => 'superadmin',
                'avatar'            => null,
                'phone'             => '081234567890',
                'gender'            => 'male',
                'email'             => 'superadmin@example.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'is_active'         => '1',
                'last_login_at'     => null,
                'last_login_ip'     => null,
                'remember_token'    => Str::random(10),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]
        ]);
    }
}
