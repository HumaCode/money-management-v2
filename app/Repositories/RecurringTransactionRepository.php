<?php

namespace App\Repositories;

use App\Interface\RecurringTransactionRepositoryInterface;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\RecurringTransaction;
use Illuminate\Support\Facades\DB;

class RecurringTransactionRepository implements RecurringTransactionRepositoryInterface
{
    public function getAll(
        ?string $search = null,
        ?string $type = null,
        ?string $frequency = null,
        ?string $categoryId = null,
        ?string $accountId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?int $limit = null,
        bool $execute = true
    ) {
        $query = RecurringTransaction::query()
            ->with(['account', 'category', 'currency'])
            ->where('user_id', user('id'));

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if (!empty($type) && $type !== 'all') {
            $query->where('type', $type);
        }

        if (!empty($frequency) && $frequency !== 'all') {
            $query->where('frequency', $frequency);
        }

        if (!empty($categoryId) && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        if (!empty($accountId) && $accountId !== 'all') {
            $query->where('account_id', $accountId);
        }

        if (!empty($startDate)) {
            $query->whereDate('start_date', '>=', $startDate);
        }

        if (!empty($endDate)) {
            $query->whereDate('start_date', '<=', $endDate);
        }

        $query->orderBy('created_at', 'desc');

        if (!empty($limit)) {
            $query->limit($limit);
        }

        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(
        ?string $search = null,
        ?string $type = null,
        ?string $frequency = null,
        ?string $categoryId = null,
        ?string $accountId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?int $rowsPerPage = 10
    ) {
        return $this->getAll(
            $search,
            $type,
            $frequency,
            $categoryId,
            $accountId,
            $startDate,
            $endDate,
            null,
            false
        )->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        return RecurringTransaction::with(['account', 'category', 'currency'])
            ->where('user_id', user('id'))
            ->where('id', $id)
            ->first();
    }

    public function create(array $data)
    {
        $recurring = new RecurringTransaction();

        $recurring->user_id              = user('id');
        $recurring->account_id           = $data['account_id'];
        $recurring->category_id          = $data['category_id'] ?? null;
        $recurring->currency_id          = $data['currency_id'];
        $recurring->amount               = $data['amount'];
        $recurring->type                 = $data['type'];
        $recurring->description          = $data['description'];
        $recurring->frequency            = $data['frequency'];
        $recurring->day_of_month         = $data['day_of_month'] ?? null;
        $recurring->day_of_week          = $data['day_of_week'] ?? null;
        $recurring->start_date           = $data['start_date'];
        $recurring->end_date             = $data['end_date'] ?? null;
        $recurring->next_occurrence_date = $data['next_occurrence_date'] ?? $data['start_date'];
        $recurring->is_active            = isset($data['is_active']) ? (bool)$data['is_active'] : true;
        $recurring->notes                = $data['notes'] ?? null;

        $recurring->save();

        return $recurring;
    }

    public function update(string $id, array $data)
    {
        $recurring = $this->getById($id);

        if (!$recurring) {
            throw new \Exception('Recurring transaction not found');
        }

        $recurring->account_id           = $data['account_id'];
        $recurring->category_id          = $data['category_id'] ?? null;
        $recurring->currency_id          = $data['currency_id'];
        $recurring->amount               = $data['amount'];
        $recurring->type                 = $data['type'];
        $recurring->description          = $data['description'];
        $recurring->frequency            = $data['frequency'];
        $recurring->day_of_month         = $data['day_of_month'] ?? null;
        $recurring->day_of_week          = $data['day_of_week'] ?? null;
        $recurring->start_date           = $data['start_date'];
        $recurring->end_date             = $data['end_date'] ?? null;
        if (isset($data['next_occurrence_date'])) {
            $recurring->next_occurrence_date = $data['next_occurrence_date'];
        }
        if (isset($data['is_active'])) {
            $recurring->is_active = (bool)$data['is_active'];
        }
        $recurring->notes                = $data['notes'] ?? null;

        $recurring->save();

        return $recurring;
    }

    public function delete(string $id)
    {
        $recurring = $this->getById($id);

        if (!$recurring) {
            return false;
        }

        return $recurring->delete();
    }

    public function getAccountList()
    {
        return Account::where('user_id', user('id'))
            ->where('is_active', true)
            ->select('id', 'name', 'account_number', 'balance', 'currency_id')
            ->get();
    }

    public function getCategoryList()
    {
        return Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', user('id'));
        })
        ->select('id', 'name', 'type', 'icon')
        ->get();
    }

    public function getCurrencyList()
    {
        return Currency::select('id', 'code', 'name', 'symbol')->get();
    }

    public function getSummaryStats()
    {
        $userId = user('id') ?? \Illuminate\Support\Facades\Auth::id();

        $stats = DB::table('recurring_transactions')
            ->where('user_id', $userId)
            ->selectRaw("
                COUNT(CASE WHEN is_active = 1 OR is_active = true THEN 1 END) as active_count,
                COALESCE(SUM(CASE WHEN LOWER(type) = 'income' AND (is_active = 1 OR is_active = true) THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN LOWER(type) = 'expense' AND (is_active = 1 OR is_active = true) THEN amount ELSE 0 END), 0) as total_expense
            ")
            ->first();

        return [
            'active_count'    => (int) ($stats->active_count ?? 0),
            'monthly_income'  => (float) ($stats->total_income ?? 0),
            'monthly_expense' => (float) ($stats->total_expense ?? 0),
        ];
    }
}
