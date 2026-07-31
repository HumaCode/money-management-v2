<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id'       => 'required|exists:accounts,id',
            'to_account_id'    => 'required_if:type,transfer|nullable|different:account_id|exists:accounts,id',
            'category_id'      => 'required_unless:type,transfer|nullable|exists:categories,id',
            'currency_id'      => 'required|exists:currencies,id',
            'amount'           => 'required|numeric|min:0.01',
            'type'             => 'required|in:income,expense,transfer',
            'transaction_date' => 'required|date',
            'description'      => 'required|string|max:255',
            'notes'            => 'nullable|string',
            'reference_number' => 'nullable|string|max:100',
        ];
    }
}
