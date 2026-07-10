<?php

namespace App\Services;

use App\Interface\AuthRepositoryInterface;

class AuthService
{
    private AuthRepositoryInterface $authRepository;

    public function __construct(AuthRepositoryInterface $authRepository)
    {
        $this->authRepository = $authRepository;
    }

    public function login(array $credentials, bool $remember = false): bool
    {
        return $this->authRepository->attempt($credentials, $remember);
    }

    public function logout(): void
    {
        $this->authRepository->logout();
    }
}
