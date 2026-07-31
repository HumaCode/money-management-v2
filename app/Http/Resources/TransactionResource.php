<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $symbol = $this->currency?->symbol ?? 'Rp';
        $amount = (float) ($this->amount ?? 0);
        $type = $this->type ?? 'expense';

        $typeBadgeClass = 'info';
        if ($type === 'income') {
            $typeBadgeClass = 'success';
        } elseif ($type === 'expense') {
            $typeBadgeClass = 'danger';
        }

        $transactionDateFormatted = '—';
        if (!empty($this->transaction_date)) {
            $transactionDateFormatted = tgl_indo($this->transaction_date);
        }

        return [
            'id'                          => $this->id,
            'user_id'                     => $this->user_id,
            'account'                     => AccountResource::make($this->whenLoaded('account')),
            'to_account'                  => AccountResource::make($this->whenLoaded('toAccount')),
            'to_account_id'               => $this->to_account_id,
            'category'                    => CategoryResource::make($this->whenLoaded('category')),
            'currency'                    => CurrencyResource::make($this->whenLoaded('currency')),

            'type'                        => $type,
            'type_label'                  => ucfirst($type),
            'type_badge_class'            => $typeBadgeClass,
            'amount'                      => $amount,
            'amount_formatted'            => ($type === 'income' ? '+ ' : ($type === 'expense' ? '- ' : '')) . $symbol . ' ' . number_format($amount, 2, '.', ','),
            'description'                 => $this->description ?? '—',
            'notes'                       => $this->notes ?? '—',
            'transaction_date'            => $this->transaction_date?->format('Y-m-d'),
            'transaction_date_formatted'  => $transactionDateFormatted,
            'reference_number'            => $this->reference_number ?? '—',

            'created_at'                  => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'                  => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
