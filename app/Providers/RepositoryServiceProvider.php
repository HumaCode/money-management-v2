<?php

namespace App\Providers;

use App\Interface\AccountRepositoryInterface;
use App\Interface\CategoryRepositoryInterface;
use App\Repositories\AccountRepository;
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
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
