<?php

namespace App\Observers;

use App\Models\Account;
use App\Models\Transaction;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $amount = (float) $transaction->amount;

        // Source account (rekening asal)
        $account = Account::find($transaction->account_id);
        if ($account) {
            if ($transaction->type === 'income') {
                $account->balance = (float)$account->balance + $amount;
                $account->save();
            } elseif ($transaction->type === 'expense' || $transaction->type === 'transfer') {
                $account->balance = (float)$account->balance - $amount;
                $account->save();
            }
        }

        // Destination account (rekening tujuan jika transfer)
        if ($transaction->type === 'transfer' && $transaction->to_account_id) {
            $toAccount = Account::find($transaction->to_account_id);
            if ($toAccount) {
                $toAccount->balance = (float)$toAccount->balance + $amount;
                $toAccount->save();
            }
        }
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        if ($transaction->wasChanged(['account_id', 'to_account_id', 'amount', 'type'])) {
            $originalAccountId = $transaction->getOriginal('account_id');
            $originalToAccountId = $transaction->getOriginal('to_account_id');
            $originalAmount = (float) $transaction->getOriginal('amount');
            $originalType = $transaction->getOriginal('type');

            // 1. Revert original state
            $oldAccount = Account::find($originalAccountId);
            if ($oldAccount) {
                if ($originalType === 'income') {
                    $oldAccount->balance = (float)$oldAccount->balance - $originalAmount;
                    $oldAccount->save();
                } elseif ($originalType === 'expense' || $originalType === 'transfer') {
                    $oldAccount->balance = (float)$oldAccount->balance + $originalAmount;
                    $oldAccount->save();
                }
            }

            if ($originalType === 'transfer' && $originalToAccountId) {
                $oldToAccount = Account::find($originalToAccountId);
                if ($oldToAccount) {
                    $oldToAccount->balance = (float)$oldToAccount->balance - $originalAmount;
                    $oldToAccount->save();
                }
            }

            // 2. Apply new state
            $newAmount = (float) $transaction->amount;
            $newAccount = Account::find($transaction->account_id);
            if ($newAccount) {
                if ($transaction->type === 'income') {
                    $newAccount->balance = (float)$newAccount->balance + $newAmount;
                    $newAccount->save();
                } elseif ($transaction->type === 'expense' || $transaction->type === 'transfer') {
                    $newAccount->balance = (float)$newAccount->balance - $newAmount;
                    $newAccount->save();
                }
            }

            if ($transaction->type === 'transfer' && $transaction->to_account_id) {
                $newToAccount = Account::find($transaction->to_account_id);
                if ($newToAccount) {
                    $newToAccount->balance = (float)$newToAccount->balance + $newAmount;
                    $newToAccount->save();
                }
            }
        }
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $amount = (float) $transaction->amount;

        $account = Account::find($transaction->account_id);
        if ($account) {
            if ($transaction->type === 'income') {
                $account->balance = (float)$account->balance - $amount;
                $account->save();
            } elseif ($transaction->type === 'expense' || $transaction->type === 'transfer') {
                $account->balance = (float)$account->balance + $amount;
                $account->save();
            }
        }

        if ($transaction->type === 'transfer' && $transaction->to_account_id) {
            $toAccount = Account::find($transaction->to_account_id);
            if ($toAccount) {
                $toAccount->balance = (float)$toAccount->balance - $amount;
                $toAccount->save();
            }
        }
    }
}
