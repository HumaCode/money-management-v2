<?php

namespace App\Http\Resources;

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
            'period'            => $this->period,

            'total_amount'      => (float) $this->total_amount,
            'total_spent'       => (float) $this->total_spent,
            'remaining_amount' => (float) $this->remaining_amount,
            'progress'          => round($this->progress_percentage, 2),

            'start_date'        => $this->start_date?->format('Y-m-d'),
            'end_date'          => $this->end_date?->format('Y-m-d'),

            'is_active'         => (bool) $this->is_active,
            'rollover_unused'  => (bool) $this->rollover_unused,
            'notes'             => $this->notes,

            // Relations
            'currency' => $this->whenLoaded('currency', fn() => [
                'id'     => $this->currency->id,
                'code'   => $this->currency->code,
                'symbol' => $this->currency->symbol,
            ]),

            'categories' => $this->whenLoaded(
                'budgetCategories',
                fn() =>
                $this->budgetCategories->map(fn($category) => [
                    'id'               => $category->id,
                    'name'             => $category->name,
                    'allocated_amount' => (float) $category->allocated_amount,
                    'spent_amount'     => (float) $category->spent_amount,
                ])
            ),

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
