<?php

namespace App\Http\Requests\SavingGoal;

use Illuminate\Foundation\Http\FormRequest;

class SavingGoalAddSavingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'         => 'required|numeric|min:0.01',
            'account_id'     => 'nullable|string',
            'notes'          => 'nullable|string|max:1000',
            'contributed_at' => 'required|date',
        ];
    }
}
