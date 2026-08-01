<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'url',
        'category',
        'icon',
        'is_active',
        'orders',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'orders'    => 'integer',
    ];

    /**
     * Scope a query to only include active menus.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Relationship with Spatie Permission Model
     */
    public function permissions()
    {
        return $this->belongsToMany(
            \App\Models\Shield\Permission::class,
            'menu_permissions',
            'menu_id',
            'permission_id'
        );
    }
}
