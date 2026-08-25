<?php

namespace App\Observers;

use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     * 1. Updates Account balance.
     * 2. Auto-syncs Expense transactions with active Budgets.
     */
    public function created(Transaction $transaction): void
    {
        $amount = (float) $transaction->amount;
        $type   = strtolower($transaction->type);

        // ── 1. Update Account Balance ─────────────────────────────
        if ($type === 'income') {
            DB::table('accounts')->where('id', $transaction->account_id)->increment('current_balance', $amount);
        } elseif ($type === 'expense' || $type === 'transfer') {
            DB::table('accounts')->where('id', $transaction->account_id)->decrement('current_balance', $amount);
        }

        if ($type === 'transfer' && $transaction->to_account_id) {
            DB::table('accounts')->where('id', $transaction->to_account_id)->increment('current_balance', $amount);
        }

        // ── 2. Auto-sync Expense Transaction to Active Budgets ────
        if ($type === 'expense') {
            $this->syncExpenseToBudgets($transaction);
        }
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        if ($transaction->wasChanged(['account_id', 'to_account_id', 'amount', 'type'])) {
            $originalAccountId   = $transaction->getOriginal('account_id');
            $originalToAccountId = $transaction->getOriginal('to_account_id');
            $originalAmount      = (float) $transaction->getOriginal('amount');
            $originalType        = strtolower($transaction->getOriginal('type'));

            // 1. Revert original source account balance
            if ($originalType === 'income') {
                DB::table('accounts')->where('id', $originalAccountId)->decrement('current_balance', $originalAmount);
            } elseif ($originalType === 'expense' || $originalType === 'transfer') {
                DB::table('accounts')->where('id', $originalAccountId)->increment('current_balance', $originalAmount);
            }

            if ($originalType === 'transfer' && $originalToAccountId) {
                DB::table('accounts')->where('id', $originalToAccountId)->decrement('current_balance', $originalAmount);
            }

            // 2. Apply new source account balance
            $newAmount = (float) $transaction->amount;
            $newType   = strtolower($transaction->type);

            if ($newType === 'income') {
                DB::table('accounts')->where('id', $transaction->account_id)->increment('current_balance', $newAmount);
            } elseif ($newType === 'expense' || $newType === 'transfer') {
                DB::table('accounts')->where('id', $transaction->account_id)->decrement('current_balance', $newAmount);
            }

            if ($newType === 'transfer' && $transaction->to_account_id) {
                DB::table('accounts')->where('id', $transaction->to_account_id)->increment('current_balance', $newAmount);
            }
        }

        // Auto-resync expense if amount, type, category_id, or transaction_date changed
        if ($transaction->wasChanged(['amount', 'type', 'category_id', 'transaction_date'])) {
            $this->removeExpenseFromBudgets($transaction);
            if (strtolower($transaction->type) === 'expense') {
                $this->syncExpenseToBudgets($transaction);
            }
        }
    }

    /**
     * Handle the Transaction "deleting" event.
     */
    public function deleting(Transaction $transaction): void
    {
        $amount = (float) $transaction->amount;
        $type   = strtolower($transaction->type);

        if ($type === 'income') {
            DB::table('accounts')->where('id', $transaction->account_id)->decrement('current_balance', $amount);
        } elseif ($type === 'expense' || $type === 'transfer') {
            DB::table('accounts')->where('id', $transaction->account_id)->increment('current_balance', $amount);
        }

        if ($type === 'transfer' && $transaction->to_account_id) {
            DB::table('accounts')->where('id', $transaction->to_account_id)->decrement('current_balance', $amount);
        }

        // Revert budget expenses when transaction is deleted
        if ($type === 'expense') {
            $this->removeExpenseFromBudgets($transaction);
        }
    }

    /**
     * Handle the Transaction "forceDeleted" event.
     */
    public function forceDeleted(Transaction $transaction): void
    {
        $this->removeExpenseFromBudgets($transaction);
    }

    /**
     * Helper: Sync an Expense transaction to matching active Budgets
     */
    private function syncExpenseToBudgets(Transaction $transaction): void
    {
        $userId = $transaction->user_id;
        $txDate = $transaction->transaction_date ? $transaction->transaction_date->format('Y-m-d') : date('Y-m-d');

        // Find active budgets for this user
        $budgets = Budget::where('user_id', $userId)
            ->where('is_active', true)
            ->get();

        foreach ($budgets as $budget) {
            // Check if transaction_date falls within budget's date range (if set)
            if ($budget->start_date && $txDate < $budget->start_date->format('Y-m-d')) {
                continue;
            }
            if ($budget->end_date && $txDate > $budget->end_date->format('Y-m-d')) {
                continue;
            }

            // Create BudgetCategory ledger record linked to this transaction
            BudgetCategory::create([
                'budget_id'      => $budget->id,
                'category_id'    => $transaction->category_id,
                'transaction_id' => $transaction->id,
                'spent_amount'   => (float) $transaction->amount,
                'allocated_amount' => 0,
                'spent_date'     => $txDate,
                'notes'          => $transaction->description ?? $transaction->notes,
            ]);
            // Note: BudgetCategory created event automatically calls $budget->recalculateSpent()
        }
    }

    /**
     * Helper: Remove expense linked to a transaction from Budgets
     */
    private function removeExpenseFromBudgets(Transaction $transaction): void
    {
        $linkedCategories = BudgetCategory::where('transaction_id', $transaction->id)->get();
        foreach ($linkedCategories as $bc) {
            $budget = $bc->budget;
            $bc->delete(); // Automatically triggers $budget->recalculateSpent()
        }
    }
}
