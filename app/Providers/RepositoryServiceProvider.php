<?php

namespace App\Providers;

use App\Interface\AccountRepositoryInterface;
use App\Interface\BudgetExpenseRepositoryInnterface;
use App\Interface\BudgetRepositoryInterface;
use App\Interface\CategoryRepositoryInterface;
use App\Interface\SavingGoalRepositoryInterface;
use App\Repositories\AccountRepository;
use App\Repositories\BudgetExpenseRepository;
use App\Repositories\BudgetRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\SavingGoalRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // kategory
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
        // account
        $this->app->bind(AccountRepositoryInterface::class, AccountRepository::class);
        // budget
        $this->app->bind(BudgetRepositoryInterface::class, BudgetRepository::class);
        // budget expense
        $this->app->bind(BudgetExpenseRepositoryInnterface::class, BudgetExpenseRepository::class);
        // saving goal
        $this->app->bind(SavingGoalRepositoryInterface::class, SavingGoalRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
