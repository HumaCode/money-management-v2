<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Interface\DashboardRepositoryInterface;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MobileDashboardController extends Controller
{
    protected $dashboardRepository;

    public function __construct(DashboardRepositoryInterface $dashboardRepository)
    {
        $this->dashboardRepository = $dashboardRepository;
    }

    /**
     * Mobile Dashboard API Endpoint tailored for Flutter Mobile UI
     */
    public function index(Request $request)
    {
        $user   = $request->user();
        $userId = $user->id;

        // Fetch core data
        $stats            = $this->dashboardRepository->getDashboardStats($userId);
        $rawRecentTx      = $this->dashboardRepository->getRecentTransactions($userId, 6);
        $categoryExpenses = $this->dashboardRepository->getCategoryExpenses($userId);
        $savingsHeatmap   = $this->dashboardRepository->getSavingsHeatmapData($userId);
        $savingsGoals     = $this->dashboardRepository->getSavingsGoalsList($userId);
        $smartInsights    = $this->dashboardRepository->getSmartInsights($userId);

        // Count unread notifications
        $unreadNotifications = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        // Format recent transactions for mobile tiles
        $formattedRecentTx = $rawRecentTx->map(function ($tx) {
            $type = strtolower($tx->type);
            $isIncome  = $type === 'income';
            $isExpense = $type === 'expense';

            $dateObj = Carbon::parse($tx->transaction_date);
            $dateLabel = $dateObj->isToday() ? 'Hari ini' : ($dateObj->isYesterday() ? 'Kemarin' : $dateObj->translatedFormat('d M Y'));

            return [
                'id'             => $tx->id,
                'title'          => $tx->description ?: ($tx->category ? $tx->category->name : ($isIncome ? 'Pemasukan' : 'Pengeluaran')),
                'category'       => $tx->category ? $tx->category->name : ucfirst($type),
                'amount'         => (float) $tx->amount,
                'type'           => $type,
                'formatted_date' => $dateLabel,
                'date'           => $tx->transaction_date,
                'color'          => $tx->category->color ?? ($isIncome ? '#10b981' : ($isExpense ? '#ef4444' : '#3b82f6')),
                'icon'           => $tx->category->icon ?? ($isIncome ? 'arrow_downward' : ($isExpense ? 'arrow_upward' : 'swap_horiz')),
            ];
        });

        // Response structured specifically for Flutter Dashboard Screen
        return ResponseHelper::success([
            'user' => [
                'name'                       => $user->name,
                'username'                   => $user->username,
                'avatar'                     => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'unread_notifications_count' => $unreadNotifications,
            ],
            'summary' => [
                'total_balance'       => (float) $stats['total_balance'],
                'income_this_month'   => (float) $stats['income_this_month'],
                'expenses_this_month' => (float) $stats['expenses_this_month'],
            ],
            'top_expenses'        => $categoryExpenses->take(5)->values(),
            'recent_transactions' => $formattedRecentTx->values(),
            'analytics' => [
                'stats'           => $stats,
                'savings_heatmap' => $savingsHeatmap,
                'savings_goals'   => $savingsGoals,
                'smart_insights'  => $smartInsights,
            ],
        ], 'Data dashboard mobile berhasil diambil');
    }
}
