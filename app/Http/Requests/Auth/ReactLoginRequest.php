<?php

namespace App\Http\Requests\Auth;

use App\Rules\Recaptcha;
use Illuminate\Foundation\Http\FormRequest;

class ReactLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identity'             => ['required', 'string', 'max:50'],
            'password'             => ['required', 'string'],
            'remember'             => ['nullable', 'boolean'],
            'g-recaptcha-response' => ['required', new Recaptcha()],
        ];
    }

    public function attributes(): array
    {
        return [
            'identity' => 'Username / Email',
            'password' => 'Password',
        ];
    }
}
