<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyticsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'type'                   => $this->type,
            'type_label'             => ucfirst($this->type),
            'amount'                 => (float) $this->amount,
            'amount_formatted'       => ($this->type === 'income' ? '+ ' : '- ') . 'Rp ' . number_format($this->amount, 2, ',', '.'),
            'transaction_date'       => $this->transaction_date ? $this->transaction_date->format('Y-m-d') : null,
            'transaction_date_formatted' => $this->transaction_date ? $this->transaction_date->translatedFormat('d F Y') : null,
            'description'            => $this->description,
            'reference_number'       => $this->reference_number,
            'account'                => $this->whenLoaded('account', fn() => [
                'id'   => $this->account->id,
                'name' => $this->account->name,
            ]),
            'category'               => $this->whenLoaded('category', fn() => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
                'icon' => $this->category->icon,
            ]),
        ];
    }
}
