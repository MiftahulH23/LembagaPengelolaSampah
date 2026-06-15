<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'nohp' => '081234567890',
                'role' => 'superadmin',
                'password' => Hash::make('password'),
            ]
        );
    }
}
