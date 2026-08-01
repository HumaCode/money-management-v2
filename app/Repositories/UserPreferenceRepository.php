<?php

namespace App\Repositories;

use App\Interface\UserPreferenceRepositoryInterface;
use App\Models\Currency;
use App\Models\UserPreference;

class UserPreferenceRepository implements UserPreferenceRepositoryInterface
{
    public function getUserPreferences(string $userId)
    {
        return UserPreference::with('defaultCurrency')->firstOrCreate(
            ['user_id' => $userId],
            [
                'theme'                   => 'dark',
                'language'                => 'id',
                'date_format'             => 'DD/MM/YYYY',
                'number_format'           => '1.000.000,00',
                'fiscal_year_start_month' => 1,
                'notification_email'      => true,
                'notification_push'       => true,
            ]
        );
    }

    public function updateUserPreferences(string $userId, array $data)
    {
        if (array_key_exists('default_currency_id', $data) && empty($data['default_currency_id'])) {
            $data['default_currency_id'] = null;
        }
        $preference = $this->getUserPreferences($userId);
        $preference->update($data);
        return $preference->fresh(['defaultCurrency']);
    }

    public function getAvailableCurrencies()
    {
        return Currency::where('is_active', true)->get();
    }
}
