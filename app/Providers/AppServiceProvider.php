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
use App\Interface\RecurringTransactionRepositoryInterface;
use App\Repositories\RecurringTransactionRepository;
use App\Interface\AnalyticsRepositoryInterface;
use App\Repositories\AnalyticsRepository;
use App\Interface\ProfileRepositoryInterface;
use App\Repositories\ProfileRepository;
use App\Interface\UserPreferenceRepositoryInterface;
use App\Repositories\UserPreferenceRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TransactionRepositoryInterface::class, TransactionRepository::class);
        $this->app->bind(RecurringTransactionRepositoryInterface::class, RecurringTransactionRepository::class);
        $this->app->bind(AnalyticsRepositoryInterface::class, AnalyticsRepository::class);
        $this->app->bind(ProfileRepositoryInterface::class, ProfileRepository::class);
        $this->app->bind(UserPreferenceRepositoryInterface::class, UserPreferenceRepository::class);
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
