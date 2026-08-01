<?php

namespace App\Interface;

interface ProfileRepositoryInterface
{
    public function getProfileData(string $userId);
    public function updateProfileInformation(string $userId, array $data);
    public function updatePassword(string $userId, string $newPassword);
    public function deleteAccount(string $userId);
}
