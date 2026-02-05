<?php

namespace App\Repositories;

use App\Constants\GlobalMessage;
use App\Interface\BudgetRepositoryInterface;
use App\Models\Budget;
use App\Models\Currency;
use Illuminate\Support\Facades\DB;

class BudgetRepository implements BudgetRepositoryInterface
{
    public function getAll(?string $search, ?string $status, ?string $period, ?string $limit, bool $execute)
    {
        $query = Budget::query();

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

        // Period filter
        if ($period && $period !== 'all') {
            $query->where('period', $period);
        }

        // Limit
        if ($limit) {
            $query->take((int)$limit);
        }

        // Order by
        $query->orderBy('id', 'desc');

        // Eager loading jika diperlukan
        $query->with(['user', 'currency', 'budgetCategories']);

        // Execute or return query builder
        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(?string $search, ?string $status, ?string $period, ?int $rowsPerPage)
    {
        return $this->getAll($search, $status, $period, null, false)
            ->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        $query = Budget::where('id', $id);
        return $query->first();
    }

    public function create(array $data)
    {
        DB::beginTransaction();
        try {
            $budget = new Budget();
            $budget->user_id                    = user('id');
            $budget->name                       = $data['name'];
            $budget->currency_id                = $data['currency_id'];
            $budget->total_amount               = $data['total_amount'] ?? 0;
            $budget->period                     = $data['period'] ?? null;
            $budget->start_date                 = $data['start_date'] ?? null;
            $budget->end_date                   = $data['end_date'] ?? null;
            $budget->is_active                  = '1';
            $budget->rollover_unused            = '0';
            $budget->notes                      = $data['notes'] ?? null;
            $budget->save();

            DB::commit();

            return $budget;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception(GlobalMessage::ERROR_CREATING . $e->getMessage());
        }
    }

    public function update(string $id, array $data)
    {
        DB::beginTransaction();

        try {
            $budget = $this->getById($id);

            if (!$budget) {
                throw new \Exception('Budget not found');
            }

            $budget->currency_id               = $data['currency_id'];
            $budget->name                      = $data['name'];
            $budget->institution_name          = $data['institution_name'] ?? null;
            $budget->account_number            = $data['account_number'] ?? null;
            $budget->current_balance           = $data['balance'] ?? 0;
            $budget->notes                     = $data['notes'] ?? null;
            $budget->period                    = $data['period'] ?? null;
            $budget->is_active                 = $data['is_active'] ?? '1';
            $budget->is_default                = $data['is_default'] ?? '0';


            $budget->save();

            DB::commit();

            return $budget;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception(GlobalMessage::ERROR_UPDATING . $e->getMessage());
        }
    }

    public function delete(string $id)
    {
        $budget = $this->getById($id);

        if (!$budget) {
            return false;
        }

        return $budget->delete();
    }

    public function getPeriodList()
    {
        return  ['weekly', 'monthly', 'quarterly', 'yearly'];
    }

    public function getCurrencyList()
    {
        return Currency::select('name', 'code', 'id')
            ->distinct()
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }
}
