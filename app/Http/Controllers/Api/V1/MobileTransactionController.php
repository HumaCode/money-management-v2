<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Transaction\StoreTransactionRequest;
use App\Http\Requests\Api\Transaction\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MobileTransactionController extends Controller
{
    /**
     * Get Paginated Transactions with Search & Filters
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $query = Transaction::with(['category', 'account', 'toAccount'])
            ->where('user_id', $userId);

        // Filter by Search Query
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($catQ) use ($search) {
                      $catQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Transaction Type (income, expense, transfer)
        if ($request->filled('type') && in_array(strtolower($request->input('type')), ['income', 'expense', 'transfer'])) {
            $query->whereRaw('LOWER(type) = ?', [strtolower($request->input('type'))]);
        }

        // Filter by Month & Year
        if ($request->filled('month')) {
            $query->whereMonth('transaction_date', $request->input('month'));
        }
        if ($request->filled('year')) {
            $query->whereYear('transaction_date', $request->input('year'));
        }

        $perPage = (int) $request->input('per_page', 15);
        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return ResponseHelper::paginatedResource($transactions, TransactionResource::class, 'Daftar transaksi');
    }

    /**
     * Create New Transaction via StoreTransactionRequest
     * Uses DB Transaction & TransactionObserver for automated balance adjustments
     */
    public function store(StoreTransactionRequest $request)
    {
        $userId = $request->user()->id;

        return DB::transaction(function () use ($request, $userId) {
            // Verify Account Ownership
            $account = Account::where('user_id', $userId)
                ->where('id', $request->account_id)
                ->firstOrFail();

            if (strtolower($request->type) === 'transfer' && $request->to_account_id) {
                Account::where('user_id', $userId)
                    ->where('id', $request->to_account_id)
                    ->firstOrFail();
            }

            // TransactionObserver automatically updates Account balances
            $transaction = Transaction::create([
                'user_id'          => $userId,
                'account_id'       => $request->account_id,
                'to_account_id'    => $request->to_account_id,
                'category_id'      => $request->category_id,
                'currency_id'      => $account->currency_id,
                'amount'           => $request->amount,
                'type'             => strtolower($request->type),
                'transaction_date' => $request->transaction_date,
                'description'      => $request->description,
                'notes'            => $request->notes,
            ]);

            return ResponseHelper::success(
                new TransactionResource($transaction->load(['category', 'account', 'toAccount'])),
                'Transaksi berhasil ditambahkan',
                201
            );
        });
    }

    /**
     * Update Existing Transaction
     * Uses DB Transaction & TransactionObserver for automated balance recalculation
     */
    public function update(UpdateTransactionRequest $request, $id)
    {
        $userId = $request->user()->id;
        $transaction = Transaction::where('user_id', $userId)->where('id', $id)->first();

        if (!$transaction) {
            return ResponseHelper::notFound('Transaksi tidak ditemukan');
        }

        return DB::transaction(function () use ($request, $transaction, $userId) {
            $accountId = $request->input('account_id', $transaction->account_id);
            $account   = Account::where('user_id', $userId)->where('id', $accountId)->firstOrFail();

            if ($request->has('to_account_id') && $request->to_account_id) {
                Account::where('user_id', $userId)->where('id', $request->to_account_id)->firstOrFail();
            }

            $transaction->update([
                'account_id'       => $accountId,
                'to_account_id'    => $request->has('to_account_id') ? $request->to_account_id : $transaction->to_account_id,
                'category_id'      => $request->has('category_id') ? $request->category_id : $transaction->category_id,
                'currency_id'      => $account->currency_id,
                'amount'           => $request->input('amount', $transaction->amount),
                'type'             => $request->has('type') ? strtolower($request->type) : $transaction->type,
                'transaction_date' => $request->input('transaction_date', $transaction->transaction_date),
                'description'      => $request->input('description', $transaction->description),
                'notes'            => $request->input('notes', $transaction->notes),
            ]);

            return ResponseHelper::success(
                new TransactionResource($transaction->fresh(['category', 'account', 'toAccount'])),
                'Transaksi berhasil diperbarui'
            );
        });
    }

    /**
     * Delete Transaction
     * Uses DB Transaction & TransactionObserver for automated balance reversion
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;
        $transaction = Transaction::where('user_id', $userId)->where('id', $id)->first();

        if (!$transaction) {
            return ResponseHelper::notFound('Transaksi tidak ditemukan');
        }

        return DB::transaction(function () use ($transaction) {
            // TransactionObserver automatically reverts Account balances
            $transaction->delete();
            return ResponseHelper::success(null, 'Transaksi berhasil dihapus');
        });
    }

    /**
     * Get Master Categories for Dropdown
     */
    public function categories(Request $request)
    {
        $userId = $request->user()->id;
        $categories = Category::where(function ($q) use ($userId) {
            $q->where('user_id', $userId)->orWhereNull('user_id');
        })->where('is_active', true)->orderBy('name', 'asc')->get();

        return ResponseHelper::success($categories, 'Daftar kategori');
    }

    /**
     * Get Master Accounts for Dropdown
     */
    public function accounts(Request $request)
    {
        $userId = $request->user()->id;
        $accounts = Account::where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        return ResponseHelper::success($accounts, 'Daftar akun');
    }
}
