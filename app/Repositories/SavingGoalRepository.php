<?php

namespace App\Repositories;

use App\Constants\GlobalMessage;
use App\Interface\SavingGoalRepositoryInterface;
use App\Models\SavingsGoal;
use App\Models\Account;
use App\Models\Currency;
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

        // Eager loading
        $query->with(['currency', 'account']);

        // Execute or return query builder
        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(?string $search, ?string $status, ?int $rowsPerPage)
    {
        return $this->getAll($search, $status, null, false)
            ->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        return SavingsGoal::with(['currency', 'account'])->where('id', $id)->first();
    }

    public function create(array $data)
    {
        DB::beginTransaction();
        try {
            $saving = new SavingsGoal();
            $saving->user_id            = user('id');
            $saving->account_id         = $data['account_id'];
            $saving->currency_id        = $data['currency_id'];
            $saving->name               = $data['name'];
            $saving->description        = $data['description'] ?? null;
            $saving->target_amount      = $data['target_amount'];
            $saving->current_amount     = $data['current_amount'] ?? 0;
            $saving->monthly_target     = $data['monthly_target'] ?? null;
            $saving->target_date        = $data['target_date'] ?? null;
            $saving->status             = $data['status'] ?? 'active';
            $saving->icon               = $data['icon'] ?? '🎯';
            $saving->color              = $data['color'] ?? '#10B981';
            $saving->save();

            DB::commit();
            $saving->load(['currency', 'account']);
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
                throw new \Exception('Savings Goal not found');
            }

            $saving->account_id         = $data['account_id'];
            $saving->currency_id        = $data['currency_id'];
            $saving->name               = $data['name'];
            $saving->description        = $data['description'] ?? null;
            $saving->target_amount      = $data['target_amount'];
            $saving->current_amount     = $data['current_amount'] ?? 0;
            $saving->monthly_target     = $data['monthly_target'] ?? null;
            $saving->target_date        = $data['target_date'] ?? null;
            $saving->status             = $data['status'] ?? 'active';
            $saving->icon               = $data['icon'] ?? '🎯';
            $saving->color              = $data['color'] ?? '#10B981';
            $saving->save();

            DB::commit();
            $saving->load(['currency', 'account']);
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

    public function getAccountList(): array
    {
        return Account::select('name', 'id')
            ->distinct()
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }

    public function getCurrencyList(): array
    {
        return Currency::select('name', 'code', 'id')
            ->distinct()
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
    }

    public function addSaving(string $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $saving = SavingsGoal::findOrFail($id);

            // 1. Create contribution record
            $saving->contributions()->create([
                'amount'         => $data['amount'],
                'notes'          => $data['notes'] ?? null,
                'contributed_at' => $data['contributed_at'] ?? now(),
            ]);

            // 2. Recalculate current_amount
            $totalSaved = (float) $saving->contributions()->sum('amount');
            $saving->current_amount = $totalSaved;

            // 3. Update status automatically if target is met
            if ($saving->current_amount >= $saving->target_amount) {
                $saving->status = 'completed';
            }
            $saving->save();

            $saving->load(['currency', 'account']);
            return $saving;
        });
    }
}
