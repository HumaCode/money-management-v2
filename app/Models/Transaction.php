<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'currency_id',
        'amount',
        'type',
        'description',
        'notes',
        'transaction_date',
        'reference_number',
        'receipt_path',
        'transfer_id',
        'is_recurring',
        'recurring_transaction_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
        'is_recurring' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }

    public function recurringTransaction()
    {
        return $this->belongsTo(RecurringTransaction::class);
    }

    public function savingsGoalContributions()
    {
        return $this->hasMany(SavingsGoalContribution::class);
    }

    // Scopes
    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    public function scopeTransfer($query)
    {
        return $query->where('type', 'transfer');
    }

    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }
}
