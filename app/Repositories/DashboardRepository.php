<?php

namespace App\Repositories;

use App\Interface\DashboardRepositoryInterface;
use App\Models\Account;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardRepository implements DashboardRepositoryInterface
{
    public function getDashboardStats(string $userId)
    {
        $now            = Carbon::now();
        $startOfMonth   = $now->copy()->startOfMonth();
        $endOfMonth     = $now->copy()->endOfMonth();
        $startPrevMonth = $now->copy()->subMonth()->startOfMonth();
        $endPrevMonth   = $now->copy()->subMonth()->endOfMonth();

        // Total Balance of Active Accounts
        $totalBalance = (float) Account::where('user_id', $userId)
            ->where('is_active', true)
            ->sum('current_balance');

        // Income This Month
        $incomeThisMonth = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'income'")
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // Income Previous Month for Trend %
        $incomePrevMonth = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'income'")
            ->whereBetween('transaction_date', [$startPrevMonth, $endPrevMonth])
            ->sum('amount');

        // Expenses This Month
        $expensesThisMonth = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // Expenses Previous Month for Trend %
        $expensesPrevMonth = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereBetween('transaction_date', [$startPrevMonth, $endPrevMonth])
            ->sum('amount');

        // 1. Daily Expenses (Today vs Yesterday)
        $todayStr     = $now->toDateString();
        $yesterdayStr = $now->copy()->subDay()->toDateString();

        $todayExpenses = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereDate('transaction_date', $todayStr)
            ->sum('amount');

        $yesterdayExpenses = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereDate('transaction_date', $yesterdayStr)
            ->sum('amount');

        $dailyExpenseDiff  = $todayExpenses - $yesterdayExpenses;
        $dailyExpenseTrend = $yesterdayExpenses > 0 ? round((($todayExpenses - $yesterdayExpenses) / $yesterdayExpenses) * 100, 1) : 0;

        // 2. Monthly Expenses (This Month vs Previous Month)
        $monthlyExpenseDiff = $expensesThisMonth - $expensesPrevMonth;

        // 3. Yearly Expenses (This Year vs Previous Year)
        $startOfYear   = $now->copy()->startOfYear();
        $endOfYear     = $now->copy()->endOfYear();
        $startPrevYear = $now->copy()->subYear()->startOfYear();
        $endPrevYear   = $now->copy()->subYear()->endOfYear();

        $expensesThisYear = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereBetween('transaction_date', [$startOfYear, $endOfYear])
            ->sum('amount');

        $expensesPrevYear = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereBetween('transaction_date', [$startPrevYear, $endPrevYear])
            ->sum('amount');

        $yearlyExpenseDiff  = $expensesThisYear - $expensesPrevYear;
        $yearlyExpenseTrend = $expensesPrevYear > 0 ? round((($expensesThisYear - $expensesPrevYear) / $expensesPrevYear) * 100, 1) : 0;

        // 4. Net Cashflow (Surplus / Deficit This Month)
        $netCashflowThisMonth = $incomeThisMonth - $expensesThisMonth;

        // Savings Goals
        $savings = SavingsGoal::where('user_id', $userId)
            ->selectRaw('COALESCE(SUM(current_amount), 0) as saved, COALESCE(SUM(target_amount), 0) as target')
            ->first();

        $savedAmount  = (float) ($savings->saved ?? 0);
        $targetAmount = (float) ($savings->target ?? 0);

        // Calculate Trends
        $incomeTrend  = $incomePrevMonth > 0 ? round((($incomeThisMonth - $incomePrevMonth) / $incomePrevMonth) * 100, 1) : 0;
        $expenseTrend = $expensesPrevMonth > 0 ? round((($expensesThisMonth - $expensesPrevMonth) / $expensesPrevMonth) * 100, 1) : 0;
        $savingsProgressPct = $targetAmount > 0 ? round(($savedAmount / $targetAmount) * 100, 1) : 0;

        return [
            'total_balance'          => $totalBalance,
            'income_this_month'      => $incomeThisMonth,
            'income_trend'           => $incomeTrend,
            'expenses_this_month'    => $expensesThisMonth,
            'expense_trend'          => $expenseTrend,
            'today_expenses'         => $todayExpenses,
            'yesterday_expenses'     => $yesterdayExpenses,
            'daily_expense_diff'     => $dailyExpenseDiff,
            'daily_expense_trend'    => $dailyExpenseTrend,
            'monthly_expense_diff'   => $monthlyExpenseDiff,
            'expenses_this_year'     => $expensesThisYear,
            'expenses_prev_year'     => $expensesPrevYear,
            'yearly_expense_diff'    => $yearlyExpenseDiff,
            'yearly_expense_trend'   => $yearlyExpenseTrend,
            'net_cashflow_this_month' => $netCashflowThisMonth,
            'savings_goals_saved'    => $savedAmount,
            'savings_goals_target'   => $targetAmount,
            'savings_progress_pct'   => $savingsProgressPct,
        ];
    }

    public function getRecentTransactions(string $userId, int $limit = 6)
    {
        return Transaction::with(['account', 'category', 'toAccount'])
            ->where('user_id', $userId)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getMonthlyChartData(string $userId)
    {
        $months = [];
        $incomeData = [];
        $expenseData = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $months[] = $date->translatedFormat('M Y');

            $inc = Transaction::where('user_id', $userId)
                ->whereRaw("LOWER(type) = 'income'")
                ->whereBetween('transaction_date', [$start, $end])
                ->sum('amount');

            $exp = Transaction::where('user_id', $userId)
                ->whereRaw("LOWER(type) = 'expense'")
                ->whereBetween('transaction_date', [$start, $end])
                ->sum('amount');

            $incomeData[] = (float) $inc;
            $expenseData[] = (float) $exp;
        }

        return [
            'labels'   => $months,
            'incomes'  => $incomeData,
            'expenses' => $expenseData,
        ];
    }

    public function getSavingsHeatmapData(string $userId)
    {
        $endDate   = Carbon::now()->endOfDay();
        $startDate = Carbon::now()->subYear()->startOfDay();

        // Contributions per date & savings_goal_id
        $contributions = DB::table('savings_goal_contributions as c')
            ->join('savings_goals as g', 'g.id', '=', 'c.savings_goal_id')
            ->where('g.user_id', $userId)
            ->whereBetween('c.contributed_at', [$startDate, $endDate])
            ->selectRaw('c.savings_goal_id, DATE(c.contributed_at) as date, SUM(c.amount) as total_amount, COUNT(*) as total_count')
            ->groupBy('c.savings_goal_id', DB::raw('DATE(c.contributed_at)'))
            ->get();

        return [
            'start_date'    => $startDate->format('Y-m-d'),
            'end_date'      => $endDate->format('Y-m-d'),
            'contributions' => $contributions,
        ];
    }

    public function getSavingsGoalsList(string $userId)
    {
        return SavingsGoal::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getCategoryExpenses(string $userId)
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth   = Carbon::now()->endOfMonth();

        $expenses = DB::table('transactions as t')
            ->leftJoin('categories as c', 'c.id', '=', 't.category_id')
            ->where('t.user_id', $userId)
            ->whereRaw("LOWER(t.type) = 'expense'")
            ->whereBetween('t.transaction_date', [$startOfMonth, $endOfMonth])
            ->selectRaw("COALESCE(c.name, 'Lainnya') as category_name, COALESCE(c.color, '#6b7280') as category_color, SUM(t.amount) as total_amount")
            ->groupBy('c.name', 'c.color')
            ->orderBy('total_amount', 'desc')
            ->get();

        $totalExpenseSum = $expenses->sum('total_amount');

        return $expenses->map(function ($item) use ($totalExpenseSum) {
            $item->total_amount = (float) $item->total_amount;
            $item->percentage = $totalExpenseSum > 0 ? round(($item->total_amount / $totalExpenseSum) * 100, 1) : 0;
            return $item;
        });
    }

    public function getUpcomingBills(string $userId, int $limit = 5)
    {
        return \App\Models\RecurringTransaction::with(['category', 'account'])
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('next_occurrence_date', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getSmartInsights(string $userId)
    {
        $insights = [];
        $stats = $this->getDashboardStats($userId);
        $categoryExpenses = $this->getCategoryExpenses($userId);

        // 1. Cashflow insight
        if ($stats['net_cashflow_this_month'] > 0) {
            $insights[] = [
                'type' => 'success',
                'title' => 'Surplus Arus Kas',
                'message' => 'Pemasukan Anda bulan ini surplus Rp ' . number_format($stats['net_cashflow_this_month'], 0, ',', '.') . ' di atas pengeluaran. Kerja bagus!',
            ];
        } elseif ($stats['net_cashflow_this_month'] < 0) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Defisit Keuangan',
                'message' => 'Pengeluaran Anda bulan ini melebihi pemasukan sebesar Rp ' . number_format(abs($stats['net_cashflow_this_month']), 0, ',', '.') . '. Pertimbangkan evaluasi anggaran.',
            ];
        }

        // 2. Daily comparison insight
        if ($stats['daily_expense_diff'] < 0) {
            $insights[] = [
                'type' => 'info',
                'title' => 'Hemat Pengeluaran Harian',
                'message' => 'Pengeluaran hari ini Rp ' . number_format(abs($stats['daily_expense_diff']), 0, ',', '.') . ' lebih hemat dibanding kemarin!',
            ];
        } elseif ($stats['daily_expense_diff'] > 0) {
            $insights[] = [
                'type' => 'warning',
                'title' => 'Kenaikan Belanja Harian',
                'message' => 'Pengeluaran hari ini naik Rp ' . number_format($stats['daily_expense_diff'], 0, ',', '.') . ' dibanding kemarin.',
            ];
        }

        // 3. Top category insight
        if ($categoryExpenses->count() > 0) {
            $topCat = $categoryExpenses->first();
            $insights[] = [
                'type' => 'info',
                'title' => 'Kategori Belanja Terbesar',
                'message' => 'Pengeluaran terbanyak bulan ini pada kategori ' . $topCat->category_name . ' (' . $topCat->percentage . '% / Rp ' . number_format($topCat->total_amount, 0, ',', '.') . ').',
            ];
        }

        return $insights;
    }
}
