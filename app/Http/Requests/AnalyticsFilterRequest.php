<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyticsFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'period'       => 'nullable|string|in:this_month,last_month,this_quarter,this_year,all_time,all,custom',
            'account_id'   => 'nullable|string',
            'category_id'  => 'nullable|string',
            'row_per_page' => 'nullable|integer|min:1|max:100',
            'page'         => 'nullable|integer|min:1',
        ];
    }
}
