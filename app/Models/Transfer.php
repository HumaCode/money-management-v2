<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'from_account_id',
        'to_account_id',
        'amount',
        'from_currency_id',
        'to_currency_id',
        'exchange_rate',
        'fee',
        'notes',
        'transfer_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'fee' => 'decimal:2',
        'transfer_date' => 'date',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fromAccount()
    {
        return $this->belongsTo(Account::class, 'from_account_id');
    }

    public function toAccount()
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }

    public function fromCurrency()
    {
        return $this->belongsTo(Currency::class, 'from_currency_id');
    }

    public function toCurrency()
    {
        return $this->belongsTo(Currency::class, 'to_currency_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Scopes
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transfer_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getTotalAmountAttribute()
    {
        return $this->amount + $this->fee;
    }
}
