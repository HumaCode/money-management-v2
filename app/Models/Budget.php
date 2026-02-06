<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
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

    protected $appends = ['total_amount_formatted', 'date_range_formatted', 'progress_percentage_normalized', 'spent_amount_formatted'];

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

    protected function totalAmountFormatted(): Attribute
    {
        return Attribute::get(function () {
            $amount = (float) $this->total_amount;
            $formatted = number_format($amount, 2, '.', ',');

            if ($this->relationLoaded('currency') && $this->currency) {
                return trim($this->currency->symbol . ' ' . $formatted);
            }

            return $formatted;
        });
    }

    protected function dateRangeFormatted(): Attribute
    {
        return Attribute::get(function () {
            if (!$this->start_date || !$this->end_date) {
                return '-';
            }

            $start = Carbon::parse($this->start_date);
            $end   = Carbon::parse($this->end_date);

            // Tahun sama → Jan 1 - Jan 31, 2025
            if ($start->year === $end->year) {
                return sprintf(
                    '%s %d - %s %d, %d',
                    $start->format('M'),
                    $start->day,
                    $end->format('M'),
                    $end->day,
                    $start->year
                );
            }

            // Tahun beda → Jan 1, 2024 - Jan 31, 2025
            return sprintf(
                '%s %d, %d - %s %d, %d',
                $start->format('M'),
                $start->day,
                $start->year,
                $end->format('M'),
                $end->day,
                $end->year
            );
        });
    }

    protected function progressPercentageNormalized(): Attribute
    {
        return Attribute::get(function () {
            $value = (float) $this->progress_percentage;

            if (!is_numeric($value)) {
                return 0;
            }

            return max(0, min($value, 100));
        });
    }

    protected function spentAmountFormatted(): Attribute
    {
        return Attribute::get(function () {
            $amount = (float) $this->total_spent;
            $formatted = number_format($amount, 2, '.', ',');

            if ($this->relationLoaded('currency') && $this->currency) {
                return trim($this->currency->symbol . ' ' . $formatted);
            }

            return $formatted;
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%");
        });
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
