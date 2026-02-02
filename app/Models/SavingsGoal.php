<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingsGoal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'account_id',
        'currency_id',
        'name',
        'description',
        'target_amount',
        'current_amount',
        'monthly_target',
        'target_date',
        'status',
        'icon',
        'color',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'monthly_target' => 'decimal:2',
        'target_date' => 'date',
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

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function contributions()
    {
        return $this->hasMany(SavingsGoalContribution::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePaused($query)
    {
        return $query->where('status', 'paused');
    }

    // Accessors
    public function getRemainingAmountAttribute()
    {
        return max(0, $this->target_amount - $this->current_amount);
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->target_amount == 0) return 0;
        return min(100, ($this->current_amount / $this->target_amount) * 100);
    }

    public function getIsCompletedAttribute()
    {
        return $this->current_amount >= $this->target_amount;
    }
}
