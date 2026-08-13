<?php

namespace App\Http\Controllers;

use App\Helpers\SsoConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SsoController extends Controller
{
    /**
     * Get current SSO configuration.
     */
    public function getConfig(): JsonResponse
    {
        $config = SsoConfig::get();

        return response()->json([
            'success' => true,
            'data'    => $config,
        ]);
    }

    /**
     * Save SSO configuration.
     */
    public function saveConfig(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sso_enabled'       => ['required', 'boolean'],
            'sso_provider_url'  => ['nullable', 'url', 'max:255'],
            'sso_client_id'     => ['nullable', 'string', 'max:255'],
            'sso_client_secret' => ['nullable', 'string', 'max:500'],
            'sso_redirect_uri'  => ['nullable', 'string', 'max:500'],
        ]);

        SsoConfig::save($validated);

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi SSO berhasil disimpan.',
            'data'    => [
                'sso_enabled' => $validated['sso_enabled'],
            ],
        ]);
    }

    /**
     * Test connection to SSO provider.
     */
    public function testConnection(Request $request): JsonResponse
    {
        $url = $request->input('sso_provider_url') ?: SsoConfig::get()['sso_provider_url'];

        if (!$url) {
            return response()->json(['success' => false, 'message' => 'SSO Provider URL tidak boleh kosong.'], 422);
        }

        try {
            $pingUrl  = rtrim($url, '/') . '/api/ping';
            $response = \Illuminate\Support\Facades\Http::timeout(5)->get($pingUrl);

            if ($response->successful()) {
                return response()->json(['success' => true, 'message' => 'Berhasil terhubung ke SSO server.']);
            }

            return response()->json([
                'success' => false,
                'message' => 'SSO server merespons dengan status ' . $response->status() . '.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal terhubung: ' . $e->getMessage(),
            ]);
        }
    }
}
