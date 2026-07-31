<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currency = $this->currency;
        $symbol = $currency?->symbol ?? 'Rp';

        $targetAmount = (float) ($this->target_amount ?? 0);
        $currentAmount = (float) ($this->current_amount ?? 0);
        $monthlyTarget = (float) ($this->monthly_target ?? 0);

        $progress = $targetAmount > 0 ? min(100, ($currentAmount / $targetAmount) * 100) : 0;
        $progressNormalized = $targetAmount > 0 ? ($currentAmount / $targetAmount) * 100 : 0;

        $targetDate = null;
        $targetDateFormatted = '—';
        if (!empty($this->target_date)) {
            $parsedDate = $this->target_date instanceof \Carbon\Carbon ? $this->target_date : \Carbon\Carbon::parse($this->target_date);
            $targetDate = $parsedDate->format('Y-m-d');
            $targetDateFormatted = tgl_indo($this->target_date);
        }

        $status = $this->status ?? 'active';

        return [
            'id'                        => $this->id,
            'user_id'                   => $this->user_id,
            'account'                   => AccountResource::make($this->whenLoaded('account')),
            'currency'                  => CurrencyResource::make($this->whenLoaded('currency')),

            'name'                      => $this->name ?? '—',
            'description'               => $this->description ?? '—',
            'target_amount'             => $targetAmount,
            'target_amount_formatted'   => $symbol . ' ' . number_format($targetAmount, 2, '.', ','),
            'current_amount'            => $currentAmount,
            'current_amount_formatted'  => $symbol . ' ' . number_format($currentAmount, 2, '.', ','),
            'monthly_target'            => $monthlyTarget,
            'monthly_target_formatted'  => $symbol . ' ' . number_format($monthlyTarget, 2, '.', ','),
            'progress_percentage'       => round($progress, 1),
            'progress_percentage_normalized' => round($progressNormalized, 1),
            'progress_bar_width'        => min(100, max(0, round($progress, 1))),
            'target_date'               => $targetDate,
            'target_date_formatted'     => $targetDateFormatted,
            'status'                    => $status,
            'status_label'              => ucfirst($status),
            'icon'                      => $this->icon ?? '🎯',
            'color'                     => $this->color ?? '#7dd3a8',
            'is_active'                 => $status === 'active',

            'created_at'                => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'                => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
