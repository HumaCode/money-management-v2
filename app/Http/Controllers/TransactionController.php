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

class TransactionController extends Controller
{
    private string $title               = TransactionMessage::TITLE;
    private string $subtitle            = TransactionMessage::SUBTITLE;
    private string $formView            = TransactionMessage::FORMVIEW;
    private string $indexView           = TransactionMessage::INDEXVIEW;

    private string $createUrl           = TransactionMessage::CREATEURL;
    private string $editUrl             = TransactionMessage::EDITURL;
    private string $storeUrl            = TransactionMessage::STOREURL;
    private string $updateUrl           = TransactionMessage::UPDATEURL;
    private string $destroyUrl          = TransactionMessage::DESTROYURL;

    private string $dataUrl             = TransactionMessage::PAGINATIONURL;
    private string $dataTableId         = TransactionMessage::TABLEID;

    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index()
    {
        $data = [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'createUrl'         => route($this->createUrl),
            'editUrl'           => route($this->editUrl, ['transaction' => '__ID__']),
            'destroyUrl'        => route($this->destroyUrl, ['transaction' => '__ID__']),
            'dataUrl'           => route($this->dataUrl),
            'dataTableId'       => $this->dataTableId,
            'formData'          => $this->transactionService->getFormData(),
        ];

        return view($this->indexView, $data);
    }

    public function getAllPaginated(Request $request)
    {
        $request->validate([
            'search'        => 'nullable|string',
            'type'          => 'nullable|string',
            'category_id'   => 'nullable|string',
            'row_per_page'  => 'required|integer'
        ]);

        try {
            $transactions = $this->transactionService->getAllPaginated(
                $request->input('search'),
                $request->input('type'),
                $request->input('category_id'),
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
