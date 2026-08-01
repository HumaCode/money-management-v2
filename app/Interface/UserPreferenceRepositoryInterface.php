<?php

namespace App\Interface;

interface UserPreferenceRepositoryInterface
{
    public function getUserPreferences(string $userId);
    public function updateUserPreferences(string $userId, array $data);
    public function getAvailableCurrencies();
}
