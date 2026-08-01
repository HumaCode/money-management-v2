<?php

namespace App\Http\Requests\Api\SavingsGoal;

use App\Http\Requests\Api\BaseApiRequest;

class StoreSavingsGoalRequest extends BaseApiRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'target_date'   => 'nullable|date',
            'color'         => 'nullable|string|max:50',
            'icon'          => 'nullable|string|max:50',
            'notes'         => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required'          => 'Nama target tabungan wajib diisi.',
            'target_amount.required' => 'Jumlah target nominal tabungan wajib diisi.',
        ];
    }
}
