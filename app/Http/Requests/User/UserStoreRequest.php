<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'username'  => ['required', 'string', 'max:50', 'unique:' . User::class],
            'email'     => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone'     => ['nullable', 'string', 'max:20'],
            'gender'    => ['nullable', 'string', 'in:male,female'],
            'role'      => ['required', 'string'],
            'password'  => ['required', 'confirmed', Rules\Password::defaults()],
            'is_active' => ['required', 'in:0,1,true,false'],
        ];
    }
}
