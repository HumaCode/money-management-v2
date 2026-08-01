<?php

namespace App\Services;

use App\Interface\AnalyticsRepositoryInterface;

class AnalyticsService
{
    protected AnalyticsRepositoryInterface $analyticsRepository;

    public function __construct(AnalyticsRepositoryInterface $analyticsRepository)
    {
        $this->analyticsRepository = $analyticsRepository;
    }

    public function getAnalyticsData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null, int $perPage = 10)
    {
        $overviewStats          = $this->analyticsRepository->getOverviewStats($period, $accountId, $categoryId);
        $incomeVsExpensesChart  = $this->analyticsRepository->getIncomeVsExpensesChartData($period, $accountId, $categoryId);
        $topCategories          = $this->analyticsRepository->getTopCategories($period, $accountId, $categoryId);
        $expenseDistribution    = $this->analyticsRepository->getExpenseDistributionChartData($period, $accountId, $categoryId);
        $dailySpending          = $this->analyticsRepository->getDailySpendingChartData($period, $accountId, $categoryId);
        $cashFlow               = $this->analyticsRepository->getCashFlowChartData($period, $accountId, $categoryId);
        $paginatedTransactions  = $this->analyticsRepository->getPaginatedTransactions($period, $accountId, $categoryId, $perPage);
        $filters                = $this->analyticsRepository->getFilterOptions();

        return [
            'overview'              => $overviewStats,
            'incomeVsExpensesChart' => $incomeVsExpensesChart,
            'topCategories'         => $topCategories,
            'expenseDistribution'   => $expenseDistribution,
            'dailySpending'         => $dailySpending,
            'cashFlow'              => $cashFlow,
            'paginatedTransactions' => $paginatedTransactions,
            'filterOptions'         => $filters,
        ];
    }

    public function getExportData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null)
    {
        $overview      = $this->analyticsRepository->getOverviewStats($period, $accountId, $categoryId);
        $topCategories = $this->analyticsRepository->getTopCategories($period, $accountId, $categoryId);
        $transactions  = $this->analyticsRepository->exportAllTransactions($period, $accountId, $categoryId);

        return [
            'overview'      => $overview,
            'topCategories' => $topCategories,
            'transactions'  => $transactions,
        ];
    }
}
