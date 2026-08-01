<?php

namespace App\Repositories;

use App\Interface\ProfileRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ProfileRepository implements ProfileRepositoryInterface
{
    public function getProfileData(string $userId)
    {
        return User::withCount(['transactions', 'accounts', 'budgets', 'savingsGoals'])->find($userId);
    }

    public function updateProfileInformation(string $userId, array $data)
    {
        $user = User::findOrFail($userId);
        
        $user->fill([
            'name'  => $data['name'],
            'email' => $data['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $user;
    }

    public function updatePassword(string $userId, string $newPassword)
    {
        $user = User::findOrFail($userId);
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return $user;
    }

    public function deleteAccount(string $userId)
    {
        $user = User::findOrFail($userId);
        return $user->delete();
    }
}
