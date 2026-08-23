<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MobileSummaryController extends Controller
{
    /**
     * Get Wallet Summary API Endpoint (Strictly Isolated per Authenticated User & Active Accounts)
     */
    public function walletSummary(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth   = $now->copy()->endOfMonth();

        $accountsList = Account::where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        $totalBalance = (float) $accountsList->sum('current_balance');

        $mappedAccounts = $accountsList->map(function ($acc) {
            return [
                'id'             => (string) $acc->id,
                'name'           => $acc->name,
                'account_number' => $acc->account_number ?? '',
                'balance'        => (float) ($acc->current_balance ?? $acc->balance),
                'current_balance'=> (float) ($acc->current_balance ?? $acc->balance),
                'color'          => $acc->color ?? '#00FFA3',
                'icon'           => $acc->icon ?? 'account_balance',
                'currency'       => 'IDR',
            ];
        });

        // 2. Income This Month for Authenticated User
        $incomeThisMonth = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'income'")
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // 3. Expenses This Month for Authenticated User
        $expensesThisMonth = (float) Transaction::where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        return ResponseHelper::success([
            'total_balance'         => $totalBalance,
            'income_this_month'     => $incomeThisMonth,
            'expenses_this_month'   => $expensesThisMonth,
            'net_cashflow'          => $incomeThisMonth - $expensesThisMonth,
            'active_accounts_count' => $accountsList->count(),
            'accounts'              => $mappedAccounts,
        ], 'Ringkasan saldo & transaksi rekening aktif');
    }

    /**
     * Get Top Expenses by Category API Endpoint (Strictly Expense Type & Authenticated User)
     */
    public function topExpenses(Request $request)
    {
        $userId = $request->user()->id;

        $month = $request->input('month', Carbon::now()->month);
        $year  = $request->input('year', Carbon::now()->year);
        $limit = $request->input('limit', 5);

        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endOfMonth   = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // Query top expense categories
        $expenses = \Illuminate\Support\Facades\DB::table('transactions as t')
            ->leftJoin('categories as c', 'c.id', '=', 't.category_id')
            ->where('t.user_id', $userId)
            ->whereRaw("LOWER(t.type) = 'expense'")
            ->whereBetween('t.transaction_date', [$startOfMonth, $endOfMonth])
            ->selectRaw("
                c.id as category_id,
                COALESCE(c.name, 'Lainnya') as category_name,
                COALESCE(c.color, '#ef4444') as category_color,
                COALESCE(c.icon, 'shopping_bag') as category_icon,
                SUM(t.amount) as total_amount
            ")
            ->groupBy('c.id', 'c.name', 'c.color', 'c.icon')
            ->orderBy('total_amount', 'desc')
            ->limit($limit)
            ->get();

        $totalExpenseSum = (float) \Illuminate\Support\Facades\DB::table('transactions')
            ->where('user_id', $userId)
            ->whereRaw("LOWER(type) = 'expense'")
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $topExpenses = $expenses->map(function ($item) use ($totalExpenseSum) {
            $amt = (float) $item->total_amount;
            $pct = $totalExpenseSum > 0 ? round(($amt / $totalExpenseSum) * 100, 1) : 0;
            return [
                'category_id'    => $item->category_id,
                'category_name'  => $item->category_name,
                'category_color' => $item->category_color,
                'category_icon'  => $item->category_icon,
                'total_amount'   => $amt,
                'percentage'     => $pct,
            ];
        });

        return ResponseHelper::success([
            'total_expense_amount' => $totalExpenseSum,
            'month'                => (int) $month,
            'year'                 => (int) $year,
            'top_expenses'         => $topExpenses,
        ], 'Daftar pengeluaran terbesar per kategori');
    }

    /**
     * Get Recent Transactions API Endpoint (15 items default, formatted for Mobile UI)
     */
    public function recentTransactions(Request $request)
    {
        $userId = $request->user()->id;
        $limit  = (int) $request->input('limit', 15);

        $transactions = Transaction::with(['category', 'account', 'toAccount'])
            ->where('user_id', $userId)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $formatted = $transactions->map(function ($tx) {
            $type = strtolower($tx->type);
            $isIncome  = $type === 'income';
            $isExpense = $type === 'expense';

            $amt = (float) $tx->amount;
            $sign = $isIncome ? '+' : ($isExpense ? '-' : '');
            $formattedAmount = $sign . ' Rp ' . number_format($amt, 0, ',', '.');

            $dateObj   = Carbon::parse($tx->transaction_date);
            $dateLabel = $dateObj->isToday() ? 'Hari ini' : ($dateObj->isYesterday() ? 'Kemarin' : $dateObj->translatedFormat('d M Y'));

            $categoryName = $tx->category ? $tx->category->name : ucfirst($type);
            $title = $tx->description ?: $categoryName;
            $subtitle = $categoryName . ' · ' . $dateLabel;

            return [
                'id'             => $tx->id,
                'title'          => $title,
                'category'       => $categoryName,
                'type'           => $type,
                'amount'         => $amt,
                'signed_amount'  => $formattedAmount,
                'formatted_date' => $dateLabel,
                'subtitle'       => $subtitle,
                'date'           => $tx->transaction_date,
                'color'          => $tx->category->color ?? ($isIncome ? '#10b981' : ($isExpense ? '#ef4444' : '#3b82f6')),
                'icon'           => $tx->category->icon ?? ($isIncome ? 'arrow_downward' : ($isExpense ? 'arrow_upward' : 'swap_horiz')),
                'account_name'   => $tx->account->name ?? null,
            ];
        });

        return ResponseHelper::success([
            'limit'               => $limit,
            'count'               => $formatted->count(),
            'recent_transactions' => $formatted,
        ], 'Daftar transaksi terbaru');
    }
}
