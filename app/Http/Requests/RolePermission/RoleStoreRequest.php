<?php

namespace App\Http\Requests\RolePermission;

use Illuminate\Foundation\Http\FormRequest;

class RoleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['required', 'string', 'max:100', 'unique:roles,slug'],
            'color'       => ['nullable', 'string', 'max:30'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active'   => ['required', 'in:0,1,true,false'],
        ];
    }
}
