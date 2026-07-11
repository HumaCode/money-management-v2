<?php

namespace App\Services;

use App\Interface\AccountRepositoryInterface;

class AccountService
{
    private AccountRepositoryInterface $accountRepository;

    public function __construct(AccountRepositoryInterface $accountRepository)
    {
        $this->accountRepository = $accountRepository;
    }

    public function getAllPaginated(?string $search, ?string $status, ?string $type, int $rowsPerPage)
    {
        return $this->accountRepository->getAllPaginated($search, $status, $type, $rowsPerPage);
    }

    public function createAccount(array $data)
    {
        return $this->accountRepository->create($data);
    }

    public function updateAccount(string $id, array $data)
    {
        return $this->accountRepository->update($id, $data);
    }

    public function getAccountById(string $id)
    {
        return $this->accountRepository->getById($id);
    }

    public function deleteAccount(string $id)
    {
        return $this->accountRepository->delete($id);
    }

    public function getAccountTypeList()
    {
        return $this->accountRepository->getAccountTypeList();
    }

    public function getCurrencyList()
    {
        return $this->accountRepository->getCurrencyList();
    }
}
