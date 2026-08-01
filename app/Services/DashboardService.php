<?php

namespace App\Services;

use App\Interface\DashboardRepositoryInterface;

class DashboardService
{
    protected DashboardRepositoryInterface $dashboardRepository;

    public function __construct(DashboardRepositoryInterface $dashboardRepository)
    {
        $this->dashboardRepository = $dashboardRepository;
    }

    public function getDashboardData(string $userId)
    {
        return [
            'stats'               => $this->dashboardRepository->getDashboardStats($userId),
            'recent_transactions' => $this->dashboardRepository->getRecentTransactions($userId, 6),
            'chart_data'          => $this->dashboardRepository->getMonthlyChartData($userId),
            'savings_heatmap'     => $this->dashboardRepository->getSavingsHeatmapData($userId),
            'savings_goals'       => $this->dashboardRepository->getSavingsGoalsList($userId),
            'category_expenses'   => $this->dashboardRepository->getCategoryExpenses($userId),
            'upcoming_bills'      => $this->dashboardRepository->getUpcomingBills($userId, 5),
            'smart_insights'      => $this->dashboardRepository->getSmartInsights($userId),
        ];
    }
}
