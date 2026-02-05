<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'user_id',
        'account_type_id',
        'currency_id',
        'name',
        'institution_name',
        'account_number',
        'balance',
        'credit_limit',
        'is_active',
        'is_default',
        'notes',
    ];

    protected $appends = ['masked_account_number', 'balance_formatted'];
    
    protected $casts = [
        'balance'       => 'decimal:2',
        'credit_limit'  => 'decimal:2',
        'is_active'     => 'boolean',
        'is_default'    => 'boolean',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
    
    protected function maskedAccountNumber(): Attribute
    {
        return Attribute::get(function () {
            if (!$this->account_number) {
                return null;
            }

            $last = substr($this->account_number, -4);

            return '**** **** ' . $last;
        });
    }

    protected function balanceFormatted(): Attribute
    {
        return Attribute::get(function () {
            $amount = (float) $this->balance;
            $formatted = number_format($amount, 2, '.', ',');

            if ($this->relationLoaded('currency') && $this->currency) {
                return trim($this->currency->symbol . ' ' . $formatted);
            }

            return $formatted;
        });
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%");
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function accountType()
    {
        return $this->belongsTo(AccountType::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function transfersFrom()
    {
        return $this->hasMany(Transfer::class, 'from_account_id');
    }

    public function transfersTo()
    {
        return $this->hasMany(Transfer::class, 'to_account_id');
    }

    public function savingsGoals()
    {
        return $this->hasMany(SavingsGoal::class);
    }

    public function recurringTransactions()
    {
        return $this->hasMany(RecurringTransaction::class);
    }
}
