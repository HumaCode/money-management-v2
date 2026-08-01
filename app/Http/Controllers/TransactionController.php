<?php

namespace App\Http\Controllers;

use App\Constants\TransactionMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\TransactionStoreRequest;
use App\Http\Requests\TransactionUpdateRequest;
use App\Http\Resources\PaginateResource;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

use Inertia\Inertia;

class TransactionController extends Controller
{
    private string $title               = TransactionMessage::TITLE;
    private string $subtitle            = TransactionMessage::SUBTITLE;

    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request)
    {
        $formData = $this->transactionService->getFormData();
        $type = $request->input('type', 'all');

        $titleMap = [
            'income'   => 'Income Transactions',
            'expense'  => 'Expense Transactions',
            'transfer' => 'Transfer Transactions',
            'all'      => 'All Transactions',
        ];

        $subtitleMap = [
            'income'   => 'Track all incoming money and revenue transactions',
            'expense'  => 'Track all outgoing payments and spending transactions',
            'transfer' => 'Track all inter-account balance transfers',
            'all'      => 'Manage and track all income and expense transactions',
        ];

        $title = $titleMap[$type] ?? 'Transactions';
        $subtitle = $subtitleMap[$type] ?? 'Manage and track transactions';

        return Inertia::render('Transactions/Index', [
            'title'       => $title,
            'subtitle'    => $subtitle,
            'initialType' => $type,
            'accounts'    => $formData['AccountList'] ?? [],
            'categories'  => $formData['CategoryList'] ?? [],
            'currencies'  => $formData['CurrencyList'] ?? [],
        ]);
    }

    public function getAllPaginated(Request $request)
    {
        $request->validate([
            'search'        => 'nullable|string',
            'type'          => 'nullable|string',
            'category_id'   => 'nullable|string',
            'account_id'    => 'nullable|string',
            'start_date'    => 'nullable|string',
            'end_date'      => 'nullable|string',
            'row_per_page'  => 'required|integer'
        ]);

        try {
            $transactions = $this->transactionService->getAllPaginated(
                $request->input('search'),
                $request->input('type'),
                $request->input('category_id'),
                $request->input('account_id'),
                $request->input('start_date'),
                $request->input('end_date'),
                (int) $request->input('row_per_page', 10),
            );

            return ResponseHelper::jsonResponse(
                true,
                TransactionMessage::TRANSACTION_RETRIEVED_SUCCESS,
                PaginateResource::make($transactions, TransactionResource::class),
                200
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('getAllPaginated Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function create(Transaction $transaction)
    {
        $formData = $this->transactionService->getFormData();

        return view($this->formView, array_merge([
            'action' => route($this->storeUrl),
            'data'   => $transaction,
        ], $formData));
    }

    public function store(TransactionStoreRequest $request)
    {
        try {
            $transaction = $this->transactionService->createTransaction($request->validated());

            return ResponseHelper::jsonResponse(
                true,
                TransactionMessage::TRANSACTION_CREATED_SUCCESS,
                new TransactionResource($transaction),
                201
            );
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function edit(Transaction $transaction)
    {
        Gate::authorize('update', $transaction);

        $formData = $this->transactionService->getFormData();

        return view($this->formView, array_merge([
            'action' => route($this->updateUrl, ['transaction' => $transaction->id]),
            'data'   => $transaction,
        ], $formData));
    }

    public function update(TransactionUpdateRequest $request, Transaction $transaction)
    {
        Gate::authorize('update', $transaction);

        try {
            $updatedTransaction = $this->transactionService->updateTransaction($transaction->id, $request->validated());

            return ResponseHelper::jsonResponse(
                true,
                TransactionMessage::TRANSACTION_UPDATED_SUCCESS,
                new TransactionResource($updatedTransaction),
                200
            );
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(Transaction $transaction)
    {
        Gate::authorize('delete', $transaction);

        try {
            $this->transactionService->deleteTransaction($transaction->id);

            return ResponseHelper::jsonResponse(
                true,
                TransactionMessage::TRANSACTION_DELETED_SUCCESS,
                null,
                200
            );
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
