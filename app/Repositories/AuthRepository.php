<?php

namespace App\Repositories;

use App\Interface\AuthRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthRepository implements AuthRepositoryInterface
{
    public function attempt(array $credentials, bool $remember): bool
    {
        $identity = $credentials['identity'];
        $password = $credentials['password'];

        $user = User::where('email', $identity)
            ->orWhere('username', $identity)
            ->first();

        if ($user && Hash::check($password, $user->password)) {
            Auth::login($user, $remember);
            return true;
        }

        return false;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
    }
}
