<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * BudgetCategory adalah detail pengeluaran dari Budget
 * Seperti ledger/jurnal yang mencatat setiap transaksi
 * 
 * Contoh:
 * Budget: Makan Februari = Rp 1,000,000
 * BudgetCategories:
 *   - 7 Feb: Makan siang = Rp 200,000
 *   - 20 Feb: Makan malam = Rp 500,000
 *   Total Spent = Rp 700,000 (70%)
 */
class BudgetCategory extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false; // Tidak pakai created_at/updated_at

    protected $fillable = [
        'budget_id',
        'category_id',        // FK ke categories table (untuk grouping/filtering)
        'spent_amount',       // Jumlah yang dikeluarkan
        'allocated_amount',   // Jumlah yang dialokasikan (opsional)
        'spent_date',         // Tanggal pengeluaran (opsional)
        'notes',              // Catatan transaksi
    ];

    protected $casts = [
        'spent_amount' => 'decimal:2',
        'spent_date'   => 'date',
    ];

    protected $appends = [
        'spent_amount_formatted',
    ];

    /* =========================
     |  Relationships
     ========================= */
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /* =========================
     |  Accessors
     ========================= */
    protected function spentAmountFormatted(): Attribute
    {
        return Attribute::get(function () {
            $amount = (float) $this->spent_amount;
            $formatted = number_format($amount, 2, '.', ',');

            if ($this->relationLoaded('budget.currency') && $this->budget && $this->budget->currency) {
                return trim($this->budget->currency->symbol . ' ' . $formatted);
            }

            return $formatted;
        });
    }

    /* =========================
     |  Events (Auto-recalculate Budget)
     ========================= */
    
    protected static function booted()
    {
        // Setelah create, update total_spent budget
        static::created(function ($budgetCategory) {
            $budgetCategory->budget->recalculateSpent();
        });

        // Setelah update, recalculate
        static::updated(function ($budgetCategory) {
            $budgetCategory->budget->recalculateSpent();
        });

        // Setelah delete, recalculate
        static::deleted(function ($budgetCategory) {
            $budgetCategory->budget->recalculateSpent();
        });
    }
}