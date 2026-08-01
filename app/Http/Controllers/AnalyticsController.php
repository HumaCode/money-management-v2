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

    public function exportPdf(AnalyticsFilterRequest $request)
    {
        $period     = $request->input('period', 'this_month');
        $accountId  = $request->input('account_id');
        $categoryId = $request->input('category_id');

        $exportData = $this->analyticsService->getExportData($period, $accountId, $categoryId);

        return view('reports.analytics_pdf', [
            'period'        => $period,
            'overview'      => $exportData['overview'],
            'topCategories' => $exportData['topCategories'],
            'transactions'  => $exportData['transactions'],
        ]);
    }

    public function exportExcel(AnalyticsFilterRequest $request)
    {
        $period     = $request->input('period', 'this_month');
        $accountId  = $request->input('account_id');
        $categoryId = $request->input('category_id');

        $exportData = $this->analyticsService->getExportData($period, $accountId, $categoryId);

        $filename = 'Laporan_Analitik_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];

        $callback = function () use ($exportData, $period) {
            $file = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['MONEYFLOW - LAPORAN ANALITIK KEUANGAN']);
            fputcsv($file, ['Periode', ucfirst(str_replace('_', ' ', $period))]);
            fputcsv($file, ['Tanggal Cetak', date('d/m/Y H:i')]);
            fputcsv($file, []);

            // Summary
            fputcsv($file, ['--- RINGKASAN ANALITIK ---']);
            fputcsv($file, ['Total Pemasukan', 'Total Pengeluaran', 'Tabungan Bersih', 'Rasio Tabungan']);
            fputcsv($file, [
                $exportData['overview']['total_income'] ?? 0,
                $exportData['overview']['total_expense'] ?? 0,
                $exportData['overview']['net_savings'] ?? 0,
                ($exportData['overview']['savings_rate'] ?? 0) . '%'
            ]);
            fputcsv($file, []);

            // Transactions
            fputcsv($file, ['--- RINCIAN TRANSAKSI ---']);
            fputcsv($file, ['Tanggal', 'Tipe', 'Kategori', 'Akun', 'Deskripsi', 'Nominal']);

            foreach ($exportData['transactions'] as $t) {
                fputcsv($file, [
                    $t->transaction_date ? $t->transaction_date->format('Y-m-d') : '-',
                    ucfirst($t->type),
                    $t->category->name ?? 'Uncategorized',
                    $t->account->name ?? '-',
                    $t->description ?? '-',
                    $t->amount
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
