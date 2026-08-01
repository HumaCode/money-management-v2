<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\RecurringTransactionStoreRequest;
use App\Http\Requests\RecurringTransactionUpdateRequest;
use App\Http\Resources\PaginateResource;
use App\Http\Resources\RecurringTransactionResource;
use App\Services\RecurringTransactionService;
use App\Interface\RecurringTransactionRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecurringTransactionController extends Controller
{
    protected RecurringTransactionService $recurringService;
    protected RecurringTransactionRepositoryInterface $recurringRepository;

    public function __construct(
        RecurringTransactionService $recurringService,
        RecurringTransactionRepositoryInterface $recurringRepository
    ) {
        $this->recurringService = $recurringService;
        $this->recurringRepository = $recurringRepository;
    }

    public function index()
    {
        $formData = $this->recurringService->getFormData();
        $summary = $this->recurringRepository->getSummaryStats();

        return Inertia::render('Recurring/Index', [
            'title'      => 'Recurring Transactions',
            'subtitle'   => 'Manage your automatic recurring income and expenses',
            'summary'    => $summary,
            'accounts'   => $formData['AccountList'] ?? [],
            'categories' => $formData['CategoryList'] ?? [],
            'currencies' => $formData['CurrencyList'] ?? [],
        ]);
    }

    public function getAllPaginated(Request $request)
    {
        $request->validate([
            'search'       => 'nullable|string|max:255',
            'type'         => 'nullable|string|in:all,income,expense',
            'frequency'    => 'nullable|string',
            'category_id'  => 'nullable|string',
            'account_id'   => 'nullable|string',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date',
            'row_per_page' => 'nullable|integer|min:1|max:100',
            'page'         => 'nullable|integer|min:1',
        ]);

        $rowsPerPage = $request->input('row_per_page', 10);

        $paginated = $this->recurringRepository->getAllPaginated(
            $request->input('search'),
            $request->input('type'),
            $request->input('frequency'),
            $request->input('category_id'),
            $request->input('account_id'),
            $request->input('start_date'),
            $request->input('end_date'),
            $rowsPerPage
        );

        $summary = $this->recurringRepository->getSummaryStats();

        $resource = PaginateResource::make(
            $paginated,
            RecurringTransactionResource::class
        )->additional([
            'summary' => $summary,
        ]);

        return ResponseHelper::success($resource, 'Recurring transactions retrieved successfully');
    }

    public function store(RecurringTransactionStoreRequest $request)
    {
        try {
            $recurring = $this->recurringService->createRecurring($request->validated());

            return ResponseHelper::success(
                RecurringTransactionResource::make($recurring->load(['account', 'category', 'currency'])),
                'Recurring transaction created successfully',
                201
            );
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to create recurring transaction: ' . $e->getMessage(), 500);
        }
    }

    public function update(RecurringTransactionUpdateRequest $request, $id)
    {
        try {
            $recurring = $this->recurringService->updateRecurring($id, $request->validated());

            return ResponseHelper::success(
                RecurringTransactionResource::make($recurring->load(['account', 'category', 'currency'])),
                'Recurring transaction updated successfully'
            );
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to update recurring transaction: ' . $e->getMessage(), 500);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = $this->recurringService->deleteRecurring($id);

            if (!$deleted) {
                return ResponseHelper::error('Recurring transaction not found or already deleted', 444);
            }

            return ResponseHelper::success(null, 'Recurring transaction deleted successfully');
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to delete recurring transaction: ' . $e->getMessage(), 500);
        }
    }
}
