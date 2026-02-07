<?php

namespace App\Http\Requests\Budget;

use Illuminate\Foundation\Http\FormRequest;

class BudgetStoreExpenseRequest extends FormRequest
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
            'category_id'       => ['required', 'exists:categories,id'],
            'allocated_amount'  => ['required', 'numeric', 'min:0'],
            'spent_amount'      => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * Normalize & prepare data before validation
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'allocated_amount'  => $this->allocated_amount ?? 0,
            'spent_amount'      => $this->spent_amount ?? 0,
        ]);
    }
}
