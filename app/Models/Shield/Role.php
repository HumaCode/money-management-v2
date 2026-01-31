<?php

namespace App\Models\Shield;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Role as ModelsRole;

class Role extends ModelsRole
{
     use HasUuids;

    protected $fillable = ['name', 'guard_name'];
}
