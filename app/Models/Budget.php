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
        'total_spent',
        'progress_percentage',
        'period',
        'start_date',
        'end_date',
        'is_active',
        'rollover_unused',
        'notes',
    ];

    protected $casts = [
        'total_amount'        => 'decimal:2',
        'total_spent'         => 'decimal:2',
        'progress_percentage' => 'decimal:2',
        'start_date'          => 'date',
        'end_date'            => 'date',
        'is_active'           => 'boolean',
        'rollover_unused'     => 'boolean',
    ];

    protected $appends = [
        'total_amount_formatted',
        'spent_amount_formatted',
        'remaining_amount',
        'remaining_amount_formatted',
        'date_range_formatted',
        'progress_percentage_normalized',
        'status',
    ];

    /* =========================
     |  Relationships
     ========================= */
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

    /* =========================
     |  Accessors (READ ONLY)
     ========================= */

    protected function totalAmountFormatted(): Attribute
    {
        return Attribute::get(fn() => $this->formatCurrency($this->total_amount));
    }

    protected function spentAmountFormatted(): Attribute
    {
        return Attribute::get(fn() => $this->formatCurrency($this->total_spent));
    }

    protected function remainingAmount(): Attribute
    {
        return Attribute::get(fn() => $this->total_amount - $this->total_spent);
    }

    protected function remainingAmountFormatted(): Attribute
    {
        return Attribute::get(fn() => $this->formatCurrency($this->remaining_amount));
    }

    protected function progressPercentageNormalized(): Attribute
    {
        return Attribute::get(
            fn() => max(0, min((float) $this->progress_percentage, 100))
        );
    }

    protected function status(): Attribute
    {
        return Attribute::get(function () {
            $percentage = (float) $this->progress_percentage;
            
            if ($percentage >= 100) {
                return 'over_budget';
            } elseif ($percentage >= 80) {
                return 'near_limit';
            } else {
                return 'on_track';
            }
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

    /* =========================
     |  Helpers
     ========================= */
    private function formatCurrency($amount): string
    {
        $amount = (float) $amount;
        $formatted = number_format($amount, 2, '.', ',');

        if ($this->relationLoaded('currency') && $this->currency) {
            return trim($this->currency->symbol . ' ' . $formatted);
        }

        return $formatted;
    }

    /**
     * Recalculate total_spent and progress_percentage
     * Call this after adding, updating, or deleting budget categories
     */
    public function recalculateSpent(): void
    {
        $totalSpent = $this->budgetCategories()->sum('spent_amount');
        
        $progress = $this->total_amount > 0
            ? ($totalSpent / $this->total_amount) * 100
            : 0;

        $this->forceFill([
            'total_spent'         => $totalSpent,
            'progress_percentage' => round($progress, 2),
        ])->save();
    }

    /* =========================
     |  Scopes
     ========================= */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%");
    }

    public function scopePeriod($query, $period)
    {
        return $query->where('period', $period);
    }

    public function scopeOverBudget($query)
    {
        return $query->where('progress_percentage', '>', 100);
    }

    public function scopeNearLimit($query)
    {
        return $query->whereBetween('progress_percentage', [80, 100]);
    }

    public function scopeOnTrack($query)
    {
        return $query->where('progress_percentage', '<', 80);
    }
}