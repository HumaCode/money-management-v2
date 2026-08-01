<?php

namespace App\Repositories;

use App\Interface\AnalyticsRepositoryInterface;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnalyticsRepository implements AnalyticsRepositoryInterface
{
    protected function getUserId(): string
    {
        return user('id') ?? Auth::id() ?? '';
    }

    protected function parsePeriodDates(?string $period)
    {
        $now = Carbon::now();

        switch ($period) {
            case 'last_month':
                $start = $now->copy()->subMonth()->startOfMonth();
                $end   = $now->copy()->subMonth()->endOfMonth();
                $prevStart = $now->copy()->subMonths(2)->startOfMonth();
                $prevEnd   = $now->copy()->subMonths(2)->endOfMonth();
                break;
            case 'this_quarter':
                $start = $now->copy()->startOfQuarter();
                $end   = $now->copy()->endOfQuarter();
                $prevStart = $now->copy()->subQuarter()->startOfQuarter();
                $prevEnd   = $now->copy()->subQuarter()->endOfQuarter();
                break;
            case 'this_year':
                $start = $now->copy()->startOfYear();
                $end   = $now->copy()->endOfYear();
                $prevStart = $now->copy()->subYear()->startOfYear();
                $prevEnd   = $now->copy()->subYear()->endOfYear();
                break;
            case 'all_time':
            case 'all':
                $start = Carbon::create(2000, 1, 1)->startOfDay();
                $end   = Carbon::create(2099, 12, 31)->endOfDay();
                $prevStart = Carbon::create(2000, 1, 1)->startOfDay();
                $prevEnd   = Carbon::create(2099, 12, 31)->endOfDay();
                break;
            case 'this_month':
            default:
                $start = $now->copy()->startOfMonth();
                $end   = $now->copy()->endOfMonth();
                $prevStart = $now->copy()->subMonth()->startOfMonth();
                $prevEnd   = $now->copy()->subMonth()->endOfMonth();
                break;
        }

        return [
            $start->copy()->startOfDay(),
            $end->copy()->endOfDay(),
            $prevStart->copy()->startOfDay(),
            $prevEnd->copy()->endOfDay()
        ];
    }

    protected function applyFilters($query, ?string $accountId = null, ?string $categoryId = null)
    {
        if (!empty($accountId) && $accountId !== 'all') {
            $query->where(function ($q) use ($accountId) {
                $q->where('account_id', $accountId)
                  ->orWhere('to_account_id', $accountId);
            });
        }

        if (!empty($categoryId) && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        return $query;
    }

    public function getOverviewStats(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null)
    {
        $userId = $this->getUserId();
        [$start, $end, $prevStart, $prevEnd] = $this->parsePeriodDates($period);

        // Current period stats
        $currQuery = Transaction::where('user_id', $userId)
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]);
        $this->applyFilters($currQuery, $accountId, $categoryId);

        $currStats = $currQuery->selectRaw("
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
            COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
            COUNT(*) as total_count
        ")->first();

        // Previous period stats (for percentage comparisons)
        $prevQuery = Transaction::where('user_id', $userId)
            ->whereBetween('transaction_date', [$prevStart->format('Y-m-d'), $prevEnd->format('Y-m-d')]);
        $this->applyFilters($prevQuery, $accountId, $categoryId);

        $prevStats = $prevQuery->selectRaw("
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
        ")->first();

        $totalIncome  = (float) ($currStats->total_income ?? 0);
        $totalExpense = (float) ($currStats->total_expense ?? 0);
        $netSavings   = $totalIncome - $totalExpense;
        $savingsRate  = $totalIncome > 0 ? round(($netSavings / $totalIncome) * 100, 1) : 0;

        $prevIncome  = (float) ($prevStats->total_income ?? 0);
        $prevExpense = (float) ($prevStats->total_expense ?? 0);

        $incomeChange  = $prevIncome > 0 ? round((($totalIncome - $prevIncome) / $prevIncome) * 100, 1) : 0;
        $expenseChange = $prevExpense > 0 ? round((($totalExpense - $prevExpense) / $prevExpense) * 100, 1) : 0;

        return [
            'total_income'     => $totalIncome,
            'total_expense'    => $totalExpense,
            'net_savings'      => $netSavings,
            'savings_rate'     => $savingsRate,
            'total_count'      => (int) ($currStats->total_count ?? 0),
            'income_count'     => (int) ($currStats->income_count ?? 0),
            'expense_count'    => (int) ($currStats->expense_count ?? 0),
            'income_change'    => $incomeChange,
            'expense_change'   => $expenseChange,
        ];
    }

    public function getIncomeVsExpensesChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null)
    {
        $userId = $this->getUserId();
        $labels = [];
        $incomeData = [];
        $expenseData = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $labels[] = $month->format('M');

            $query = Transaction::where('user_id', $userId)
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month);
            $this->applyFilters($query, $accountId, $categoryId);

            $sum = $query->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as inc,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as exp
            ")->first();

            $incomeData[]  = (float) ($sum->inc ?? 0);
            $expenseData[] = (float) ($sum->exp ?? 0);
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => $incomeData,
                    'backgroundColor' => 'rgba(16, 185, 129, 0.8)',
                    'borderRadius' => 8
                ],
                [
                    'label' => 'Expenses',
                    'data' => $expenseData,
                    'backgroundColor' => 'rgba(248, 113, 113, 0.8)',
                    'borderRadius' => 8
                ]
            ]
        ];
    }

    public function getTopCategories(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null, int $limit = 5)
    {
        $userId = $this->getUserId();
        [$start, $end] = $this->parsePeriodDates($period);

        $query = DB::table('transactions as t')
            ->join('categories as c', 't.category_id', '=', 'c.id')
            ->where('t.user_id', $userId)
            ->where('t.type', 'expense')
            ->whereBetween('t.transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->groupBy('c.id', 'c.name', 'c.icon')
            ->selectRaw('c.name, c.icon, SUM(t.amount) as total_amount')
            ->orderByDesc('total_amount');

        if (!empty($accountId) && $accountId !== 'all') {
            $query->where('t.account_id', $accountId);
        }

        if (!empty($categoryId) && $categoryId !== 'all') {
            $query->where('t.category_id', $categoryId);
        }

        $top = $query->limit($limit)->get();

        $maxAmount = $top->max('total_amount') ?: 1;

        return $top->map(function ($item) use ($maxAmount) {
            $amt = (float) $item->total_amount;
            return [
                'name'       => $item->name,
                'icon'       => $item->icon ?: '🏷️',
                'amount'     => $amt,
                'percentage' => round(($amt / $maxAmount) * 100, 1),
            ];
        });
    }

    public function getExpenseDistributionChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null)
    {
        $userId = $this->getUserId();
        [$start, $end] = $this->parsePeriodDates($period);

        $query = DB::table('transactions as t')
            ->join('categories as c', 't.category_id', '=', 'c.id')
            ->where('t.user_id', $userId)
            ->where('t.type', 'expense')
            ->whereBetween('t.transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->groupBy('c.id', 'c.name')
            ->selectRaw('c.name, SUM(t.amount) as total_amount')
            ->orderByDesc('total_amount');

        if (!empty($accountId) && $accountId !== 'all') {
            $query->where('t.account_id', $accountId);
        }
        if (!empty($categoryId) && $categoryId !== 'all') {
            $query->where('t.category_id', $categoryId);
        }

        $rows = $query->limit(6)->get();

        $colors = ['#7dd3a8', '#f87171', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

        return [
            'labels' => $rows->pluck('name')->toArray(),
            'datasets' => [[
                'data' => $rows->pluck('total_amount')->map(fn($v) => (float) $v)->toArray(),
                'backgroundColor' => array_slice($colors, 0, count($rows)),
                'borderWidth' => 0
            ]]
        ];
    }

    public function getDailySpendingChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null)
    {
        $userId = $this->getUserId();
        [$start, $end] = $this->parsePeriodDates($period);

        $query = DB::table('transactions')
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->groupBy('transaction_date')
            ->selectRaw('transaction_date, SUM(amount) as daily_total')
            ->orderBy('transaction_date', 'asc');

        if (!empty($accountId) && $accountId !== 'all') {
            $query->where('account_id', $accountId);
        }
        if (!empty($categoryId) && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        $records = $query->pluck('daily_total', 'transaction_date');

        $labels = [];
        $data = [];
        $current = $start->copy();

        while ($current->lte($end) && $current->lte(Carbon::now())) {
            $dStr = $current->format('Y-m-d');
            $labels[] = $current->format('d M');
            $data[] = (float) ($records[$dStr] ?? 0);
            $current->addDay();
        }

        return [
            'labels' => $labels,
            'datasets' => [[
                'label' => 'Daily Spending',
                'data' => $data,
                'borderColor' => '#f87171',
                'backgroundColor' => 'rgba(248, 113, 113, 0.1)',
                'fill' => true,
                'tension' => 0.4
            ]]
        ];
    }

    public function getCashFlowChartData(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null)
    {
        $userId = $this->getUserId();
        $labels = [];
        $incomeData = [];
        $expenseData = [];
        $netData = [];

        for ($m = 1; $m <= 12; $m++) {
            $date = Carbon::create(Carbon::now()->year, $m, 1);
            $labels[] = $date->format('M');

            $query = Transaction::where('user_id', $userId)
                ->whereYear('transaction_date', $date->year)
                ->whereMonth('transaction_date', $m);
            $this->applyFilters($query, $accountId, $categoryId);

            $sum = $query->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as inc,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as exp
            ")->first();

            $inc = (float) ($sum->inc ?? 0);
            $exp = (float) ($sum->exp ?? 0);

            $incomeData[]  = $inc;
            $expenseData[] = $exp;
            $netData[]     = $inc - $exp;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => $incomeData,
                    'borderColor' => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.08)',
                    'fill' => true,
                    'tension' => 0.4
                ],
                [
                    'label' => 'Expenses',
                    'data' => $expenseData,
                    'borderColor' => '#f87171',
                    'backgroundColor' => 'rgba(248, 113, 113, 0.08)',
                    'fill' => true,
                    'tension' => 0.4
                ],
                [
                    'label' => 'Net Flow',
                    'data' => $netData,
                    'borderColor' => '#7dd3a8',
                    'backgroundColor' => 'rgba(125, 211, 168, 0.15)',
                    'fill' => true,
                    'tension' => 0.4
                ]
            ]
        ];
    }

    public function getPaginatedTransactions(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null, int $perPage = 10)
    {
        $userId = $this->getUserId();
        [$start, $end] = $this->parsePeriodDates($period);

        $query = Transaction::with(['account', 'category', 'currency'])
            ->where('user_id', $userId)
            ->whereBetween('transaction_date', [$start->format('Y-m-d'), $end->format('Y-m-d')]);

        $this->applyFilters($query, $accountId, $categoryId);

        return $query->orderBy('transaction_date', 'desc')->paginate($perPage);
    }

    public function exportAllTransactions(?string $period = 'this_month', ?string $accountId = null, ?string $categoryId = null)
    {
        $userId = $this->getUserId();
        [$start, $end] = $this->parsePeriodDates($period);

        $query = Transaction::with(['account', 'category', 'currency'])
            ->where('user_id', $userId)
            ->whereBetween('transaction_date', [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);

        $this->applyFilters($query, $accountId, $categoryId);

        return $query->orderBy('transaction_date', 'desc')->get();
    }

    public function getFilterOptions()
    {
        $userId = $this->getUserId();

        return [
            'accounts' => Account::where('user_id', $userId)->select('id', 'name')->get(),
            'categories' => Category::where(function ($q) use ($userId) {
                $q->whereNull('user_id')->orWhere('user_id', $userId);
            })->select('id', 'name', 'type', 'icon')->get(),
        ];
    }
}
