<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MobileDashboardController;
use App\Http\Controllers\Api\V1\MobileSavingsGoalController;
use App\Http\Controllers\Api\V1\MobileTransactionController;
use App\Http\Middleware\ValidateMobileApiKey;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile REST API Routes (v1)
| Protected with Secret App Key (humacode2026 / hash sha256)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->middleware([ValidateMobileApiKey::class])->group(function () {
    
    // Public Authentication
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected Routes (Sanctum Bearer Token Required)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth profile & logout
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Dashboard Summary
        Route::get('/dashboard', [MobileDashboardController::class, 'index']);

        // Transactions
        Route::get('/transactions', [MobileTransactionController::class, 'index']);
        Route::post('/transactions', [MobileTransactionController::class, 'store']);
        Route::delete('/transactions/{id}', [MobileTransactionController::class, 'destroy']);

        // Master Data Dropdowns
        Route::get('/categories', [MobileTransactionController::class, 'categories']);
        Route::get('/accounts', [MobileTransactionController::class, 'accounts']);

        // Savings Goals
        Route::get('/saving-goals', [MobileSavingsGoalController::class, 'index']);
        Route::post('/saving-goals', [MobileSavingsGoalController::class, 'store']);
        Route::post('/saving-goals/{id}/add-saving', [MobileSavingsGoalController::class, 'addSaving']);
    });
});
