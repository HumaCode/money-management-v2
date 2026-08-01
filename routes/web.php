<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\BudgetExpenseController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SavingGoalController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    // category
    Route::get('/categories', [CategoryController::class, 'index'])->name('category.index');
    Route::get('/categories/getAllPagination', [CategoryController::class, 'getAllPaginated'])->name('category.allPagination');
    Route::post('/categories/store', [CategoryController::class, 'store'])->name('category.store');
    Route::put('/categories/{category}/update', [CategoryController::class, 'update'])->name('category.update');
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
    Route::get('/budgets/{budget}/expenses', [BudgetController::class, 'getExpenses'])->name('budget.expenses');
    Route::get('/budgets/{budget}/add-expenses', [BudgetController::class, 'addExpenses'])->name('budget.addExpenses');
    Route::put('/budgets/{budget}/add-expenses', [BudgetController::class, 'storeExpenses'])->name('budget.storeExpenses');
    Route::delete('/budgets/{budget}/destroy', [BudgetController::class, 'destroy'])->name('budget.destroy');

    // budget expenses
    Route::get('/budget-expenses', [BudgetExpenseController::class, 'index'])->name('budget.expense.index');
    Route::get('/budget-expenses/getAllPagination', [BudgetExpenseController::class, 'getAllPaginated'])->name('budget.expense.allPagination');
    Route::get('/budget-expenses/create', [BudgetExpenseController::class, 'create'])->name('budget.expense.create');
    Route::post('/budget-expenses/store', [BudgetExpenseController::class, 'store'])->name('budget.expense.store');
    Route::get('/budget-expenses/{budgetExpense}/edit', [BudgetExpenseController::class, 'edit'])->name('budget.expense.edit');
    Route::put('/budget-expenses/{budgetExpense}/update', [BudgetExpenseController::class, 'update'])->name('budget.expense.update');
    Route::get('/budget-expenses/{budgetExpense}/add-expenses', [BudgetExpenseController::class, 'addExpenses'])->name('budget.expense.addExpenses');
    Route::put('/budget-expenses/{budgetExpense}/add-expenses', [BudgetExpenseController::class, 'storeExpenses'])->name('budget.expense.storeExpenses');
    Route::delete('/budget-expenses/{budgetExpense}/destroy', [BudgetExpenseController::class, 'destroy'])->name('budget.expense.destroy');

    // saving goal
    Route::get('/saving-goals', [SavingGoalController::class, 'index'])->name('saving.goals.index');
    Route::get('/saving-goals/getAllPagination', [SavingGoalController::class, 'getAllPaginated'])->name('saving.goals.allPagination');
    Route::get('/saving-goals/create', [SavingGoalController::class, 'create'])->name('saving.goals.create');
    Route::post('/saving-goals/store', [SavingGoalController::class, 'store'])->name('saving.goals.store');
    Route::get('/saving-goals/{saving}/edit', [SavingGoalController::class, 'edit'])->name('saving.goals.edit');
    Route::put('/saving-goals/{saving}/update', [SavingGoalController::class, 'update'])->name('saving.goals.update');
    Route::post('/saving-goals/{saving}/add-saving', [SavingGoalController::class, 'addSaving'])->name('saving.goals.addSaving');
    Route::get('/saving-goals/{saving}/contributions', [SavingGoalController::class, 'getContributions'])->name('saving.goals.contributions');
    Route::delete('/saving-goals/{saving}/destroy', [SavingGoalController::class, 'destroy'])->name('saving.goals.destroy');


    // transaction
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transaction.index');
    Route::get('/transactions/getAllPagination', [TransactionController::class, 'getAllPaginated'])->name('transaction.allPagination');
    Route::post('/transactions/store', [TransactionController::class, 'store'])->name('transaction.store');
    Route::put('/transactions/{transaction}/update', [TransactionController::class, 'update'])->name('transaction.update');
    Route::delete('/transactions/{transaction}/destroy', [TransactionController::class, 'destroy'])->name('transaction.destroy');

    // recurring transaction
    Route::get('/recurring-transactions', [\App\Http\Controllers\RecurringTransactionController::class, 'index'])->name('recurring.index');
    Route::get('/recurring-transactions/getAllPagination', [\App\Http\Controllers\RecurringTransactionController::class, 'getAllPaginated'])->name('recurring.allPagination');
    Route::post('/recurring-transactions/store', [\App\Http\Controllers\RecurringTransactionController::class, 'store'])->name('recurring.store');
    Route::put('/recurring-transactions/{recurring}/update', [\App\Http\Controllers\RecurringTransactionController::class, 'update'])->name('recurring.update');
    Route::delete('/recurring-transactions/{recurring}/destroy', [\App\Http\Controllers\RecurringTransactionController::class, 'destroy'])->name('recurring.destroy');

    // analytics
    Route::get('/analytics', [\App\Http\Controllers\AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('/analytics/data', [\App\Http\Controllers\AnalyticsController::class, 'getData'])->name('analytics.data');
    Route::get('/analytics/export-pdf', [\App\Http\Controllers\AnalyticsController::class, 'exportPdf'])->name('analytics.exportPdf');
    Route::get('/analytics/export-excel', [\App\Http\Controllers\AnalyticsController::class, 'exportExcel'])->name('analytics.exportExcel');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // preferences
    Route::get('/preferences', [\App\Http\Controllers\UserPreferenceController::class, 'index'])->name('preferences.index');
    Route::put('/preferences', [\App\Http\Controllers\UserPreferenceController::class, 'update'])->name('preferences.update');
});

require __DIR__ . '/auth.php';
