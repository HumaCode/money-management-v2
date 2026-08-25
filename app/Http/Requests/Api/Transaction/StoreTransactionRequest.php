<?php

namespace App\Http\Requests\Api\Transaction;

use App\Http\Requests\Api\BaseApiRequest;

class StoreTransactionRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type'             => 'required|in:income,expense,transfer',
            'amount'           => 'required|numeric|min:0',
            'account_id'       => 'required|exists:accounts,id',
            'to_account_id'    => 'required_if:type,transfer|nullable|exists:accounts,id',
            'category_id'      => 'required_if:type,income,expense|nullable|exists:categories,id',
            'transaction_date' => 'required|date',
            'description'      => 'nullable|string|max:255',
            'notes'            => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.required'             => 'Tipe transaksi wajib diisi (income, expense, transfer).',
            'amount.required'           => 'Jumlah nominal wajib diisi.',
            'account_id.required'       => 'Akun/rekening sumber wajib dipilih.',
            'to_account_id.required_if' => 'Akun/rekening tujuan wajib dipilih untuk transaksi transfer.',
            'category_id.required_if'   => 'Kategori wajib dipilih untuk transaksi pemasukan dan pengeluaran.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
        ];
    }
}
