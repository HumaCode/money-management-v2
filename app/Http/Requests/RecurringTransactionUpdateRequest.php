<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecurringTransactionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = user('id');

        return [
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $userId),
            ],
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) use ($userId) {
                    $query->whereNull('user_id')->orWhere('user_id', $userId);
                }),
            ],
            'currency_id'          => 'required|exists:currencies,id',
            'amount'               => 'required|numeric|min:0.01',
            'type'                 => 'required|in:income,expense',
            'frequency'            => 'required|in:daily,weekly,bi_weekly,monthly,quarterly,yearly',
            'day_of_month'         => 'nullable|integer|between:1,31',
            'day_of_week'          => 'nullable|integer|between:0,6',
            'start_date'           => 'required|date',
            'end_date'             => 'nullable|date|after_or_equal:start_date',
            'next_occurrence_date' => 'nullable|date',
            'is_active'            => 'nullable|boolean',
            'description'          => 'required|string|max:255',
            'notes'                => 'nullable|string',
        ];
    }
}
