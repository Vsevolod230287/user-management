<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class RolesAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Recupera il ruolo admin già presente
        $adminRole = Role::query()->where('name', 'admin')->first();

        if (!$adminRole) {
            $this->command->info('Ruolo admin non trovato. Assicurati che sia presente nel DB.');
            return;
        }

        // Crea utente admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password123')
            ]
        );

        // Assegna il ruolo admin
        $admin->assignRole($adminRole);

        $this->command->info('Utente admin creato con ruolo admin.');
    }
}
