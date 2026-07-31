<?php

namespace App\Http\Requests\SavingGoal;

use Illuminate\Foundation\Http\FormRequest;

class SavingGoalStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'account_id'     => 'required|uuid|exists:accounts,id',
            'currency_id'    => 'required|uuid|exists:currencies,id',
            'target_amount'  => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'monthly_target' => 'nullable|numeric|min:0',
            'target_date'    => 'required|date|after_or_equal:today',
            'icon'           => 'nullable|string|max:50',
            'color'          => 'nullable|string|max:7',
        ];
    }
}
