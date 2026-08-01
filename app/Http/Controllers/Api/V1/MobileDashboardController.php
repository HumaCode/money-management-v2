<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Interface\DashboardRepositoryInterface;
use Illuminate\Http\Request;

class MobileDashboardController extends Controller
{
    protected $dashboardRepository;

    public function __construct(DashboardRepositoryInterface $dashboardRepository)
    {
        $this->dashboardRepository = $dashboardRepository;
    }

    /**
     * Mobile Dashboard API Endpoint
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $stats            = $this->dashboardRepository->getDashboardStats($userId);
        $recentTx         = $this->dashboardRepository->getRecentTransactions($userId, 6);
        $chartData        = $this->dashboardRepository->getMonthlyChartData($userId);
        $savingsHeatmap   = $this->dashboardRepository->getSavingsHeatmapData($userId);
        $savingsGoals     = $this->dashboardRepository->getSavingsGoalsList($userId);
        $categoryExpenses = $this->dashboardRepository->getCategoryExpenses($userId);
        $upcomingBills    = $this->dashboardRepository->getUpcomingBills($userId, 5);
        $smartInsights    = $this->dashboardRepository->getSmartInsights($userId);

        return ResponseHelper::success([
            'stats'               => $stats,
            'recent_transactions' => $recentTx,
            'chart_data'          => $chartData,
            'savings_heatmap'     => $savingsHeatmap,
            'savings_goals'       => $savingsGoals,
            'category_expenses'   => $categoryExpenses,
            'upcoming_bills'      => $upcomingBills,
            'smart_insights'      => $smartInsights,
        ], 'Data dashboard mobile');
    }
}
