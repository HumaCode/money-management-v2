<?php

namespace App\Models\Shield;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Permission as ModelsPermission;

class Permission extends ModelsPermission
{
    use HasUuids;

    protected $fillable = ['name', 'guard_name'];
}
