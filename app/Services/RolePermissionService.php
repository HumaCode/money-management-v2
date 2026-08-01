<?php

namespace App\Services;

use App\Models\Shield\Role;
use App\Models\Shield\Permission;
use App\Models\Menu;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RolePermissionService
{
    /**
     * Get all roles with permission count & assigned users count.
     */
    public function getAllRoles(): Collection
    {
        return Role::withCount(['permissions', 'users'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Store new custom role.
     */
    public function storeRole(array $data): Role
    {
        return Role::create([
            'name'        => $data['name'],
            'slug'        => $data['slug'],
            'type_role'   => 'custom',
            'color'       => $data['color'] ?? '#3b82f6',
            'description' => $data['description'] ?? null,
            'is_active'   => filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN),
            'guard_name'  => 'web',
        ]);
    }

    /**
     * Update existing role.
     */
    public function updateRole(string $id, array $data): Role
    {
        $role = Role::findOrFail($id);
        $role->update([
            'name'        => $data['name'],
            'slug'        => $data['slug'],
            'color'       => $data['color'] ?? $role->color,
            'description' => $data['description'] ?? null,
            'is_active'   => filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN),
        ]);

        return $role;
    }

    /**
     * Delete role.
     */
    public function deleteRole(string $id): bool
    {
        $role = Role::findOrFail($id);
        if ($role->type_role === 'system') {
            throw new \Exception('System roles cannot be deleted.');
        }
        return $role->delete();
    }

    /**
     * Get matrix structure of Menus and their permissions, with flag if assigned to specified role.
     */
    public function getRolePermissionMatrix(string $roleId): array
    {
        $role = Role::findOrFail($roleId);
        $assignedPermissionIds = $role->permissions()->pluck('id')->toArray();

        $menus = Menu::with(['permissions'])
            ->orderBy('orders', 'asc')
            ->get();

        $groupedMatrix = [];

        foreach ($menus as $menu) {
            $category = $menu->category ?: 'OTHER';
            if (!isset($groupedMatrix[$category])) {
                $groupedMatrix[$category] = [];
            }

            $menuPermissions = [];
            foreach ($menu->permissions as $perm) {
                $menuPermissions[] = [
                    'id'          => $perm->id,
                    'name'        => $perm->name,
                    'is_assigned' => in_array($perm->id, $assignedPermissionIds),
                ];
            }

            $groupedMatrix[$category][] = [
                'id'          => $menu->id,
                'name'        => $menu->name,
                'url'         => $menu->url,
                'icon'        => $menu->icon,
                'permissions' => $menuPermissions,
            ];
        }

        return [
            'role'   => [
                'id'    => $role->id,
                'name'  => $role->name,
                'slug'  => $role->slug,
                'color' => $role->color,
            ],
            'matrix' => $groupedMatrix,
        ];
    }

    /**
     * Sync permissions to role.
     */
    public function syncRolePermissions(string $roleId, array $permissionIds): Role
    {
        return DB::transaction(function () use ($roleId, $permissionIds) {
            $role = Role::findOrFail($roleId);
            $role->syncPermissions($permissionIds);
            
            // Clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return $role;
        });
    }
}
