<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\SavingsGoal;
use App\Models\SavingsGoalContribution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MobileSavingsGoalController extends Controller
{
    /**
     * Get Savings Goals List
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $goals = SavingsGoal::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return ResponseHelper::success($goals, 'Daftar target tabungan');
    }

    /**
     * Create New Savings Goal
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validator = Validator::make($request->all(), [
            'name'          => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'target_date'   => 'nullable|date',
            'color'         => 'nullable|string|max:50',
            'icon'          => 'nullable|string|max:50',
            'notes'         => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error('Validasi gagal', 422, $validator->errors());
        }

        $goal = SavingsGoal::create([
            'user_id'        => $userId,
            'name'           => $request->name,
            'target_amount'  => $request->target_amount,
            'current_amount' => 0,
            'target_date'    => $request->target_date,
            'status'         => 'in_progress',
            'color'          => $request->color ?? '#10b981',
            'icon'           => $request->icon ?? 'award',
            'notes'          => $request->notes,
        ]);

        return ResponseHelper::success($goal, 'Target tabungan berhasil dibuat', 201);
    }

    /**
     * Add Contribution Deposit to Savings Goal
     */
    public function addSaving(Request $request, $id)
    {
        $userId = $request->user()->id;

        $goal = SavingsGoal::where('user_id', $userId)->where('id', $id)->first();
        if (!$goal) {
            return ResponseHelper::error('Target tabungan tidak ditemukan', 404);
        }

        $validator = Validator::make($request->all(), [
            'amount'         => 'required|numeric|min:1',
            'contributed_at' => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error('Validasi gagal', 422, $validator->errors());
        }

        DB::beginTransaction();
        try {
            $amount = $request->amount;
            $contributedAt = $request->input('contributed_at', now());

            // Create contribution record
            $contribution = SavingsGoalContribution::create([
                'savings_goal_id' => $goal->id,
                'amount'          => $amount,
                'contributed_at'  => $contributedAt,
                'notes'           => $request->notes,
            ]);

            // Update goal current amount & status
            $newCurrent = (float) $goal->current_amount + (float) $amount;
            $status = $newCurrent >= (float) $goal->target_amount ? 'completed' : 'in_progress';

            $goal->update([
                'current_amount' => $newCurrent,
                'status'         => $status,
            ]);

            DB::commit();

            return ResponseHelper::success([
                'goal'         => $goal->fresh(),
                'contribution' => $contribution,
            ], 'Setoran tabungan berhasil dicatat');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error('Gagal mencatat setoran: ' . $e->getMessage(), 500);
        }
    }
}
