<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MobileSavingsGoalController;
use App\Http\Controllers\Api\V1\MobileSummaryController;
use App\Http\Controllers\Api\V1\MobileTransactionController;
use App\Http\Controllers\Api\V1\TwoFactorController;
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
    Route::post('/auth/login/verify-2fa', [TwoFactorController::class, 'verifyLogin2fa']);
    Route::post('/auth/login/resend-2fa', [TwoFactorController::class, 'resendLogin2fa']);

    // Protected Routes (Sanctum Bearer Token Required)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth profile & logout
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'updatePassword']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // 2FA Security Routes (WhatsApp OTP)
        Route::get('/auth/2fa/status', [TwoFactorController::class, 'status']);
        Route::post('/auth/2fa/send-otp', [TwoFactorController::class, 'sendOtp']);
        Route::post('/auth/2fa/verify-otp', [TwoFactorController::class, 'verifyOtp']);
        Route::post('/auth/2fa/disable', [TwoFactorController::class, 'disable2fa']);

        // Wallet Summary (Total Saldo, Pemasukan, Pengeluaran dari Rekening Aktif)
        Route::get('/wallet-summary', [MobileSummaryController::class, 'walletSummary']);

        // Top Expenses by Category (Pengeluaran Terbesar per Kategori Tipe Expense)
        Route::get('/top-expenses', [MobileSummaryController::class, 'topExpenses']);

        // Recent Transactions (15 Transaksi Terbaru dengan Subtitle & Formatted Amount)
        Route::get('/recent-transactions', [MobileSummaryController::class, 'recentTransactions']);

        // Transactions
        Route::get('/transactions', [MobileTransactionController::class, 'index']);
        Route::post('/transactions', [MobileTransactionController::class, 'store']);
        Route::post('/transactions/scan-receipt', [MobileTransactionController::class, 'scanReceipt']);
        Route::put('/transactions/{id}', [MobileTransactionController::class, 'update']);
        Route::patch('/transactions/{id}', [MobileTransactionController::class, 'update']);
        Route::delete('/transactions/{id}', [MobileTransactionController::class, 'destroy']);

        // Master Data Dropdowns
        Route::get('/categories', [MobileTransactionController::class, 'categories']);
        Route::get('/accounts', [MobileTransactionController::class, 'accounts']);
        Route::get('/currencies', [MobileSavingsGoalController::class, 'currencies']);

        // Savings Goals
        Route::get('/saving-goals', [MobileSavingsGoalController::class, 'index']);
        Route::get('/saving-goals/{id}', [MobileSavingsGoalController::class, 'show']);
        Route::post('/saving-goals', [MobileSavingsGoalController::class, 'store']);
        Route::put('/saving-goals/{id}', [MobileSavingsGoalController::class, 'update']);
        Route::patch('/saving-goals/{id}', [MobileSavingsGoalController::class, 'update']);
        Route::delete('/saving-goals/{id}', [MobileSavingsGoalController::class, 'destroy']);
        Route::post('/saving-goals/{id}/add-saving', [MobileSavingsGoalController::class, 'addSaving']);
        Route::put('/saving-goals/{goalId}/contributions/{contributionId}', [MobileSavingsGoalController::class, 'updateContribution']);
        Route::delete('/saving-goals/{goalId}/contributions/{contributionId}', [MobileSavingsGoalController::class, 'deleteContribution']);
    });
});
