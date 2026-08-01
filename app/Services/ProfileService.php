<?php

namespace App\Services;

use App\Interface\ProfileRepositoryInterface;

class ProfileService
{
    protected ProfileRepositoryInterface $profileRepository;

    public function __construct(ProfileRepositoryInterface $profileRepository)
    {
        $this->profileRepository = $profileRepository;
    }

    public function getUserProfile(string $userId)
    {
        return $this->profileRepository->getProfileData($userId);
    }

    public function updateProfileInformation(string $userId, array $data)
    {
        return $this->profileRepository->updateProfileInformation($userId, $data);
    }

    public function updatePassword(string $userId, string $newPassword)
    {
        return $this->profileRepository->updatePassword($userId, $newPassword);
    }

    public function deleteAccount(string $userId)
    {
        return $this->profileRepository->deleteAccount($userId);
    }
}
