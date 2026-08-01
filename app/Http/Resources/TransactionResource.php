<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array for both Web React UI & Mobile App UI.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $type = strtolower($this->type ?? 'expense');
        $isIncome  = $type === 'income';
        $isExpense = $type === 'expense';

        $amt = (float) ($this->amount ?? 0);
        $sign = $isIncome ? '+' : ($isExpense ? '-' : '');
        $formattedAmount = $sign . ' Rp ' . number_format($amt, 0, ',', '.');

        $dateObj   = Carbon::parse($this->transaction_date);
        $dateGroup = $dateObj->format('j/n/Y'); // e.g. 1/8/2026
        $dateLabel = $dateObj->isToday() ? 'Hari ini' : ($dateObj->isYesterday() ? 'Kemarin' : $dateObj->translatedFormat('d M Y'));

        $categoryName = $this->category ? $this->category->name : ucfirst($type);
        $title = $this->description ?: $categoryName;

        return [
            'id'                          => $this->id,
            'user_id'                     => $this->user_id,
            'account_id'                  => $this->account_id,
            'to_account_id'               => $this->to_account_id,
            'category_id'                 => $this->category_id,
            'currency_id'                 => $this->currency_id,
            'type'                        => $type,
            'type_label'                  => ucfirst($type),
            'description'                 => $this->description ?: '-',
            'title'                       => $title,
            'category_name'               => $categoryName,
            'amount'                      => $amt,
            'amount_formatted'            => $formattedAmount,
            'signed_amount'               => $formattedAmount,
            'transaction_date'            => $this->transaction_date,
            'transaction_date_formatted'  => $dateLabel,
            'date_group'                  => $dateGroup,
            'formatted_date'              => $dateLabel,
            'color'                       => $this->category->color ?? ($isIncome ? '#34d399' : ($isExpense ? '#f87171' : '#60a5fa')),
            'icon'                        => $this->category->icon ?? ($isIncome ? 'arrow_downward' : ($isExpense ? 'arrow_upward' : 'swap_horiz')),
            'category'                    => $this->category ? [
                'id'    => $this->category->id,
                'name'  => $this->category->name,
                'color' => $this->category->color,
                'icon'  => $this->category->icon,
            ] : null,
            'account'                     => $this->account ? [
                'id'   => $this->account->id,
                'name' => $this->account->name,
            ] : null,
            'to_account'                  => $this->toAccount ? [
                'id'   => $this->toAccount->id,
                'name' => $this->toAccount->name,
            ] : null,
            'receipt_path'                => $this->receipt_path,
            'receipt_url'                 => $this->receipt_path ? asset('storage/' . $this->receipt_path) : null,
            'created_at'                  => $this->created_at,
            'updated_at'                  => $this->updated_at,
        ];
    }
}
