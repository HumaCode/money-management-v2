<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
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
            'account_type_id'   => $this->account_type_id,
            'currency_id'       => $this->currency_id,
            'name'              => $this->name,
            'institution_name'  => $this->institution_name,

            // ⛔ JANGAN expose full account number (opsional)
            // 'account_number' => $this->account_number,

            // ✅ masked version
            'masked_account_number' => $this->masked_account_number,

            'balance'               => (float) $this->balance,
            'balance_formatted'     => $this->balance_formatted,

            'credit_limit'          => number_format($this->credit_limit, 2, '.', ''),
            'credit_limit_formatted' => $this->formatCurrency($this->credit_limit),

            'icon'              => $this->icon,
            'color'             => $this->color,
            'is_active'         => (bool) $this->is_active,
            'is_default'        => (bool) $this->is_default,
            'notes'             => $this->notes,

            'display_name'      => $this->getDisplayName(),

            'status_badge'      => $this->is_active ? 'Active' : 'Inactive',
            'status_color'      => $this->is_active ? 'success' : 'secondary',

            'created_at'        => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'        => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function formatCurrency($amount)
    {
        return number_format($amount, 2, '.', ',');
    }

    /**
     * Get display name with institution if available
     *
     * @return string
     */
    private function getDisplayName()
    {
        if ($this->institution_name) {
            return $this->name . ' (' . $this->institution_name . ')';
        }

        return $this->name;
    }
}
