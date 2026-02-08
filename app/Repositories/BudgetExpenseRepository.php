<?php

namespace App\Repositories;

use App\Constants\GlobalMessage;
use App\Interface\BudgetExpenseRepositoryInnterface;
use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\Category;
use App\Models\Currency;
use Illuminate\Support\Facades\DB;

class BudgetExpenseRepository implements BudgetExpenseRepositoryInnterface
{
    public function getAll(?string $search, ?string $limit, bool $execute)
    {
        $query = BudgetCategory::query();

        // Search filter
        if ($search) {
            $query->search($search);
        }

        // Limit
        if ($limit) {
            $query->take((int)$limit);
        }

        // Order by
        $query->orderBy('id', 'desc');

        // Eager loading jika diperlukan
        $query->with(['budget', 'category']);

        // Execute or return query builder
        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(?string $search, ?int $rowsPerPage)
    {
        return $this->getAll($search, null, false)
            ->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        $query = BudgetCategory::where('id', $id);
        return $query->first();
    }

    public function update(string $id, array $data)
    {
        DB::beginTransaction();

        try {
            $budgetExpense = $this->getById($id);

            if (!$budgetExpense) {
                throw new \Exception('Budget expense not found');
            }

            $budgetExpense->allocated_amount           = $data['allocated_amount'] ?? 0;
            $budgetExpense->spent_amount               = $data['spent_amount'] ?? null;
            $budgetExpense->spent_date                 = $data['spent_date'] ?? null;
            $budgetExpense->notes                      = $data['notes'] ?? null;


            $budgetExpense->save();

            DB::commit();

            return $budgetExpense;
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
}
