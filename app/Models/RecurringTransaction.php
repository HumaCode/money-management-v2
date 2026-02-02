<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecurringTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'currency_id',
        'amount',
        'type',
        'description',
        'frequency',
        'day_of_month',
        'day_of_week',
        'start_date',
        'end_date',
        'next_occurrence_date',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'day_of_month' => 'integer',
        'day_of_week' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_occurrence_date' => 'date',
        'is_active' => 'boolean',
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

    public function generatedTransactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    public function scopeDueToday($query)
    {
        return $query->where('next_occurrence_date', '<=', now()->toDateString())
                     ->where('is_active', true);
    }

    public function scopeFrequency($query, $frequency)
    {
        return $query->where('frequency', $frequency);
    }
}
