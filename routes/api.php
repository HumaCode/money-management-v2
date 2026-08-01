<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MobileSavingsGoalController;
use App\Http\Controllers\Api\V1\MobileSummaryController;
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

        // Wallet Summary (Total Saldo, Pemasukan, Pengeluaran dari Rekening Aktif)
        Route::get('/wallet-summary', [MobileSummaryController::class, 'walletSummary']);

        // Top Expenses by Category (Pengeluaran Terbesar per Kategori Tipe Expense)
        Route::get('/top-expenses', [MobileSummaryController::class, 'topExpenses']);

        // Recent Transactions (15 Transaksi Terbaru dengan Subtitle & Formatted Amount)
        Route::get('/recent-transactions', [MobileSummaryController::class, 'recentTransactions']);

        // Transactions
        Route::get('/transactions', [MobileTransactionController::class, 'index']);
        Route::post('/transactions', [MobileTransactionController::class, 'store']);
        Route::put('/transactions/{id}', [MobileTransactionController::class, 'update']);
        Route::patch('/transactions/{id}', [MobileTransactionController::class, 'update']);
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
