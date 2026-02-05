<?php

namespace App\Repositories;

use App\Constants\GlobalMessage;
use App\Interface\AccountRepositoryInterface;
use App\Models\Account;
use App\Models\AccountType;
use App\Models\Currency;
use Illuminate\Support\Facades\DB;

class AccountRepository implements AccountRepositoryInterface
{
    public function getAll(?string $search, ?string $status, ?string $type, ?string $limit, bool $execute)
    {
        $query = Account::query();

        // Search filter
        if ($search) {
            $query->search($search);
        }

        // Status filter
        if ($status && $status !== 'all') {
            if ($status === 'active') {
                $query->active();
            }

            if ($status === 'inactive') {
                $query->where('is_active', 0);
            }
        }

        // Type filter
        if ($type && $type !== 'all') {
            $query->where('account_type_id', $type);
        }

        // Limit
        if ($limit) {
            $query->take((int)$limit);
        }

        // Order by
        $query->orderBy('id', 'desc');

        // Eager loading jika diperlukan
        $query->with(['user', 'accountType', 'currency']);

        // Execute or return query builder
        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(?string $search, ?string $status, ?string $type, ?int $rowsPerPage)
    {
        return $this->getAll($search, $status, $type, null, false)
            ->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        $query = Account::where('id', $id);
        return $query->first();
    }

    public function create(array $data)
    {
        DB::beginTransaction();
        try {
            $account = new Account();
            $account->user_id                   = user('id');
            $account->account_type_id           = $data['account_type_id'] ?? null;
            $account->currency_id               = $data['currency_id'];
            $account->name                      = $data['name'];
            $account->institution_name          = $data['institution_name'] ?? null;
            $account->account_number            = $data['account_number'] ?? null;
            $account->balance                   = $data['balance'] ?? 0;
            $account->current_balance           = $data['balance'] ?? 0;
            $account->credit_limit              = 0;
            $account->notes                     = $data['notes'] ?? null;
            $account->is_active                 = '1';
            $account->is_default                = $data['is_default'] ?? '0';
            $account->icon                      = $data['icon'] ?? null;
            $account->color                     = $data['color'] ?? null;
            $account->save();

            DB::commit();

            return $account;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception(GlobalMessage::ERROR_CREATING . $e->getMessage());
        }
    }

    public function update(string $id, array $data)
    {
        DB::beginTransaction();

        try {
            $account = $this->getById($id);

            if (!$account) {
                throw new \Exception('Account not found');
            }

            $account->account_type_id           = $data['account_type_id'] ?? null;
            $account->currency_id               = $data['currency_id'];
            $account->name                      = $data['name'];
            $account->institution_name          = $data['institution_name'] ?? null;
            $account->account_number            = $data['account_number'] ?? null;
            $account->current_balance           = $data['balance'] ?? 0;
            $account->notes                     = $data['notes'] ?? null;
            $account->is_active                 = $data['is_active'] ?? '1';
            $account->is_default                = $data['is_default'] ?? '0';

            // Only update balance and credit_limit if provided
            if (isset($data['balance'])) {
                $account->balance = $data['balance'];
            }

            if (isset($data['credit_limit'])) {
                $account->credit_limit = $data['credit_limit'];
            }

            $account->save();

            DB::commit();

            return $account;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception(GlobalMessage::ERROR_UPDATING . $e->getMessage());
        }
    }

    public function delete(string $id)
    {
        $account = $this->getById($id);

        if (!$account) {
            return false;
        }

        return $account->delete();
    }

    public function getAccountTypeList()
    {
        return AccountType::select('name', 'id')
            ->distinct()
            ->pluck('name', 'id')
            ->toArray();
    }

    public function getCurrencyList()
    {
        return Currency::select('name', 'id')
            ->distinct()
            ->pluck('name', 'id')
            ->toArray();
    }
}
