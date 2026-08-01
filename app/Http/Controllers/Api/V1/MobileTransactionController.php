<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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

        $perPage = $request->input('per_page', 15);
        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return ResponseHelper::success($transactions, 'Daftar transaksi');
    }

    /**
     * Create New Transaction
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validator = Validator::make($request->all(), [
            'type'             => 'required|in:income,expense,transfer',
            'amount'           => 'required|numeric|min:0.01',
            'account_id'       => 'required|exists:accounts,id',
            'to_account_id'    => 'required_if:type,transfer|nullable|exists:accounts,id',
            'category_id'      => 'required_if:type,income,expense|nullable|exists:categories,id',
            'transaction_date' => 'required|date',
            'description'      => 'nullable|string|max:255',
            'notes'            => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error('Validasi gagal', 422, $validator->errors());
        }

        DB::beginTransaction();
        try {
            $account = Account::where('user_id', $userId)->where('id', $request->account_id)->firstOrFail();

            $transaction = Transaction::create([
                'user_id'          => $userId,
                'account_id'       => $request->account_id,
                'to_account_id'    => $request->to_account_id,
                'category_id'      => $request->category_id,
                'amount'           => $request->amount,
                'type'             => strtolower($request->type),
                'transaction_date' => $request->transaction_date,
                'description'      => $request->description,
                'notes'            => $request->notes,
            ]);

            // Adjust Account Balances
            if (strtolower($request->type) === 'income') {
                $account->increment('current_balance', $request->amount);
            } elseif (strtolower($request->type) === 'expense') {
                $account->decrement('current_balance', $request->amount);
            } elseif (strtolower($request->type) === 'transfer' && $request->to_account_id) {
                $toAccount = Account::where('user_id', $userId)->where('id', $request->to_account_id)->firstOrFail();
                $account->decrement('current_balance', $request->amount);
                $toAccount->increment('current_balance', $request->amount);
            }

            DB::commit();

            return ResponseHelper::success($transaction->load(['category', 'account', 'toAccount']), 'Transaksi berhasil ditambahkan', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error('Gagal menambahkan transaksi: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete Transaction
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;
        $transaction = Transaction::where('user_id', $userId)->where('id', $id)->first();

        if (!$transaction) {
            return ResponseHelper::error('Transaksi tidak ditemukan', 404);
        }

        DB::beginTransaction();
        try {
            // Revert balance changes
            $account = Account::find($transaction->account_id);
            if ($account) {
                if (strtolower($transaction->type) === 'income') {
                    $account->decrement('current_balance', $transaction->amount);
                } elseif (strtolower($transaction->type) === 'expense') {
                    $account->increment('current_balance', $transaction->amount);
                } elseif (strtolower($transaction->type) === 'transfer' && $transaction->to_account_id) {
                    $toAccount = Account::find($transaction->to_account_id);
                    $account->increment('current_balance', $transaction->amount);
                    if ($toAccount) {
                        $toAccount->decrement('current_balance', $transaction->amount);
                    }
                }
            }

            $transaction->delete();
            DB::commit();

            return ResponseHelper::success(null, 'Transaksi berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error('Gagal menghapus transaksi', 500);
        }
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
