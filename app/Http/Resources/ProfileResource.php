<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $initials = collect(explode(' ', $this->name))
            ->map(fn($w) => strtoupper(substr($w, 0, 1)))
            ->take(2)
            ->join('');

        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'email'              => $this->email,
            'initials'           => $initials ?: 'U',
            'created_at'         => $this->created_at ? $this->created_at->translatedFormat('d F Y') : null,
            'transactions_count' => $this->transactions_count ?? 0,
            'accounts_count'     => $this->accounts_count ?? 0,
            'budgets_count'      => $this->budgets_count ?? 0,
            'saving_goals_count' => $this->savings_goals_count ?? $this->saving_goals_count ?? 0,
        ];
    }
}
