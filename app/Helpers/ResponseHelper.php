<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ResponseHelper
{
    public static function jsonResponse($success, $message, $data, $statusCode): JsonResponse
    {
        return response()->json([
            'success'   => $success,
            'message'   => $message,
            'data'      => $data,
        ], $statusCode);
    }

    public static function success($data = null, $message = 'Success', $statusCode = 200): JsonResponse
    {
        return self::jsonResponse(true, $message, $data, $statusCode);
    }

    public static function error($message = 'Error', $statusCode = 400, $data = null): JsonResponse
    {
        return self::jsonResponse(false, $message, $data, $statusCode);
    }
}