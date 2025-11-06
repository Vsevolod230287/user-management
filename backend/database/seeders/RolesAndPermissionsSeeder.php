<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Ruoli
        $admin = Role::create(['name' => 'admin']);
        $user = Role::create(['name' => 'user']);

        // Permessi
        $manageUsers = Permission::create(['name' => 'manage users']); // admin
        $editSelf = Permission::create(['name' => 'edit self']);       // user

        // Assegna permessi ai ruoli
        $admin->givePermissionTo($manageUsers);
        $user->givePermissionTo($editSelf);
    }
}
