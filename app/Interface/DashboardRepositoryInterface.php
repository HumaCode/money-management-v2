<?php

namespace App\Interface;

interface DashboardRepositoryInterface
{
    public function getDashboardStats(string $userId);
    public function getRecentTransactions(string $userId, int $limit = 6);
    public function getMonthlyChartData(string $userId);
    public function getSavingsHeatmapData(string $userId);
    public function getSavingsGoalsList(string $userId);
    public function getCategoryExpenses(string $userId);
    public function getUpcomingBills(string $userId, int $limit = 5);
    public function getSmartInsights(string $userId);
}
