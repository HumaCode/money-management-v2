<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'format',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function savingsGoals()
    {
        return $this->hasMany(SavingsGoal::class);
    }

    public function recurringTransactions()
    {
        return $this->hasMany(RecurringTransaction::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
