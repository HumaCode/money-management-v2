<?php

namespace App\Providers;

use App\Interface\AccountRepositoryInterface;
use App\Interface\BudgetRepositoryInterface;
use App\Interface\CategoryRepositoryInterface;
use App\Repositories\AccountRepository;
use App\Repositories\BudgetRepository;
use App\Repositories\CategoryRepository;
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
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
