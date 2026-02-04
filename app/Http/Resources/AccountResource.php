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
            'id'                    => $this->id,
            'user_id'               => $this->user_id,
            'account_type_id'       => $this->account_type_id,
            'currency_id'           => $this->currency_id,
            'name'                  => $this->name,
            'institution_name'      => $this->institution_name,
            'account_number'        => $this->account_number,
            'balance'               => number_format($this->balance, 2, '.', ''),
            'balance_formatted'     => $this->formatCurrency($this->balance),
            'credit_limit'          => number_format($this->credit_limit, 2, '.', ''),
            'credit_limit_formatted' => $this->formatCurrency($this->credit_limit),
            'icon'                  => $this->icon,
            'color'                 => $this->color,
            'is_active'             => (bool) $this->is_active,
            'is_default'            => (bool) $this->is_default,
            'notes'                 => $this->notes,

            // Relationships (conditional loading)
            'user'                  => $this->whenLoaded('user', function () {
                return [
                    'id'    => $this->user->id,
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),

            'account_type'          => $this->whenLoaded('accountType', function () {
                return [
                    'id'        => $this->accountType->id,
                    'name'      => $this->accountType->name,
                    'icon'      => $this->accountType->icon,
                    'color'     => $this->accountType->color,
                ];
            }),

            'currency'              => $this->whenLoaded('currency', function () {
                return [
                    'id'            => $this->currency->id,
                    'code'          => $this->currency->code,
                    'symbol'        => $this->currency->symbol,
                    'name'          => $this->currency->name,
                    'format'        => $this->currency->format,
                ];
            }),

            // Statistics (optional - if loaded)
            'transactions_count'    => $this->when(
                isset($this->transactions_count),
                $this->transactions_count
            ),

            'total_income'          => $this->when(
                isset($this->total_income),
                number_format($this->total_income, 2, '.', '')
            ),

            'total_expense'         => $this->when(
                isset($this->total_expense),
                number_format($this->total_expense, 2, '.', '')
            ),

            // Computed attributes
            'available_balance'     => $this->when(
                $this->account_type_id == 3, // Credit Card
                number_format($this->credit_limit - $this->balance, 2, '.', '')
            ),

            'is_credit_card'        => $this->account_type_id == 3,
            'is_cash'               => $this->account_type_id == 5,
            'is_bank_account'       => in_array($this->account_type_id, [1, 2]), // Checking or Savings

            // Display helpers
            'display_name'          => $this->getDisplayName(),
            'masked_account_number' => $this->getMaskedAccountNumber(),

            // Status badges
            'status_badge'          => $this->is_active ? 'Active' : 'Inactive',
            'status_color'          => $this->is_active ? 'success' : 'secondary',

            // Timestamps
            'created_at'            => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'            => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at'            => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format currency with symbol
     *
     * @param float $amount
     * @return string
     */
    private function formatCurrency($amount)
    {
        if ($this->relationLoaded('currency')) {
            $symbol = $this->currency->symbol;
            $format = $this->currency->format ?? '#,##0.00';

            // Simple formatting - you can enhance this
            $formatted = number_format($amount, 2, '.', ',');

            return $symbol . ' ' . $formatted;
        }

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

    /**
     * Get masked account number (show last 4 digits)
     *
     * @return string|null
     */
    private function getMaskedAccountNumber()
    {
        if (!$this->account_number) {
            return null;
        }

        $length = strlen($this->account_number);

        if ($length <= 4) {
            return $this->account_number;
        }

        return str_repeat('*', $length - 4) . substr($this->account_number, -4);
    }
}
