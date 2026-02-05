<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class AccountUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'account_type_id' => [
                'required',
                'exists:account_types,id',
            ],

            'currency_id' => [
                'required',
                'exists:currencies,id',
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'institution_name' => [
                'nullable',
                'string',
                'max:150',
            ],

            'account_number' => [
                'nullable',
                'string',
                'max:50',
            ],

            'balance' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:500',
            ],

            'is_default' => [
                'nullable',
                'in:0,1',
            ],
            'is_active' => [
                'nullable',
                'in:0,1',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'balance' => $this->balance ?? 0,
            'is_default' => $this->is_default ?? 0,
        ]);
    }
}
