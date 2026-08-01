<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\AnalyticsFilterRequest;
use App\Http\Resources\AnalyticsResource;
use App\Http\Resources\PaginateResource;
use App\Services\AnalyticsService;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(AnalyticsFilterRequest $request)
    {
        $period     = $request->input('period', 'this_month');
        $accountId  = $request->input('account_id');
        $categoryId = $request->input('category_id');
        $perPage    = $request->input('row_per_page', 10);

        $analytics = $this->analyticsService->getAnalyticsData($period, $accountId, $categoryId, $perPage);

        $paginatedResource = PaginateResource::make(
            $analytics['paginatedTransactions'],
            AnalyticsResource::class
        );

        return Inertia::render('Analytics/Index', [
            'title'                 => 'Analytics',
            'subtitle'              => 'Financial insights and performance metrics',
            'overview'              => $analytics['overview'],
            'incomeVsExpensesChart' => $analytics['incomeVsExpensesChart'],
            'topCategories'         => $analytics['topCategories'],
            'expenseDistribution'   => $analytics['expenseDistribution'],
            'dailySpending'         => $analytics['dailySpending'],
            'cashFlow'              => $analytics['cashFlow'],
            'transactions'          => $paginatedResource,
            'filterOptions'         => $analytics['filterOptions'],
            'currentFilters'        => [
                'period'      => $period,
                'account_id'  => $accountId ?: 'all',
                'category_id' => $categoryId ?: 'all',
                'perPage'     => $perPage,
            ],
        ]);
    }

    public function getData(AnalyticsFilterRequest $request)
    {
        $period     = $request->input('period', 'this_month');
        $accountId  = $request->input('account_id');
        $categoryId = $request->input('category_id');
        $perPage    = $request->input('row_per_page', 10);

        $analytics = $this->analyticsService->getAnalyticsData($period, $accountId, $categoryId, $perPage);

        $paginatedResource = PaginateResource::make(
            $analytics['paginatedTransactions'],
            AnalyticsResource::class
        );

        return ResponseHelper::success([
            'overview'              => $analytics['overview'],
            'incomeVsExpensesChart' => $analytics['incomeVsExpensesChart'],
            'topCategories'         => $analytics['topCategories'],
            'expenseDistribution'   => $analytics['expenseDistribution'],
            'dailySpending'         => $analytics['dailySpending'],
            'cashFlow'              => $analytics['cashFlow'],
            'transactions'          => $paginatedResource,
        ], 'Analytics data loaded successfully');
    }
}
