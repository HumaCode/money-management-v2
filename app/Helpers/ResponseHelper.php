<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ResponseHelper
{
    /**
     * Standard JSON Response Format
     *
     * {
     *   "success": true | false,
     *   "message": "Pesan deskripsi",
     *   "data": { ... }
     * }
     */
    public static function jsonResponse(bool $success, string $message, mixed $data = null, int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data'    => $data,
        ], $statusCode);
    }

    /**
     * Standard Success Response (Default 200 OK)
     */
    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return self::jsonResponse(true, $message, $data, $statusCode);
    }

    /**
     * Standard Error Response (Default 400 Bad Request)
     */
    public static function error(string $message = 'Error', int $statusCode = 400, mixed $data = null): JsonResponse
    {
        return self::jsonResponse(false, $message, $data, $statusCode);
    }

    /**
     * Standard Paginated Resource Response Format
     */
    public static function paginatedResource($paginator, string $resourceClass, string $message = 'Success'): JsonResponse
    {
        $items = $resourceClass::collection($paginator->getCollection());

        return response()->json([
            'success'    => true,
            'message'    => $message,
            'data'       => $items,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'has_more'     => $paginator->hasMorePages(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
        ], 200);
    }

    /**
     * Standard Validation Error Response (422 Unprocessable Entity)
     */
    public static function validationError(mixed $errors, string $message = 'Validasi gagal'): JsonResponse
    {
        return self::jsonResponse(false, $message, $errors, 422);
    }

    /**
     * Standard Unauthorized Response (401 Unauthorized)
     */
    public static function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return self::jsonResponse(false, $message, null, 401);
    }

    /**
     * Standard Forbidden Response (403 Forbidden)
     */
    public static function forbidden(string $message = 'Akses ditolak'): JsonResponse
    {
        return self::jsonResponse(false, $message, null, 403);
    }

    /**
     * Standard Not Found Response (404 Not Found)
     */
    public static function notFound(string $message = 'Data tidak ditemukan'): JsonResponse
    {
        return self::jsonResponse(false, $message, null, 404);
    }
}

// Global Helper Functions for Reusability
if (!function_exists('apiSuccess')) {
    function apiSuccess($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return ResponseHelper::success($data, $message, $statusCode);
    }
}

if (!function_exists('apiError')) {
    function apiError(string $message = 'Error', int $statusCode = 400, $data = null): JsonResponse
    {
        return ResponseHelper::error($message, $statusCode, $data);
    }
}