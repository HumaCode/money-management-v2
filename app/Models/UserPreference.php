<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPreference extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'default_currency_id',
        'fiscal_year_start_month',
        'theme',
        'language',
        'date_format',
        'number_format',
        'notification_email',
        'notification_push',
    ];

    protected $casts = [
        'fiscal_year_start_month' => 'integer',
        'notification_email' => 'boolean',
        'notification_push' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function defaultCurrency()
    {
        return $this->belongsTo(Currency::class, 'default_currency_id');
    }
}
