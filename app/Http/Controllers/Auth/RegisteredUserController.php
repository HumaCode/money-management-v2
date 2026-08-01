<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shield\Role;
use App\Rules\Recaptcha;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view using Inertia React.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request and automatically assign 'user' role.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'                 => ['required', 'string', 'max:255'],
            'username'             => ['required', 'string', 'max:50', 'unique:' . User::class],
            'email'                => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'password'             => ['required', 'confirmed', Rules\Password::defaults()],
            'g-recaptcha-response' => ['nullable', new Recaptcha],
        ]);

        $user = User::create([
            'name'      => $request->name,
            'username'  => $request->username,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'is_active' => '1',
        ]);

        // Otomatis assign ke role 'user' (atau slug 'user')
        $userRole = Role::where('slug', 'user')->orWhere('name', 'user')->first();
        if ($userRole) {
            $user->assignRole($userRole);
        }

        event(new Registered($user));
        Auth::login($user);

        return response()->json([
            'status'   => 'success',
            'message'  => 'Registrasi berhasil! Mengalihkan...',
            'redirect' => route('dashboard'),
        ]);
    }
}
