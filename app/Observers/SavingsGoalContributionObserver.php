<?php

namespace App\Observers;

use App\Models\SavingsGoalContribution;
use Illuminate\Support\Facades\DB;

class SavingsGoalContributionObserver
{
    /**
     * Handle the SavingsGoalContribution "created" event.
     */
    public function created(SavingsGoalContribution $contribution): void
    {
        $this->recalculateSavingsGoal($contribution);

        // Target account balance adjustment is managed via TransactionObserver during transfer creation.
        // Recalculating savings goal state is done below:
        $goal = $contribution->savingsGoal;
    }

    /**
     * Handle the SavingsGoalContribution "updated" event.
     */
    public function updated(SavingsGoalContribution $contribution): void
    {
        $this->recalculateSavingsGoal($contribution);

        if ($contribution->wasChanged('amount')) {
            $oldAmount = (float) $contribution->getOriginal('amount');
            $newAmount = (float) $contribution->amount;
            $diff      = $newAmount - $oldAmount;

            $tx = $contribution->transaction;
            if (!$tx && $contribution->savings_goal_id) {
                $goal = $contribution->savingsGoal;
                if ($goal) {
                    $tx = \App\Models\Transaction::where('to_account_id', $goal->account_id)
                        ->where('type', 'transfer')
                        ->where('description', 'like', '%' . $goal->name . '%')
                        ->orderBy('created_at', 'desc')
                        ->first();
                }
            }

            if ($tx) {
                // Updating $tx triggers TransactionObserver::updated, which automatically adjusts BOTH BRI & BCA!
                $tx->update(['amount' => $newAmount]);
            } else if ($contribution->savingsGoal && $contribution->savingsGoal->account_id) {
                if ($diff > 0) {
                    DB::table('accounts')->where('id', $contribution->savingsGoal->account_id)->increment('current_balance', $diff);
                } elseif ($diff < 0) {
                    DB::table('accounts')->where('id', $contribution->savingsGoal->account_id)->decrement('current_balance', abs($diff));
                }
            }
        }
    }

    /**
     * Handle the SavingsGoalContribution "deleted" event.
     */
    public function deleted(SavingsGoalContribution $contribution): void
    {
        $this->recalculateSavingsGoal($contribution);

        $tx = $contribution->transaction;
        if (!$tx && $contribution->savings_goal_id) {
            $goal = $contribution->savingsGoal;
            if ($goal) {
                $tx = \App\Models\Transaction::where('to_account_id', $goal->account_id)
                    ->where('type', 'transfer')
                    ->where('description', 'like', '%' . $goal->name . '%')
                    ->orderBy('created_at', 'desc')
                    ->first();
            }
        }

        if ($tx) {
            // Deleting $tx triggers TransactionObserver::deleting, which automatically reverts BOTH BRI & BCA balances and deletes the transaction record!
            $tx->delete();
        } else if ($contribution->savingsGoal && $contribution->savingsGoal->account_id) {
            DB::table('accounts')->where('id', $contribution->savingsGoal->account_id)->decrement('current_balance', (float) $contribution->amount);
        }
    }

    /**
     * Recalculate Savings Goal current amount and status
     */
    private function recalculateSavingsGoal(SavingsGoalContribution $contribution): void
    {
        if ($contribution->savingsGoal) {
            $contribution->savingsGoal->recalculateProgress();
        }
    }
}
