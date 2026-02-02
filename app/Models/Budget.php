<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'currency_id',
        'total_amount',
        'period',
        'start_date',
        'end_date',
        'is_active',
        'rollover_unused',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'rollover_unused' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function budgetCategories()
    {
        return $this->hasMany(BudgetCategory::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePeriod($query, $period)
    {
        return $query->where('period', $period);
    }

    public function scopeCurrent($query)
    {
        $today = now()->toDateString();
        return $query->where('start_date', '<=', $today)
                     ->where('end_date', '>=', $today);
    }

    // Accessors
    public function getTotalSpentAttribute()
    {
        return $this->budgetCategories->sum('spent_amount');
    }

    public function getRemainingAmountAttribute()
    {
        return $this->total_amount - $this->total_spent;
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->total_amount == 0) return 0;
        return ($this->total_spent / $this->total_amount) * 100;
    }
}
