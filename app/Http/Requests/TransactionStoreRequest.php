<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionStoreRequest extends FormRequest
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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $type = $this->input('type');
            $accountId = $this->input('account_id');
            $amount = (float) $this->input('amount');

            if (in_array($type, ['expense', 'transfer']) && $accountId && $amount > 0) {
                $account = \App\Models\Account::find($accountId);
                if ($account) {
                    $currentBalance = (float) $account->balance;
                    if ($currentBalance < $amount) {
                        $formattedBalance = number_format($currentBalance, 0, ',', '.');
                        $formattedAmount = number_format($amount, 0, ',', '.');
                        $validator->errors()->add(
                            'amount',
                            "Saldo tidak mencukupi untuk melakukan transaksi ini! Saldo akun saat ini: Rp {$formattedBalance}, sedangkan nominal transaksi: Rp {$formattedAmount}."
                        );
                    }
                }
            }
        });
    }
}
