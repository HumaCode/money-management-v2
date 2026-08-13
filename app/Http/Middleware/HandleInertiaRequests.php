<?php

namespace App\Http\Middleware;

use App\Helpers\SsoConfig;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $ssoConfig = SsoConfig::get();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'          => $request->user()->id,
                    'name'        => $request->user()->name,
                    'username'    => $request->user()->username,
                    'email'       => $request->user()->email,
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
                    'roles'       => $request->user()->roles()->pluck('slug')->toArray(),
                ] : null,
            ],
            'menus' => fn () => $request->user() ? menus(true)->map(function ($items) use ($request) {
                return $items->filter(function ($menu) use ($request) {
                    $user = $request->user();
                    if ($menu->url === 'dashboard' || $user->hasRole('developer') || $user->hasRole('dev')) {
                        return true;
                    }
                    return $user->hasPermissionTo("menu {$menu->url}");
                });
            })->filter(fn ($items) => $items->isNotEmpty()) : [],
            'locale'     => config('app.locale', 'id'),
            'sso_config' => [
                'sso_enabled'      => $ssoConfig['sso_enabled'] ?? false,
                'sso_provider_url' => $ssoConfig['sso_provider_url'] ?? '',
            ],
        ];
    }
}
