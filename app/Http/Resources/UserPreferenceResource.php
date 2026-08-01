<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserPreferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'theme'                   => $this->theme ?? 'dark',
            'language'                => $this->language ?? 'id',
            'date_format'             => $this->date_format ?? 'DD/MM/YYYY',
            'number_format'           => $this->number_format ?? '1.000.000,00',
            'fiscal_year_start_month' => (int) ($this->fiscal_year_start_month ?? 1),
            'default_currency_id'     => $this->default_currency_id,
            'default_currency'        => $this->whenLoaded('defaultCurrency', fn() => [
                'id'     => $this->defaultCurrency->id,
                'code'   => $this->defaultCurrency->code,
                'symbol' => $this->defaultCurrency->symbol,
                'name'   => $this->defaultCurrency->name,
            ]),
            'notification_email'      => (bool) ($this->notification_email ?? true),
            'notification_push'       => (bool) ($this->notification_push ?? true),
        ];
    }
}
