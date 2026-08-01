<?php

namespace App\Interface;

interface AnalyticsRepositoryInterface
{
    public function getOverviewStats(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null);
    public function getIncomeVsExpensesChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null);
    public function getTopCategories(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null, int $limit = 5);
    public function getExpenseDistributionChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null);
    public function getDailySpendingChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null);
    public function getCashFlowChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null);
    public function getPaginatedTransactions(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null, int $perPage = 10);
    public function exportAllTransactions(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null);
    public function getFilterOptions();
}
