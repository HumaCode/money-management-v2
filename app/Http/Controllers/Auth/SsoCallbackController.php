<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\SsoConfig;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class SsoCallbackController extends Controller
{
    /**
     * Redirect user to SSO authorization page.
     */
    public function redirect()
    {
        $config = SsoConfig::get();

        if (!($config['sso_enabled'] ?? false)) {
            return redirect()->route('login')->withErrors(['sso' => 'SSO tidak diaktifkan.']);
        }

        // Generate PKCE state for CSRF protection
        $state = Str::random(40);
        Session::put('sso_state', $state);

        $params = http_build_query([
            'client_id'     => $config['sso_client_id'],
            'redirect_uri'  => $config['sso_redirect_uri'] ?: url('/auth/callback'),
            'response_type' => 'code',
            'scope'         => 'profile roles',
            'state'         => $state,
        ]);

        return redirect(rtrim($config['sso_provider_url'], '/') . '/oauth/authorize?' . $params);
    }

    /**
     * Handle callback from SSO provider.
     */
    public function callback(Request $request)
    {
        $config = SsoConfig::get();

        // Validate state
        $state = $request->input('state');
        if (!$state || $state !== Session::pull('sso_state')) {
            Log::warning('SSO callback: state mismatch', ['received' => $state]);
            return redirect()->route('login')->withErrors(['sso' => 'State tidak valid. Silakan coba lagi.']);
        }

        // Check for error from SSO
        if ($request->has('error')) {
            Log::warning('SSO callback error: ' . $request->input('error'));
            return redirect()->route('login')->withErrors([
                'sso' => 'SSO menolak akses: ' . $request->input('error_description', $request->input('error')),
            ]);
        }

        $code        = $request->input('code');
        $providerUrl = rtrim($config['sso_provider_url'], '/');

        try {
            // Exchange authorization code for access token
            $tokenResponse = Http::asForm()->post($providerUrl . '/oauth/token', [
                'grant_type'    => 'authorization_code',
                'client_id'     => $config['sso_client_id'],
                'client_secret' => $config['sso_client_secret'],
                'redirect_uri'  => $config['sso_redirect_uri'] ?: url('/auth/callback'),
                'code'          => $code,
            ]);

            if (!$tokenResponse->successful()) {
                Log::error('SSO token exchange failed', $tokenResponse->json() ?? []);
                return redirect()->route('login')->withErrors([
                    'sso' => 'Gagal mendapatkan token dari SSO: ' . ($tokenResponse->json()['error_description'] ?? 'Unknown error'),
                ]);
            }

            $tokenData   = $tokenResponse->json();
            $accessToken = $tokenData['access_token'];

            // Get user info from SSO
            $userResponse = Http::withToken($accessToken)->get($providerUrl . '/api/userinfo');

            if (!$userResponse->successful()) {
                Log::error('SSO userinfo failed', $userResponse->json() ?? []);
                return redirect()->route('login')->withErrors(['sso' => 'Gagal mengambil data pengguna dari SSO.']);
            }

            $ssoUser = $userResponse->json();

            // Find or create user in local database
            $user = $this->findOrCreateUser($ssoUser);

            if (!$user) {
                return redirect()->route('login')->withErrors(['sso' => 'Akun tidak ditemukan atau tidak aktif.']);
            }

            // Login the user
            Auth::login($user, true);
            $request->session()->regenerate();

            Log::info('SSO Login success', ['user_id' => $user->id, 'email' => $user->email]);

            return redirect()->intended(route('dashboard'));

        } catch (\Throwable $e) {
            Log::error('SSO callback exception: ' . $e->getMessage());
            return redirect()->route('login')->withErrors(['sso' => 'Terjadi kesalahan saat proses SSO: ' . $e->getMessage()]);
        }
    }

    /**
     * Find existing user by email, or create new one from SSO data.
     */
    protected function findOrCreateUser(array $ssoUser): ?\App\Models\User
    {
        $email = $ssoUser['email'] ?? null;

        if (!$email) {
            return null;
        }

        $user = \App\Models\User::where('email', $email)->first();

        if ($user) {
            // Update name if changed
            if ($user->name !== ($ssoUser['name'] ?? $user->name)) {
                $user->update(['name' => $ssoUser['name']]);
            }
            return $user;
        }

        // Create new user from SSO data
        $user = \App\Models\User::create([
            'name'              => $ssoUser['name']  ?? 'SSO User',
            'username'          => $this->generateUsername($ssoUser),
            'email'             => $email,
            'password'          => \Illuminate\Support\Facades\Hash::make(Str::random(32)),
            'email_verified_at' => now(),
            'is_active'         => true,
        ]);

        // Assign default role if available
        if (class_exists(\Spatie\Permission\Models\Role::class)) {
            $defaultRole = \Spatie\Permission\Models\Role::where('slug', 'user')
                ->orWhere('name', 'user')
                ->first();
            if ($defaultRole) {
                $user->assignRole($defaultRole);
            }
        }

        return $user;
    }

    protected function generateUsername(array $ssoUser): string
    {
        $base     = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $ssoUser['name'] ?? 'user'));
        $base     = $base ?: 'user';
        $username = $base;
        $i        = 1;

        while (\App\Models\User::where('username', $username)->exists()) {
            $username = $base . $i++;
        }

        return $username;
    }
}
