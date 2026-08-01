<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserPreferenceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'theme'                   => ['required', 'string', Rule::in(['dark', 'light', 'system'])],
            'language'                => ['required', 'string', Rule::in(['id', 'en'])],
            'date_format'             => ['required', 'string', Rule::in(['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'])],
            'number_format'           => ['required', 'string', Rule::in(['1.000.000,00', '1,000,000.00'])],
            'fiscal_year_start_month' => ['required', 'integer', 'min:1', 'max:12'],
            'default_currency_id'     => ['nullable', 'sometimes', Rule::exists('currencies', 'id')],
            'notification_email'      => ['required', 'boolean'],
            'notification_push'       => ['required', 'boolean'],
        ];
    }
}
