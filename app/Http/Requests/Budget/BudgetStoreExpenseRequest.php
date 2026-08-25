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
            'notes'             => ['nullable', 'string', 'max:1000'],
            'spent_date'        => ['required', 'date'],
            'spent_amount'      => ['required', 'numeric', 'min:0.01'],
            'allocated_amount'  => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.required'   => 'Kategori pengeluaran wajib dipilih.',
            'category_id.exists'     => 'Kategori tidak valid.',
            'spent_date.required'    => 'Tanggal pengeluaran wajib diisi.',
            'spent_amount.required'  => 'Nominal pengeluaran (Spent Amount) wajib diisi.',
            'spent_amount.min'       => 'Nominal pengeluaran harus lebih besar dari 0.',
        ];
    }

    /**
     * Normalize & prepare data before validation
     */
    protected function prepareForValidation(): void
    {
        $spent = $this->spent_amount ?? $this->allocated_amount ?? 0;
        $this->merge([
            'spent_amount'      => $spent,
            'allocated_amount'  => $this->allocated_amount ?? $spent,
        ]);
    }
}
