<?php

namespace App\Providers;

use App\Models\BudgetCategory;
use App\Models\SavingsGoalContribution;
use App\Models\Transaction;
use App\Observers\BudgetCategoryObserver;
use App\Observers\SavingsGoalContributionObserver;
use App\Observers\TransactionObserver;
use App\Interface\TransactionRepositoryInterface;
use App\Repositories\TransactionRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TransactionRepositoryInterface::class, TransactionRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        BudgetCategory::observe(BudgetCategoryObserver::class);
        SavingsGoalContribution::observe(SavingsGoalContributionObserver::class);
        Transaction::observe(TransactionObserver::class);
    }
}
