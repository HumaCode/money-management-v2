<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\User\UserStoreRequest;
use App\Http\Requests\User\UserUpdateRequest;
use App\Http\Resources\PaginateResource;
use App\Http\Resources\UserResource;
use App\Models\Shield\Role;
use App\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        $roles = Role::where('is_active', true)
            ->get(['id', 'name', 'slug', 'color']);

        return Inertia::render('Users/Index', [
            'title'    => 'Manage Users',
            'subtitle' => 'Kelola pengguna sistem, peran hak akses, dan status akun',
            'roles'    => $roles,
        ]);
    }

    public function getAllPaginated(Request $request)
    {
        $requestData = $request->validate([
            'search'       => 'nullable|string',
            'status'       => 'nullable|string',
            'role'         => 'nullable|string',
            'row_per_page' => 'required|integer',
        ]);

        try {
            $users = $this->userService->getAllPaginated(
                $requestData['search'] ?? null,
                $requestData['status'] ?? null,
                $requestData['role'] ?? null,
                $requestData['row_per_page']
            );

            return ResponseHelper::jsonResponse(
                true, 
                'Data user berhasil diambil', 
                PaginateResource::make($users, UserResource::class), 
                200
            );
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function store(UserStoreRequest $request)
    {
        try {
            $user = $this->userService->store($request->validated());
            return ResponseHelper::jsonResponse(true, 'Pengguna baru berhasil dibuat', new UserResource($user), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function update(UserUpdateRequest $request, string $id)
    {
        try {
            $user = $this->userService->update($id, $request->validated());
            return ResponseHelper::jsonResponse(true, 'Data pengguna berhasil diperbarui', new UserResource($user), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $this->userService->delete($id);
            return ResponseHelper::jsonResponse(true, 'Pengguna berhasil dihapus', null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
