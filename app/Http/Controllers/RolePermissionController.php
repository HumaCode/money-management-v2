<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\RolePermission\RoleStoreRequest;
use App\Http\Requests\RolePermission\RoleUpdateRequest;
use App\Services\RolePermissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    private RolePermissionService $rolePermissionService;

    public function __construct(RolePermissionService $rolePermissionService)
    {
        $this->rolePermissionService = $rolePermissionService;
    }

    public function index()
    {
        $roles = $this->rolePermissionService->getAllRoles();

        return Inertia::render('RolesPermissions/Index', [
            'title'    => 'Role & Permissions',
            'subtitle' => 'Kelola grup peran pengguna dan matriks hak akses menu sistem',
            'roles'    => $roles,
        ]);
    }

    public function getMatrix(string $roleId)
    {
        try {
            $data = $this->rolePermissionService->getRolePermissionMatrix($roleId);
            return ResponseHelper::jsonResponse(true, 'Data matriks hak akses berhasil diambil', $data, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function storeRole(RoleStoreRequest $request)
    {
        try {
            $role = $this->rolePermissionService->storeRole($request->validated());
            return ResponseHelper::jsonResponse(true, 'Role baru berhasil dibuat', $role, 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function updateRole(RoleUpdateRequest $request, string $id)
    {
        try {
            $role = $this->rolePermissionService->updateRole($id, $request->validated());
            return ResponseHelper::jsonResponse(true, 'Data role berhasil diperbarui', $role, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroyRole(string $id)
    {
        try {
            $this->rolePermissionService->deleteRole($id);
            return ResponseHelper::jsonResponse(true, 'Role berhasil dihapus', null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function syncPermissions(Request $request, string $roleId)
    {
        $request->validate([
            'permission_ids'   => 'present|array',
            'permission_ids.*' => 'string',
        ]);

        try {
            $this->rolePermissionService->syncRolePermissions($roleId, $request->input('permission_ids', []));
            return ResponseHelper::jsonResponse(true, 'Hak akses role berhasil diperbarui', null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
