<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SavingsGoal\AddSavingRequest;
use App\Http\Requests\Api\SavingsGoal\StoreSavingsGoalRequest;
use App\Models\Currency;
use App\Models\SavingsGoal;
use App\Models\SavingsGoalContribution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MobileSavingsGoalController extends Controller
{
    /**
     * Get Savings Goals List
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $goals = SavingsGoal::with(['account:id,name', 'currency:id,code,symbol'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($goal) {
                return $this->formatGoalData($goal);
            });

        return ResponseHelper::success($goals, 'Daftar target tabungan');
    }

    /**
     * Get Detail of a Single Savings Goal
     */
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;
        $goal = SavingsGoal::with(['account:id,name', 'currency:id,code,symbol', 'contributions'])
            ->where('user_id', $userId)
            ->where('id', $id)
            ->first();

        if (!$goal) {
            return ResponseHelper::notFound('Target tabungan tidak ditemukan');
        }

        return ResponseHelper::success($this->formatGoalData($goal, true), 'Detail target tabungan');
    }

    /**
     * Create New Savings Goal
     */
    public function store(StoreSavingsGoalRequest $request)
    {
        $userId = $request->user()->id;

        $targetAmount  = (float) $request->target_amount;
        $currentAmount = (float) ($request->current_amount ?? 0);
        $status        = $currentAmount >= $targetAmount && $targetAmount > 0 ? 'completed' : 'active';

        $goal = SavingsGoal::create([
            'user_id'        => $userId,
            'account_id'     => $request->account_id,
            'currency_id'    => $request->currency_id,
            'name'           => $request->name,
            'description'    => $request->description ?? $request->notes,
            'target_amount'  => $targetAmount,
            'current_amount' => $currentAmount,
            'monthly_target' => $request->monthly_target ? (float) $request->monthly_target : null,
            'target_date'    => $request->target_date,
            'status'         => $status,
            'color'          => $request->color ?? '#10b981',
            'icon'           => $request->icon ?? '🎯',
        ]);

        $goal->load(['account:id,name', 'currency:id,code,symbol']);

        return ResponseHelper::success($this->formatGoalData($goal), 'Target tabungan berhasil dibuat', 201);
    }

    /**
     * Update Savings Goal
     */
    public function update(Request $request, $id)
    {
        $userId = $request->user()->id;
        $goal = SavingsGoal::where('user_id', $userId)->where('id', $id)->first();

        if (!$goal) {
            return ResponseHelper::notFound('Target tabungan tidak ditemukan');
        }

        $validated = $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'account_id'     => 'nullable|string|exists:accounts,id',
            'currency_id'    => 'nullable|string|exists:currencies,id',
            'target_amount'  => 'sometimes|required|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'monthly_target' => 'nullable|numeric|min:0',
            'target_date'    => 'nullable|date',
            'color'          => 'nullable|string|max:50',
            'icon'           => 'nullable|string|max:50',
            'description'    => 'nullable|string',
            'status'         => 'nullable|string|in:active,completed,paused,cancelled',
        ]);

        if (isset($validated['target_amount']) || isset($validated['current_amount'])) {
            $target  = (float) ($validated['target_amount'] ?? $goal->target_amount);
            $current = (float) ($validated['current_amount'] ?? $goal->current_amount);
            if (!isset($validated['status'])) {
                $validated['status'] = $current >= $target && $target > 0 ? 'completed' : 'active';
            }
        }

        $goal->update($validated);
        $goal->load(['account:id,name', 'currency:id,code,symbol']);

        return ResponseHelper::success($this->formatGoalData($goal), 'Target tabungan berhasil diperbarui');
    }

    /**
     * Delete Savings Goal
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;
        $goal = SavingsGoal::where('user_id', $userId)->where('id', $id)->first();

        if (!$goal) {
            return ResponseHelper::notFound('Target tabungan tidak ditemukan');
        }

        $goal->delete();

        return ResponseHelper::success(null, 'Target tabungan berhasil dihapus');
    }

    /**
     * Add Contribution / Deposit to Savings Goal
     */
    public function addSaving(AddSavingRequest $request, $id)
    {
        $userId = $request->user()->id;

        $goal = SavingsGoal::where('user_id', $userId)->where('id', $id)->first();
        if (!$goal) {
            return ResponseHelper::notFound('Target tabungan tidak ditemukan');
        }

        DB::beginTransaction();
        try {
            $amount        = (float) $request->amount;
            $contributedAt = $request->input('contributed_at', now());

            // Create contribution record
            $contribution = SavingsGoalContribution::create([
                'savings_goal_id' => $goal->id,
                'amount'          => $amount,
                'contributed_at'  => $contributedAt,
                'notes'           => $request->notes,
            ]);

            // Update goal current amount & status
            $newCurrent = (float) $goal->current_amount + $amount;
            $status     = $newCurrent >= (float) $goal->target_amount ? 'completed' : 'active';

            $goal->update([
                'current_amount' => $newCurrent,
                'status'         => $status,
            ]);

            DB::commit();

            $goal->load(['account:id,name', 'currency:id,code,symbol']);

            return ResponseHelper::success([
                'goal'         => $this->formatGoalData($goal),
                'contribution' => $contribution,
            ], 'Setoran tabungan berhasil dicatat');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error('Gagal mencatat setoran: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Currencies for Dropdown Selection
     */
    public function currencies()
    {
        $currencies = Currency::where('is_active', true)->get(['id', 'code', 'name', 'symbol']);
        return ResponseHelper::success($currencies, 'Daftar mata uang');
    }

    /**
     * Helper to Format Savings Goal Data
     */
    private function formatGoalData(SavingsGoal $goal, bool $withContributions = false): array
    {
        $target  = (float) $goal->target_amount;
        $current = (float) $goal->current_amount;
        $progress = $target > 0 ? min(100, round(($current / $target) * 100, 2)) : 0;
        $remaining = max(0, $target - $current);

        $data = [
            'id'                  => $goal->id,
            'name'                => $goal->name,
            'description'         => $goal->description,
            'account_id'          => $goal->account_id,
            'account_name'        => $goal->account ? $goal->account->name : null,
            'currency_id'         => $goal->currency_id,
            'currency_code'       => $goal->currency ? $goal->currency->code : 'IDR',
            'currency_symbol'     => $goal->currency ? $goal->currency->symbol : 'Rp',
            'target_amount'       => $target,
            'current_amount'      => $current,
            'remaining_amount'    => $remaining,
            'monthly_target'      => $goal->monthly_target ? (float) $goal->monthly_target : null,
            'progress_percentage' => $progress,
            'target_date'         => $goal->target_date ? $goal->target_date->format('Y-m-d') : null,
            'status'              => $goal->status,
            'icon'                => $goal->icon ?? '🎯',
            'color'               => $goal->color ?? '#10b981',
            'created_at'          => $goal->created_at ? $goal->created_at->toIso8601String() : null,
            'updated_at'          => $goal->updated_at ? $goal->updated_at->toIso8601String() : null,
        ];

        if ($withContributions) {
            $data['contributions'] = $goal->contributions;
        }

        return $data;
    }
}
