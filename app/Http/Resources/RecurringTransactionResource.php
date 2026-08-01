<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecurringTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $symbol = $this->currency?->symbol ?? 'Rp';
        $amount = (float) ($this->amount ?? 0);
        $type = $this->type ?? 'expense';

        $startDateFormatted = '—';
        if (!empty($this->start_date)) {
            $startDateFormatted = tgl_indo($this->start_date);
        }

        $nextOccurrenceFormatted = '—';
        if (!empty($this->next_occurrence_date)) {
            $nextOccurrenceFormatted = tgl_indo($this->next_occurrence_date);
        }

        $frequencyLabelMap = [
            'daily'     => 'Daily',
            'weekly'    => 'Weekly',
            'bi_weekly' => 'Bi-Weekly',
            'monthly'   => 'Monthly',
            'quarterly' => 'Quarterly',
            'yearly'    => 'Yearly',
        ];

        return [
            'id'                     => $this->id,
            'user_id'                => $this->user_id,
            'account'                => AccountResource::make($this->whenLoaded('account')),
            'category'               => CategoryResource::make($this->whenLoaded('category')),
            'currency'               => CurrencyResource::make($this->whenLoaded('currency')),

            'type'                   => $type,
            'type_label'             => ucfirst($type),
            'amount'                 => $amount,
            'amount_formatted'       => ($type === 'income' ? '+ ' : '- ') . $symbol . ' ' . number_format($amount, 2, '.', ','),
            'description'            => $this->description ?? '—',
            'frequency'              => $this->frequency,
            'frequency_label'        => $frequencyLabelMap[$this->frequency] ?? ucfirst($this->frequency),
            'day_of_month'           => $this->day_of_month,
            'day_of_week'            => $this->day_of_week,
            'start_date'             => $this->start_date?->format('Y-m-d'),
            'start_date_formatted'   => $startDateFormatted,
            'end_date'               => $this->end_date?->format('Y-m-d'),
            'next_occurrence_date'   => $this->next_occurrence_date?->format('Y-m-d'),
            'next_occurrence_formatted' => $nextOccurrenceFormatted,
            'is_active'              => (bool) $this->is_active,
            'status_label'           => $this->is_active ? 'Active' : 'Inactive',
            'status_badge'           => $this->is_active ? 'success' : 'secondary',
            'notes'                  => $this->notes ?? '—',

            'created_at'             => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'             => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
