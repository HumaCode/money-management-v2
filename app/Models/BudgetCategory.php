<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetCategory extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'budget_id',
        'category_id',
        'allocated_amount',
        'spent_amount',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
        'spent_amount' => 'decimal:2',
    ];

    // Relationships
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Accessors
    public function getRemainingAmountAttribute()
    {
        return $this->allocated_amount - $this->spent_amount;
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->allocated_amount == 0) return 0;
        return ($this->spent_amount / $this->allocated_amount) * 100;
    }

    public function getIsOverBudgetAttribute()
    {
        return $this->spent_amount > $this->allocated_amount;
    }
}
