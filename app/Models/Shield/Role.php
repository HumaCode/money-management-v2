<?php

namespace App\Models\Shield;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Role as ModelsRole;

class Role extends ModelsRole
{
     use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'type_role',
        'color',
        'is_active',
        'description',
        'guard_name',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
