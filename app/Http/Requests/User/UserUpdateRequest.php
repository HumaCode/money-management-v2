<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name'      => ['required', 'string', 'max:255'],
            'username'  => ['required', 'string', 'max:50', Rule::unique('users')->ignore($userId)],
            'email'     => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'phone'     => ['nullable', 'string', 'max:20'],
            'gender'    => ['nullable', 'string', 'in:male,female'],
            'role'      => ['required', 'string'],
            'password'  => ['nullable', 'confirmed', Rules\Password::defaults()],
            'is_active' => ['required', 'in:0,1,true,false'],
        ];
    }
}
