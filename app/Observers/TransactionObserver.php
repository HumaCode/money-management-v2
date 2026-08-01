<?php

namespace App\Observers;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     * Uses atomic DB::table increment/decrement to avoid stale-read race conditions.
     */
    public function created(Transaction $transaction): void
    {
        $amount = (float) $transaction->amount;
        $type   = strtolower($transaction->type);

        if ($type === 'income') {
            DB::table('accounts')->where('id', $transaction->account_id)->increment('current_balance', $amount);
        } elseif ($type === 'expense' || $type === 'transfer') {
            DB::table('accounts')->where('id', $transaction->account_id)->decrement('current_balance', $amount);
        }

        if ($type === 'transfer' && $transaction->to_account_id) {
            DB::table('accounts')->where('id', $transaction->to_account_id)->increment('current_balance', $amount);
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
    }

    /**
     * Handle the Transaction "deleting" event.
     *
     * IMPORTANT: Must use "deleting" (not "deleted") because the Transaction model
     * uses SoftDeletes. The "deleted" event fires AFTER the soft-delete timestamp is set,
     * but "deleting" fires BEFORE — allowing us to safely revert the balance.
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
    }

    /**
     * Handle the Transaction "forceDeleted" event (hard delete after soft delete).
     * Balance was already reverted in deleting() event — no additional action needed.
     */
    public function forceDeleted(Transaction $transaction): void
    {
        // No-op: balance already reverted when soft delete occurred (deleting event).
    }
}
