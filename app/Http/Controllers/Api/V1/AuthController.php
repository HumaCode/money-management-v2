<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login for Mobile App (accepts username or email + password via LoginRequest)
     */
    public function login(LoginRequest $request)
    {
        $loginInput = $request->input('login');
        $password   = $request->input('password');

        // Search user by username OR email
        $user = User::where('username', $loginInput)
            ->orWhere('email', $loginInput)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return ResponseHelper::error('Username / Email atau Password salah', 401);
        }

        if (isset($user->is_active) && !$user->is_active) {
            return ResponseHelper::error('Akun Anda sedang dinonaktifkan', 403);
        }

        // Update login stats
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Create Sanctum Token
        $deviceName = $request->input('device_name', 'money_manajemen_mobile');
        $token = $user->createToken($deviceName)->plainTextToken;

        return ResponseHelper::success([
            'token'      => $token,
            'token_type' => 'Bearer',
            'user'       => [
                'id'        => $user->id,
                'name'      => $user->name,
                'username'  => $user->username,
                'email'     => $user->email,
                'phone'     => $user->phone,
                'avatar'    => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'gender'    => $user->gender,
            ],
        ], 'Login berhasil');
    }

    /**
     * Get Current Authenticated User Profile
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('preference.currency');

        return ResponseHelper::success([
            'id'         => $user->id,
            'name'       => $user->name,
            'username'   => $user->username,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'gender'     => $user->gender,
            'avatar'     => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'preference' => $user->preference,
        ], 'Profil pengguna');
    }

    /**
     * Logout & Revoke Mobile Token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ResponseHelper::success(null, 'Logout berhasil');
    }
}
