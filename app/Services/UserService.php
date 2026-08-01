<?php

namespace App\Services;

use App\Models\User;
use App\Models\Shield\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Get paginated user records with search and status filters.
     */
    public function getAllPaginated(?string $search, ?string $status, ?string $role, int $perPage = 10): LengthAwarePaginator
    {
        return User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                if ($status === 'active') {
                    $query->where('is_active', '1');
                } elseif ($status === 'inactive') {
                    $query->where('is_active', '0');
                }
            })
            ->when($role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('slug', $role)->orWhere('name', $role);
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Store a new user and assign role.
     */
    public function store(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'      => $data['name'],
                'username'  => $data['username'],
                'email'     => $data['email'],
                'phone'     => $data['phone'] ?? null,
                'gender'    => $data['gender'] ?? null,
                'password'  => Hash::make($data['password']),
                'is_active' => filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            ]);

            $roleModel = Role::where('slug', $data['role'])->orWhere('name', $data['role'])->first();
            if ($roleModel) {
                $user->assignRole($roleModel);
            }

            return $user;
        });
    }

    /**
     * Update existing user record and sync role.
     */
    public function update(string $id, array $data): User
    {
        return DB::transaction(function () use ($id, $data) {
            $user = User::findOrFail($id);

            $updateData = [
                'name'      => $data['name'],
                'username'  => $data['username'],
                'email'     => $data['email'],
                'phone'     => $data['phone'] ?? null,
                'gender'    => $data['gender'] ?? null,
                'is_active' => filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            ];

            if (!empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            $user->update($updateData);

            if (!empty($data['role'])) {
                $roleModel = Role::where('slug', $data['role'])->orWhere('name', $data['role'])->first();
                if ($roleModel) {
                    $user->syncRoles([$roleModel]);
                }
            }

            return $user;
        });
    }

    /**
     * Delete user record.
     */
    public function delete(string $id): bool
    {
        $user = User::findOrFail($id);
        return $user->delete();
    }
}
