<?php

namespace App\Interface;

interface AuthRepositoryInterface
{
    public function attempt(array $credentials, bool $remember): bool;

    public function logout(): void;
}
