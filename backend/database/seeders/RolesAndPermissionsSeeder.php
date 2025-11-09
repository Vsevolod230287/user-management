<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Ruoli
        $admin = Role::query()->where('name', 'admin')->first();
        if (!$admin) {
            $admin = Role::create(['name' => 'admin']);
        }

        $user = Role::query()->where('name', 'user')->first();
        if (!$user) {
            $user = Role::create(['name' => 'user',]);
        }

        // Permessi
        $manageUsers = Permission::query()->where('name', 'manage users')->first();
        if (!$manageUsers) {
            $manageUsers = Permission::create(['name' => 'manage users']);
        }

        $editSelf = Permission::query()->where('name', 'edit self')->first();
        if (!$editSelf) {
            $editSelf = Permission::create(['name' => 'edit self']);
        }

        // Assegna permessi ai ruoli
        $admin->givePermissionTo($manageUsers);
        $user->givePermissionTo($editSelf);
    }
}
