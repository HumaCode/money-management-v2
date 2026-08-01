<?php

namespace App\Services;

use App\Interface\UserPreferenceRepositoryInterface;

class UserPreferenceService
{
    protected UserPreferenceRepositoryInterface $preferenceRepository;

    public function __construct(UserPreferenceRepositoryInterface $preferenceRepository)
    {
        $this->preferenceRepository = $preferenceRepository;
    }

    public function getUserPreferences(string $userId)
    {
        return $this->preferenceRepository->getUserPreferences($userId);
    }

    public function updateUserPreferences(string $userId, array $data)
    {
        return $this->preferenceRepository->updateUserPreferences($userId, $data);
    }

    public function getAvailableCurrencies()
    {
        return $this->preferenceRepository->getAvailableCurrencies();
    }
}
