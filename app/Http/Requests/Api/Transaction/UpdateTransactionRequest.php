<?php

namespace App\Http\Requests\Api\Transaction;

use App\Http\Requests\Api\BaseApiRequest;

class UpdateTransactionRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type'             => 'sometimes|required|in:income,expense,transfer',
            'amount'           => 'sometimes|required|numeric|min:0.01',
            'account_id'       => 'sometimes|required|exists:accounts,id',
            'to_account_id'    => 'required_if:type,transfer|nullable|exists:accounts,id',
            'category_id'      => 'required_if:type,income,expense|nullable|exists:categories,id',
            'transaction_date' => 'sometimes|required|date',
            'description'      => 'nullable|string|max:255',
            'notes'            => 'nullable|string',
        ];
    }

    /**
     * Custom error messages
     */
    public function messages(): array
    {
        return [
            'type.in'                   => 'Tipe transaksi wajib diisi (income, expense, transfer).',
            'amount.numeric'            => 'Jumlah nominal harus berupa angka.',
            'account_id.exists'         => 'Akun/rekening tidak ditemukan.',
            'to_account_id.required_if' => 'Akun/rekening tujuan wajib dipilih untuk transaksi transfer.',
            'category_id.required_if'   => 'Kategori wajib dipilih untuk transaksi pemasukan dan pengeluaran.',
            'transaction_date.date'     => 'Format tanggal transaksi tidak valid.',
        ];
    }
}
