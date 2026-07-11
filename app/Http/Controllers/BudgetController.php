<?php

namespace App\Http\Controllers;

use App\Constants\BudgetMessage;
use App\Constants\GlobalMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\Budget\BudgetStoreExpenseRequest;
use App\Http\Requests\Budget\BudgetStoreRequest;
use App\Http\Requests\Budget\BudgetUpdateRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\PaginateResource;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    private string $title    = BudgetMessage::TITLE;
    private string $subtitle = BudgetMessage::SUBTITLE;
    private BudgetService $budgetService;

    public function __construct(BudgetService $budgetService)
    {
        $this->budgetService = $budgetService;
    }

    public function index()
    {
        return Inertia::render('Budgets/Index', [
            'title'      => $this->title,
            'subtitle'   => $this->subtitle,
            'periods'    => $this->budgetService->getPeriodList(),
            'currencies' => $this->budgetService->getCurrencyList(),
            'categories' => $this->budgetService->getCategoryList(),
        ]);
    }

    public function getAllPaginated(Request $request)
    {
        $data = $request->validate([
            'search'       => 'nullable|string',
            'status'       => 'nullable|string',
            'period'       => 'nullable|string',
            'row_per_page' => 'required|integer',
        ]);

        try {
            $budgets = $this->budgetService->getAllPaginated(
                $data['search'] ?? null,
                $data['status'] ?? null,
                $data['period'] ?? null,
                $data['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_RETRIEVED_SUCCESS, PaginateResource::make($budgets, BudgetResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function store(BudgetStoreRequest $request)
    {
        $data = $request->validated();

        try {
            $budget = $this->budgetService->createBudget($data);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_CREATED_SUCCESS, new BudgetResource($budget), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function storeExpenses(BudgetStoreExpenseRequest $request, Budget $budget)
    {
        $data = $request->validated();

        try {
            $result = $this->budgetService->addExpenses($budget->id, $data);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_EXPENSE_ADDED_SUCCESS, new BudgetResource($result), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function update(BudgetUpdateRequest $request, Budget $budget)
    {
        $data = $request->validated();

        try {
            $budget = $this->budgetService->updateBudget($budget->id, $data);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_UPDATED_SUCCESS, new BudgetResource($budget), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function getExpenses(Budget $budget)
    {
        try {
            $expenses = $budget->budgetCategories()
                ->with(['category', 'budget.currency'])
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'category_name' => $item->category?->name ?? 'Uncategorized',
                        'category_icon' => $item->category?->icon ?? '🍔',
                        'spent_date' => $item->spent_date?->format('d M Y') ?? '—',
                        'raw_spent_date' => $item->spent_date?->format('Y-m-d') ?? null,
                        'allocated_amount' => (float)$item->allocated_amount,
                        'spent_amount' => (float)$item->spent_amount,
                        'spent_amount_formatted' => $item->spent_amount_formatted,
                        'notes' => $item->notes ?? '—',
                    ];
                });

            return ResponseHelper::jsonResponse(true, 'Expenses retrieved successfully', $expenses, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(Budget $budget)
    {
        try {
            $record = $this->budgetService->getBudgetById($budget->id);
            if (!$record) {
                return ResponseHelper::jsonResponse(false, GlobalMessage::NOT_FOUND, null, 404);
            }

            $this->budgetService->deleteBudget($record->id);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_DELETED_SUCCESS, null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
