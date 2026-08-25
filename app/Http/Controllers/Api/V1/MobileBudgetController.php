<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\BudgetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MobileBudgetController extends Controller
{
    /**
     * Get List of Budgets for Authenticated User
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $status = $request->query('status'); // active, inactive, or all
        $period = $request->query('period');

        $query = Budget::with(['currency:id,code,name,symbol', 'budgetCategories.category:id,name,icon,color'])
            ->where('user_id', $userId);

        if ($status && $status !== 'all') {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($period && $period !== 'all') {
            $query->where('period', strtolower($period));
        }

        $budgets = $query->orderBy('created_at', 'desc')->get()->map(function ($budget) {
            return $this->formatBudgetData($budget);
        });

        return ResponseHelper::success($budgets, 'Daftar anggaran (budgets)');
    }

    /**
     * Get Details of a Single Budget
     */
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;
        $budget = Budget::with(['currency:id,code,name,symbol', 'budgetCategories.category:id,name,icon,color'])
            ->where('user_id', $userId)
            ->where('id', $id)
            ->first();

        if (!$budget) {
            return ResponseHelper::notFound('Budget tidak ditemukan');
        }

        return ResponseHelper::success($this->formatBudgetData($budget, true), 'Detail anggaran (budget)');
    }

    /**
     * Create New Budget
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'currency_id'     => 'required|string|exists:currencies,id',
            'total_amount'    => 'required|numeric|min:0',
            'period'          => 'nullable|string|in:weekly,monthly,quarterly,yearly',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'rollover_unused' => 'nullable|boolean',
            'notes'           => 'nullable|string',
        ], [
            'name.required'         => 'Nama anggaran wajib diisi.',
            'currency_id.required'  => 'Mata uang wajib dipilih.',
            'currency_id.exists'    => 'Mata uang tidak valid.',
            'total_amount.required' => 'Jumlah total anggaran wajib diisi.',
        ]);

        $budget = Budget::create([
            'user_id'          => $userId,
            'name'             => $validated['name'],
            'currency_id'      => $validated['currency_id'],
            'total_amount'     => (float) $validated['total_amount'],
            'total_spent'      => 0,
            'progress_percentage' => 0,
            'period'           => $validated['period'] ?? 'monthly',
            'start_date'       => $validated['start_date'] ?? null,
            'end_date'         => $validated['end_date'] ?? null,
            'is_active'        => true,
            'rollover_unused'  => $request->boolean('rollover_unused', false),
            'notes'            => $validated['notes'] ?? null,
        ]);

        $budget->load(['currency:id,code,name,symbol']);

        return ResponseHelper::success($this->formatBudgetData($budget), 'Anggaran berhasil dibuat', 201);
    }

    /**
     * Update Budget
     */
    public function update(Request $request, $id)
    {
        $userId = $request->user()->id;
        $budget = Budget::where('user_id', $userId)->where('id', $id)->first();

        if (!$budget) {
            return ResponseHelper::notFound('Budget tidak ditemukan');
        }

        $validated = $request->validate([
            'name'            => 'sometimes|required|string|max:255',
            'currency_id'     => 'sometimes|required|string|exists:currencies,id',
            'total_amount'    => 'sometimes|required|numeric|min:0',
            'period'          => 'nullable|string|in:weekly,monthly,quarterly,yearly',
            'start_date'      => 'nullable|date',
            'end_date'        => 'nullable|date|after_or_equal:start_date',
            'is_active'       => 'nullable|boolean',
            'rollover_unused' => 'nullable|boolean',
            'notes'           => 'nullable|string',
        ]);

        if (isset($validated['total_amount'])) {
            $validated['total_amount'] = (float) $validated['total_amount'];
        }

        $budget->update($validated);
        $budget->recalculateSpent();
        $budget->load(['currency:id,code,name,symbol']);

        return ResponseHelper::success($this->formatBudgetData($budget), 'Anggaran berhasil diperbarui');
    }

    /**
     * Delete Budget
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;
        $budget = Budget::where('user_id', $userId)->where('id', $id)->first();

        if (!$budget) {
            return ResponseHelper::notFound('Budget tidak ditemukan');
        }

        $budget->delete();

        return ResponseHelper::success(null, 'Anggaran berhasil dihapus');
    }

    /**
     * Add Expense to Budget
     */
    public function addExpense(Request $request, $id)
    {
        $userId = $request->user()->id;
        $budget = Budget::where('user_id', $userId)->where('id', $id)->first();

        if (!$budget) {
            return ResponseHelper::notFound('Budget tidak ditemukan');
        }

        $validated = $request->validate([
            'category_id'  => 'required|string|exists:categories,id',
            'spent_amount' => 'required|numeric|min:0.01',
            'spent_date'   => 'nullable|date',
            'notes'        => 'nullable|string',
        ], [
            'category_id.required'  => 'Kategori wajib dipilih.',
            'category_id.exists'    => 'Kategori tidak valid.',
            'spent_amount.required' => 'Nominal pengeluaran wajib diisi.',
        ]);

        DB::beginTransaction();
        try {
            $spentAmount = (float) $validated['spent_amount'];
            $spentDate   = $validated['spent_date'] ?? now()->format('Y-m-d');

            $expense = BudgetCategory::create([
                'budget_id'       => $budget->id,
                'category_id'     => $validated['category_id'],
                'spent_amount'    => $spentAmount,
                'allocated_amount'=> $spentAmount,
                'spent_date'      => $spentDate,
                'notes'           => $validated['notes'] ?? null,
            ]);

            DB::commit();

            $budget->refresh();
            $budget->load(['currency:id,code,name,symbol']);

            return ResponseHelper::success([
                'budget'  => $this->formatBudgetData($budget),
                'expense' => $expense->load('category:id,name,icon,color'),
            ], 'Pengeluaran anggaran berhasil dicatat', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error('Gagal mencatat pengeluaran anggaran: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Expenses List for a Budget
     */
    public function expenses(Request $request, $id)
    {
        $userId = $request->user()->id;
        $budget = Budget::where('user_id', $userId)->where('id', $id)->first();

        if (!$budget) {
            return ResponseHelper::notFound('Budget tidak ditemukan');
        }

        $expenses = BudgetCategory::with(['category:id,name,icon,color'])
            ->where('budget_id', $id)
            ->orderBy('spent_date', 'desc')
            ->get()
            ->map(function ($exp) {
                return [
                    'id'                     => $exp->id,
                    'budget_id'              => $exp->budget_id,
                    'category_id'            => $exp->category_id,
                    'category_name'          => $exp->category ? $exp->category->name : 'Uncategorized',
                    'category_icon'          => $exp->category ? $exp->category->icon : '🍔',
                    'category_color'         => $exp->category ? $exp->category->color : '#10b981',
                    'spent_amount'           => (float) $exp->spent_amount,
                    'spent_amount_formatted' => $exp->spent_amount_formatted,
                    'spent_date'             => $exp->spent_date ? $exp->spent_date->format('Y-m-d') : null,
                    'notes'                  => $exp->notes,
                ];
            });

        return ResponseHelper::success($expenses, 'Daftar rincian pengeluaran anggaran');
    }

    /**
     * Get Available Periods List
     */
    public function periods()
    {
        $periods = [
            ['id' => 'weekly', 'name' => 'Weekly'],
            ['id' => 'monthly', 'name' => 'Monthly'],
            ['id' => 'quarterly', 'name' => 'Quarterly'],
            ['id' => 'yearly', 'name' => 'Yearly'],
        ];
        return ResponseHelper::success($periods, 'Daftar periode anggaran');
    }

    /**
     * Helper to Format Budget Response
     */
    private function formatBudgetData(Budget $budget, bool $withExpenses = false): array
    {
        $total     = (float) $budget->total_amount;
        $spent     = (float) $budget->total_spent;
        $remaining = max(0, $total - $spent);
        $progress  = $total > 0 ? min(100, round(($spent / $total) * 100, 2)) : 0;

        $data = [
            'id'                             => $budget->id,
            'name'                           => $budget->name,
            'currency_id'                    => $budget->currency_id,
            'currency_code'                  => $budget->currency ? $budget->currency->code : 'IDR',
            'currency_symbol'                => $budget->currency ? $budget->currency->symbol : 'Rp',
            'total_amount'                   => $total,
            'total_amount_formatted'         => $budget->total_amount_formatted,
            'total_spent'                    => $spent,
            'spent_amount_formatted'         => $budget->spent_amount_formatted,
            'remaining_amount'               => $remaining,
            'remaining_amount_formatted'     => $budget->remaining_amount_formatted,
            'progress_percentage'            => $progress,
            'period'                         => strtolower($budget->period ?? 'monthly'),
            'start_date'                     => $budget->start_date ? $budget->start_date->format('Y-m-d') : null,
            'end_date'                       => $budget->end_date ? $budget->end_date->format('Y-m-d') : null,
            'date_range_formatted'           => $budget->date_range_formatted,
            'is_active'                      => (bool) $budget->is_active,
            'rollover_unused'                => (bool) $budget->rollover_unused,
            'status'                         => $budget->status,
            'notes'                          => $budget->notes,
            'created_at'                     => $budget->created_at ? $budget->created_at->toIso8601String() : null,
            'updated_at'                     => $budget->updated_at ? $budget->updated_at->toIso8601String() : null,
        ];

        if ($withExpenses && $budget->relationLoaded('budgetCategories')) {
            $data['expenses'] = $budget->budgetCategories->map(function ($exp) {
                return [
                    'id'                     => $exp->id,
                    'category_id'            => $exp->category_id,
                    'category_name'          => $exp->category ? $exp->category->name : 'Uncategorized',
                    'category_icon'          => $exp->category ? $exp->category->icon : '🍔',
                    'spent_amount'           => (float) $exp->spent_amount,
                    'spent_amount_formatted' => $exp->spent_amount_formatted,
                    'spent_date'             => $exp->spent_date ? $exp->spent_date->format('Y-m-d') : null,
                    'notes'                  => $exp->notes,
                ];
            });
        }

        return $data;
    }
}
