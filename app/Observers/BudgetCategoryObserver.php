<?php

namespace App\Observers;

use App\Models\BudgetCategory;

class BudgetCategoryObserver
{
     /**
     * Handle the BudgetCategory "created" event.
     */
    public function created(BudgetCategory $budgetCategory): void
    {
        $this->recalculateBudget($budgetCategory);
    }

    /**
     * Handle the BudgetCategory "updated" event.
     */
    public function updated(BudgetCategory $budgetCategory): void
    {
        $this->recalculateBudget($budgetCategory);
    }

    /**
     * Handle the BudgetCategory "deleted" event.
     */
    public function deleted(BudgetCategory $budgetCategory): void
    {
        $this->recalculateBudget($budgetCategory);
    }

    /**
     * Recalculate budget spent and progress
     */
    private function recalculateBudget(BudgetCategory $budgetCategory): void
    {
        if ($budgetCategory->budget) {
            $budgetCategory->budget->recalculateSpent();
        }
    }
}
