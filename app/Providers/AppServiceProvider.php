<?php

namespace App\Providers;

use App\Models\BudgetCategory;
use App\Models\SavingsGoalContribution;
use App\Observers\BudgetCategoryObserver;
use App\Observers\SavingsGoalContributionObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        BudgetCategory::observe(BudgetCategoryObserver::class);
        SavingsGoalContribution::observe(SavingsGoalContributionObserver::class);
    }
}
