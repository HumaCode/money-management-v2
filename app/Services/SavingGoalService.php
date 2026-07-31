<?php

namespace App\Services;

use App\Interface\SavingGoalRepositoryInterface;

class SavingGoalService
{
    private SavingGoalRepositoryInterface $savingGoalRepository;

    public function __construct(SavingGoalRepositoryInterface $savingGoalRepository)
    {
        $this->savingGoalRepository = $savingGoalRepository;
    }

    public function getAllPaginated(?string $search, ?string $status, ?int $rowsPerPage)
    {
        return $this->savingGoalRepository->getAllPaginated($search, $status, $rowsPerPage);
    }

    public function createSavingGoal(array $data)
    {
        return $this->savingGoalRepository->create($data);
    }

    public function updateSavingGoal(string $id, array $data)
    {
        return $this->savingGoalRepository->update($id, $data);
    }

    public function getSavingGoalById(string $id)
    {
        return $this->savingGoalRepository->getById($id);
    }

    public function deleteSavingGoal(string $id)
    {
        return $this->savingGoalRepository->delete($id);
    }

    public function getAccountList(): array
    {
        return $this->savingGoalRepository->getAccountList();
    }

    public function getCurrencyList(): array
    {
        return $this->savingGoalRepository->getCurrencyList();
    }

    public function addSaving(string $id, array $data)
    {
        return $this->savingGoalRepository->addSaving($id, $data);
    }
}
