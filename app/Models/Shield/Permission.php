<?php

namespace App\Models\Shield;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Permission as ModelsPermission;

class Permission extends ModelsPermission
{
    use HasUuids;

    protected $fillable = ['name', 'guard_name', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relationship with Menu Model
     */
    public function menus()
    {
        return $this->belongsToMany(
            \App\Models\Menu::class,
            'menu_permissions',
            'permission_id',
            'menu_id'
        );
    }
}
