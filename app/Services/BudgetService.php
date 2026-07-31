<?php

namespace App\Services;

use App\Interface\BudgetRepositoryInterface;

class BudgetService
{
    private BudgetRepositoryInterface $budgetRepository;

    public function __construct(BudgetRepositoryInterface $budgetRepository)
    {
        $this->budgetRepository = $budgetRepository;
    }

    public function getAllPaginated(?string $search, ?string $status, ?string $period, int $rowsPerPage)
    {
        return $this->budgetRepository->getAllPaginated($search, $status, $period, $rowsPerPage);
    }

    public function createBudget(array $data)
    {
        return $this->budgetRepository->create($data);
    }

    public function updateBudget(string $id, array $data)
    {
        return $this->budgetRepository->update($id, $data);
    }

    public function getBudgetById(string $id)
    {
        return $this->budgetRepository->getById($id);
    }

    public function deleteBudget(string $id)
    {
        return $this->budgetRepository->delete($id);
    }

    public function addExpenses(string $id, array $data)
    {
        return $this->budgetRepository->budgetExpenses($id, $data);
    }

    public function getPeriodList(): array
    {
        return $this->budgetRepository->getPeriodList();
    }

    public function getCurrencyList(): array
    {
        return $this->budgetRepository->getCurrencyList();
    }

    public function getCategoryList(): array
    {
        return $this->budgetRepository->getCategoryList();
    }
}
