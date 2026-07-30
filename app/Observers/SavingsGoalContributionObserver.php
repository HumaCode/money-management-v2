<?php

namespace App\Observers;

use App\Models\SavingsGoalContribution;

class SavingsGoalContributionObserver
{
    /**
     * Handle the SavingsGoalContribution "created" event.
     */
    public function created(SavingsGoalContribution $contribution): void
    {
        $this->recalculateSavingsGoal($contribution);
    }

    /**
     * Handle the SavingsGoalContribution "updated" event.
     */
    public function updated(SavingsGoalContribution $contribution): void
    {
        $this->recalculateSavingsGoal($contribution);
    }

    /**
     * Handle the SavingsGoalContribution "deleted" event.
     */
    public function deleted(SavingsGoalContribution $contribution): void
    {
        $this->recalculateSavingsGoal($contribution);
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
