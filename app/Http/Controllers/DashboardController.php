<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $userId        = $request->user()->id;
        $dashboardData = $this->dashboardService->getDashboardData($userId);

        return Inertia::render('Dashboard/DashboardAdministrator', [
            'title'              => 'Dashboard',
            'stats'              => $dashboardData['stats'],
            'recentTransactions' => $dashboardData['recent_transactions'],
            'chartData'          => $dashboardData['chart_data'],
        ]);
    }
}
