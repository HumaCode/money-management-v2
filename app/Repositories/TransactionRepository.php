<?php

namespace App\Repositories;

use App\Constants\GlobalMessage;
use App\Interface\TransactionRepositoryInterface;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\Transaction;

class TransactionRepository implements TransactionRepositoryInterface
{
    public function getAll(?string $search = null, ?string $type = null, ?string $categoryId = null, ?string $accountId = null, ?string $startDate = null, ?string $endDate = null, ?string $limit = null, bool $execute = true)
    {
        $query = Transaction::query()->with(['account', 'toAccount', 'category', 'currency']);

        // Scope to current authenticated user
        if (function_exists('user') && user('id')) {
            $query->where('user_id', user('id'));
        }

        // Search filter (description / notes / reference_number)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        // Category filter
        if ($categoryId && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        // Account filter
        if ($accountId && $accountId !== 'all') {
            $query->where(function ($q) use ($accountId) {
                $q->where('account_id', $accountId)
                  ->orWhere('to_account_id', $accountId);
            });
        }

        // Date range filter
        if ($startDate) {
            $query->whereDate('transaction_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('transaction_date', '<=', $endDate);
        }

        // Limit
        if ($limit) {
            $query->take((int) $limit);
        }

        // Order by latest transaction_date & id
        $query->orderBy('transaction_date', 'desc')
              ->orderBy('id', 'desc');

        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(?string $search = null, ?string $type = null, ?string $categoryId = null, ?string $accountId = null, ?string $startDate = null, ?string $endDate = null, ?int $rowsPerPage = 10)
    {
        return $this->getAll($search, $type, $categoryId, $accountId, $startDate, $endDate, null, false)
            ->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        return Transaction::with(['account', 'category', 'currency'])->where('id', $id)->first();
    }

    public function create(array $data)
    {
        $transaction = new Transaction();

        $transaction->user_id          = user('id');
        $transaction->account_id       = $data['account_id'];
        $transaction->to_account_id    = $data['to_account_id'] ?? null;
        $transaction->category_id      = $data['category_id'] ?? null;
        $transaction->currency_id      = $data['currency_id'];
        $transaction->amount           = $data['amount'];
        $transaction->type             = $data['type'];
        $transaction->description      = $data['description'];
        $transaction->notes            = $data['notes'] ?? null;
        $transaction->transaction_date = $data['transaction_date'];
        $transaction->reference_number = $data['reference_number'] ?? null;

        $transaction->save();

        return $transaction;
    }

    public function update(string $id, array $data)
    {
        $transaction = $this->getById($id);

        if (!$transaction) {
            throw new \Exception('Transaction not found');
        }

        $transaction->account_id       = $data['account_id'];
        $transaction->to_account_id    = $data['to_account_id'] ?? null;
        $transaction->category_id      = $data['category_id'] ?? null;
        $transaction->currency_id      = $data['currency_id'];
        $transaction->amount           = $data['amount'];
        $transaction->type             = $data['type'];
        $transaction->description      = $data['description'];
        $transaction->notes            = $data['notes'] ?? null;
        $transaction->transaction_date = $data['transaction_date'];
        $transaction->reference_number = $data['reference_number'] ?? null;

        $transaction->save();

        return $transaction;
    }

    public function delete(string $id)
    {
        $transaction = $this->getById($id);

        if (!$transaction) {
            return false;
        }

        return $transaction->delete();
    }

    public function getAccountList()
    {
        $query = Account::query();
        if (function_exists('user') && user('id')) {
            $query->where('user_id', user('id'));
        }

        return $query->select('name', 'icon', 'id', 'balance')
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }

    public function getCategoryList(?string $type = null)
    {
        $query = Category::query();
        if ($type) {
            $query->where('type', $type);
        }

        return $query->select('name', 'icon', 'id', 'type')
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }

    public function getCurrencyList()
    {
        return Currency::select('name', 'code', 'symbol', 'id')
            ->distinct()
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }
}
