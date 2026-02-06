<?php

namespace App\Http\Requests\Budget;

use Illuminate\Foundation\Http\FormRequest;

class BudgetUpdateRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'currency_id' => [
                'required',
                'exists:currencies,id',
            ],

            'total_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'period' => [
                'nullable',
                'in:weekly,monthly,quarterly,yearly',
            ],

            'start_date' => [
                'nullable',
                'date',
            ],

            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],

            'rollover_unused' => [
                'nullable',
                'boolean',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'currency_id.exists'        => 'Selected currency is invalid.',
            'end_date.after_or_equal'   => 'End date must be after or equal to start date.',
        ];
    }

    /**
     * Normalize & prepare data before validation
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'total_amount' => $this->total_amount ?? 0,
        ]);
    }
}
