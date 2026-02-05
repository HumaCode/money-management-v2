<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    // category
    Route::get('/categories', [CategoryController::class, 'index'])->name('category.index');
    Route::get('/categories/getAllPagination', [CategoryController::class, 'getAllPaginated'])->name('category.allPagination');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('category.create');
    Route::post('/categories/store', [CategoryController::class, 'store'])->name('category.store');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('category.edit');
    Route::put('/categories/{category}/update', [CategoryController::class, 'update'])->name('category.update');
    Route::get('/categories/{category}/show', [CategoryController::class, 'show'])->name('category.show');
    Route::delete('/categories/{category}/destroy', [CategoryController::class, 'destroy'])->name('category.destroy');

    // account
    Route::get('/accounts', [AccountController::class, 'index'])->name('account.index');
    Route::get('/accounts/getAllPagination', [AccountController::class, 'getAllPaginated'])->name('account.allPagination');
    Route::get('/accounts/create', [AccountController::class, 'create'])->name('account.create');
    Route::post('/accounts/store', [AccountController::class, 'store'])->name('account.store');
    Route::get('/accounts/{account}/edit', [AccountController::class, 'edit'])->name('account.edit');
    Route::put('/accounts/{account}/update', [AccountController::class, 'update'])->name('account.update');
    Route::get('/accounts/{account}/show', [AccountController::class, 'show'])->name('account.show');
    Route::delete('/accounts/{account}/destroy', [AccountController::class, 'destroy'])->name('account.destroy');

    // budget
    Route::get('/budgets', [BudgetController::class, 'index'])->name('budget.index');
    Route::get('/budgets/getAllPagination', [BudgetController::class, 'getAllPaginated'])->name('budget.allPagination');
    Route::get('/budgets/create', [BudgetController::class, 'create'])->name('budget.create');
    Route::post('/budgets/store', [BudgetController::class, 'store'])->name('budget.store');
    Route::get('/budgets/{budget}/edit', [BudgetController::class, 'edit'])->name('budget.edit');
    Route::put('/budgets/{budget}/update', [BudgetController::class, 'update'])->name('budget.update');
    Route::get('/budgets/{budget}/show', [BudgetController::class, 'show'])->name('budget.show');
    Route::delete('/budgets/{budget}/destroy', [BudgetController::class, 'destroy'])->name('budget.destroy');


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
