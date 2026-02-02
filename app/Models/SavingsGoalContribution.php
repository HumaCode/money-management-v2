<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingsGoalContribution extends Model
{
    use HasFactory, HasUuids;

    const CREATED_AT = 'contributed_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'savings_goal_id',
        'transaction_id',
        'amount',
        'notes',
        'contributed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'contributed_at' => 'datetime',
    ];

    // Relationships
    public function savingsGoal()
    {
        return $this->belongsTo(SavingsGoal::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
