<?php

namespace App\Http\Requests\Api\SavingsGoal;

use App\Http\Requests\Api\BaseApiRequest;

class AddSavingRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount'         => 'required|numeric|min:1',
            'contributed_at' => 'nullable|date',
            'notes'          => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Jumlah setoran tabungan wajib diisi.',
            'amount.min'      => 'Jumlah setoran tabungan minimal 1.',
        ];
    }
}
