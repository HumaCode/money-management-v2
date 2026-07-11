<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,

            'name'              => $this->name,
            'period'            => ucfirst($this->period),

            'total_amount'               => (float) $this->total_amount,
            'total_spent'                => (float) $this->total_spent,
            'total_amount_formatted'     => $this->total_amount_formatted,
            'spent_amount_formatted'     => $this->spent_amount_formatted,
            'remaining_amount'           => $this->remaining_amount,
            'remaining_amount_formatted' => $this->remaining_amount_formatted,
            'date_range_formatted'       => $this->date_range_formatted,
            'progress_percentage_normalized' => $this->progress_percentage_normalized,
            'progress_bar_width'         => $this->progress_bar_width,
            'status'                     => $this->status,

            'start_date'        => $this->start_date?->format('Y-m-d'),
            'end_date'          => $this->end_date?->format('Y-m-d'),

            'rollover_unused'   => (bool) $this->rollover_unused,
            'is_active'         => (bool) $this->is_active,

            'currency'          => $this->whenLoaded('currency', fn () => [
                'id'     => $this->currency->id,
                'code'   => $this->currency->code,
                'name'   => $this->currency->name,
                'symbol' => $this->currency->symbol,
            ]),

            'notes'     => $this->notes,
            'created_at' => tgl_indo_time($this->created_at, true),
            'updated_at' => tgl_indo_time($this->updated_at, true),
        ];
    }
}
