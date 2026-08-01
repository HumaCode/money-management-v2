<?php

namespace App\Interface;

interface DashboardRepositoryInterface
{
    public function getDashboardStats(string $userId);
    public function getRecentTransactions(string $userId, int $limit = 6);
    public function getMonthlyChartData(string $userId);
}
