<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ReactLoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(ReactLoginRequest $request): JsonResponse
    {
        $credentials = $request->only('identity', 'password');
        $remember = $request->boolean('remember');

        $identity = $credentials['identity'];
        $password = $credentials['password'];
        $user = \App\Models\User::where('email', $identity)->orWhere('username', $identity)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'identity' => ['Username / Email tidak ditemukan di database.'],
            ]);
        }

        if (!\Illuminate\Support\Facades\Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'identity' => ['Password salah.'],
            ]);
        }

        if ($this->authService->login($credentials, $remember)) {
            $request->session()->regenerate();

            $redirectUrl = route('dashboard');
            // Ensure redirect URL matches the current request's scheme
            if (request()->isSecure() === false && str_starts_with($redirectUrl, 'https://')) {
                $redirectUrl = 'http://' . substr($redirectUrl, 8);
            }

            return response()->json([
                'status'   => 'success',
                'redirect' => $redirectUrl,
                'user'     => new UserResource(Auth::user()),
            ]);
        }

        throw ValidationException::withMessages([
            'identity' => [__('auth.failed')],
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $this->authService->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Check if SSO is enabled
        if (\App\Helpers\SsoConfig::isEnabled()) {
            $ssoConfig   = \App\Helpers\SsoConfig::get();
            $providerUrl = rtrim($ssoConfig['sso_provider_url'] ?? 'http://localhost:8000', '/');
            $redirectBack = route('login');

            return redirect($providerUrl . '/sso/logout?redirect_uri=' . urlencode($redirectBack));
        }

        return redirect('/');
    }
}
