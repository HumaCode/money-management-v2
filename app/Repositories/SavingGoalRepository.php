<?php

namespace App\Repositories;

use App\Constants\GlobalMessage;
use App\Interface\SavingGoalRepositoryInterface;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Currency;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\DB;

class SavingGoalRepository implements SavingGoalRepositoryInterface
{
    public function getAll(?string $search, ?string $status, ?string $limit, bool $execute)
    {
        $query = SavingsGoal::query();

        // Search filter
        if ($search) {
            $query->search($search);
        }

        // Status filter
        if ($status && $status !== 'all') {
            if ($status === 'active') {
                $query->active();
            } elseif ($status === 'completed') {
                $query->completed();
            } elseif ($status === 'paused') {
                $query->paused();
            } elseif ($status === 'cancelled') {
                $query->cancelled();
            }
        }


        // Limit
        if ($limit) {
            $query->take((int)$limit);
        }

        // Order by
        $query->orderBy('id', 'desc');

        // Eager loading jika diperlukan
        $query->with(['currency', 'account']);

        // Execute or return query builder
        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(?string $search, ?string $status,  ?int $rowsPerPage)
    {
        return $this->getAll($search, $status, null, false)
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

            $saving = new Budget();

            $saving->user_id            = user('id');
            $saving->account_id         = $data['account_id'];
            $saving->currency_id        = $data['currency_id'];
            $saving->name               = $data['name'];
            $saving->description        = $data['description'];
            $saving->target_amount      = $data['target_amount'];
            $saving->current_amount     = $data['current_amount'];
            $saving->monthly_target     = $data['monthly_target'];
            $saving->target_date        = $data['target_date'];
            $saving->status             = '1';
            $saving->icon               = $data['icon'];
            $saving->color              = $data['color'];


            $saving->save();

            DB::commit();

            return $saving;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception(GlobalMessage::ERROR_CREATING . $e->getMessage());
        }
    }

    public function update(string $id, array $data)
    {
        DB::beginTransaction();

        try {
            $saving = $this->getById($id);

            if (!$saving) {
                throw new \Exception('Budget not found');
            }

            $saving->account_id         = $data['account_id'];
            $saving->currency_id        = $data['currency_id'];
            $saving->name               = $data['name'];
            $saving->description        = $data['description'];
            $saving->target_amount      = $data['target_amount'];
            $saving->current_amount     = $data['current_amount'];
            $saving->monthly_target     = $data['monthly_target'];
            $saving->target_date        = $data['target_date'];
            $saving->status             = $data['status'];
            $saving->icon               = $data['icon'];
            $saving->color              = $data['color'];


            $saving->save();

            DB::commit();

            return $saving;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception(GlobalMessage::ERROR_UPDATING . $e->getMessage());
        }
    }

    public function delete(string $id)
    {
        $saving = $this->getById($id);

        if (!$saving) {
            return false;
        }

        return $saving->delete();
    }

    public function budgetExpenses(string $id, array $data): Budget
    {
        return DB::transaction(function () use ($id, $data) {

            $budget = Budget::with('budgetCategories')->findOrFail($id);

            // 1️⃣ Tambah record baru (ledger)
            $budget->budgetCategories()->create([
                'category_id'  => $data['category_id'],
                'allocated_amount' => $data['allocated_amount'],
                'spent_amount' => $data['spent_amount'],
                'spent_date'   => $data['spent_date'] ?? now(),
                'notes'        => $data['notes'] ?? null,
            ]);

            // 2️⃣ Hitung ulang agregat
            $totalSpent = $budget->budgetCategories()->sum('spent_amount');

            $progress = $budget->total_amount > 0
                ? ($totalSpent / $budget->total_amount) * 100
                : 0;

            // 3️⃣ Simpan hasil ke budget
            $budget->forceFill([
                'total_spent'         => $totalSpent,
                'progress_percentage' => round($progress, 2),
            ])->save();

            return $budget->fresh(['currency', 'budgetCategories.category']);
        });
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

    public function getCategoryList()
    {
        // Assuming there's a Category model
        return Category::select('name', 'icon', 'id')
            ->distinct()
            ->where('type', 'expense')
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }
}
