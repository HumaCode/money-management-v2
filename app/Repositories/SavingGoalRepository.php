<?php

namespace App\Repositories;

use App\Constants\GlobalMessage;
use App\Interface\SavingGoalRepositoryInterface;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\DB;

class SavingGoalRepository implements SavingGoalRepositoryInterface
{
    public function getAll(?string $search, ?string $status, ?string $limit, bool $execute)
    {
        $query = SavingsGoal::query();

        // Scope to current user
        if (function_exists('user') && user('id')) {
            $query->where('user_id', user('id'));
        }

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

    public function getAllPaginated(?string $search, ?string $status,  ?int $rowsPerPage)
    {
        return $this->getAll($search, $status, null, false)
            ->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        return SavingsGoal::where('id', $id)->first();
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
            $saving->target_date        = $data['target_date'];
            $saving->status             = 'active';
            $saving->icon               = $data['icon'] ?? '🎯';
            $saving->color              = $data['color'] ?? '#7dd3a8';

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
                throw new \Exception('Saving Goal not found');
            }

            $saving->account_id         = $data['account_id'];
            $saving->currency_id        = $data['currency_id'];
            $saving->name               = $data['name'];
            $saving->description        = $data['description'] ?? null;
            $saving->target_amount      = $data['target_amount'];
            $saving->current_amount     = $data['current_amount'] ?? 0;
            $saving->monthly_target     = $data['monthly_target'] ?? null;
            $saving->target_date        = $data['target_date'];
            $saving->status             = $data['status'] ?? $saving->status;
            $saving->icon               = $data['icon'] ?? $saving->icon;
            $saving->color              = $data['color'] ?? $saving->color;

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

    public function addDeposit(string $id, array $data)
    {
        DB::beginTransaction();

        try {
            $saving = SavingsGoal::findOrFail($id);
            $amount = (float) $data['amount'];

            // 1. Simpan kontribusi baru (akan secara otomatis mentrigger SavingsGoalContributionObserver)
            $saving->contributions()->create([
                'amount'         => $amount,
                'notes'          => $data['notes'] ?? null,
                'contributed_at' => $data['contributed_at'] ?? now(),
            ]);

            DB::commit();

            return $saving->fresh(['currency', 'account']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Gagal menambahkan setor tabungan: ' . $e->getMessage());
        }
    }

    public function getAccountList()
    {
        return Account::select('name', 'icon', 'id')
            ->orderBy('name', 'asc')
            ->get()
            ->toArray();
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
