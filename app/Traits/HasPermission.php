<?php

namespace App\Traits;

trait HasPermission
{
    protected $abilities = [
        'index'   => 'read',
        'create'  => 'create',
        'store'   => 'create',
        'show'    => 'show',
        'edit'    => 'update',
        'update'  => 'update',
        'menu'    => 'menu',
        'destroy' => 'delete',
    ];

    public function callAction($method, $parameters)
    {
        $action = $this->abilities[$method] ?? null;

        if ($action) {
            // Ambil prefix static dari route dan bersihkan ke segmen pertama (URL utama menu)
            $route = request()->route();
            if ($route && $route->getCompiled()) {
                $rawPath = ltrim($route->getCompiled()->getStaticPrefix(), '/');
                $segments = explode('/', $rawPath);
                $staticPath = $segments[0] ?? $rawPath;

                // Saluran pengecekan otorisasi (Bypass jika Dashboard atau Role Dev)
                $isDashboard = ($staticPath === 'dashboard');
                $user = request()->user();
                $isDev = $user && ($user->hasRole('developer') || $user->hasRole('dev'));

                if (! $isDashboard && ! $isDev) {
                    static $allowedUrls = null;
                    if ($allowedUrls === null) {
                        $allowedUrls = array_flip(urlMenu());
                    }

                    if (isset($allowedUrls[$staticPath])) {
                        $this->authorize("{$action} {$staticPath}");
                    }
                }
            }
        }

        // Panggil method controller asli secara fleksibel & aman tanpa klausa `parent::`
        return $this->$method(...array_values($parameters));
    }
}
