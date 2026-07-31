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
        $symbol = $this->currency?->symbol ?? '';

        $targetAmt = (float) $this->target_amount;
        $currentAmt = (float) $this->current_amount;
        $monthlyTgt = $this->monthly_target ? (float) $this->monthly_target : null;
        $remainingAmt = max(0.0, $targetAmt - $currentAmt);

        $progressPercent = $targetAmt > 0 ? ($currentAmt / $targetAmt) * 100 : 0;
        $progressBarWidth = min(100.0, $progressPercent);

        return [
            'id'                          => $this->id,
            'user_id'                     => $this->user_id,
            'account'                     => AccountResource::make($this->whenLoaded('account')),
            'currency'                    => CurrencyResource::make($this->whenLoaded('currency')),
            'name'                        => $this->name,
            'description'                 => $this->description ?? '—',
            
            // Amounts
            'target_amount'               => $targetAmt,
            'current_amount'              => $currentAmt,
            'monthly_target'              => $monthlyTgt,
            'remaining_amount'            => $remainingAmt,
            
            // Formatted Amounts
            'target_amount_formatted'     => trim($symbol . ' ' . number_format($targetAmt, 2, '.', ',')),
            'current_amount_formatted'    => trim($symbol . ' ' . number_format($currentAmt, 2, '.', ',')),
            'monthly_target_formatted'    => $monthlyTgt !== null ? trim($symbol . ' ' . number_format($monthlyTgt, 2, '.', ',')) : '—',
            'remaining_amount_formatted'  => trim($symbol . ' ' . number_format($remainingAmt, 2, '.', ',')),
            
            // Dates
            'target_date'                 => $this->target_date?->format('Y-m-d'),
            'target_date_formatted'       => $this->target_date?->format('d M Y') ?? '—',
            
            // Status and Visuals
            'status'                      => $this->status ?? 'active',
            'icon'                        => $this->icon ?? '🎯',
            'color'                       => $this->color ?? '#10B981',
            
            // Progress Calculation
            'progress_percentage'         => round($progressPercent, 1),
            'progress_bar_width'          => round($progressBarWidth, 1),
            'is_completed'                => $currentAmt >= $targetAmt,

            'created_at'                  => $this->created_at?->format('d M Y H:i'),
            'updated_at'                  => $this->updated_at?->format('d M Y H:i'),
        ];
    }
}
