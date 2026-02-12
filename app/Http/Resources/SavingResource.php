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
        return [









            'id'                    => $this->id,
            'user_id'               => $this->user_id,
            'account'               => AccountResource::make($this->whenLoaded('account')),
            'currency'              => CurrencyResource::make($this->whenLoaded('currency')),

            'name'                  => $this->name,
            'description'           => $this->description,
            'target_amount'         => $this->target_amount,
            'current_amount'        => $this->current_amount,
            'monthly_target'        => $this->monthly_target,
            'target_date'           => $this->target_date,
            'status'                => $this->status,
            'icon'                  => $this->icon,
            'color'                 => $this->color,
            'is_active'             => (bool) $this->is_active,


            'created_at'            => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'            => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
