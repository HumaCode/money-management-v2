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
            'total_balance'        => $totalBalance,
            'income_this_month'    => $incomeThisMonth,
            'income_trend'         => $incomeTrend,
            'expenses_this_month'  => $expensesThisMonth,
            'expense_trend'        => $expenseTrend,
            'savings_goals_saved'  => $savedAmount,
            'savings_goals_target' => $targetAmount,
            'savings_progress_pct' => $savingsProgressPct,
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
}
