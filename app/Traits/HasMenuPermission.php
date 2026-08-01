<?php

namespace App\Traits;

use App\Models\Menu;
use App\Models\Shield\Permission;

trait HasMenuPermission
{
    public function attachMenupermission(Menu $menu, ?array $permissions, ?array $roles)
    {
        if (! is_array($permissions)) {
            $permissions = ['menu', 'create', 'read', 'show', 'update', 'delete'];
        }

        foreach ($permissions as $item) {
            $permission = Permission::firstOrCreate([
                'name' => $item." $menu->url",
            ], [
                'guard_name' => 'web',
            ]);

            $permission->menus()->syncWithoutDetaching([$menu->id]);

            if ($roles) {
                $roleModels = \App\Models\Shield\Role::whereIn('slug', $roles)->get();
                if ($roleModels->isNotEmpty()) {
                    $permission->assignRole($roleModels);
                }
            }
        }
    }
}
