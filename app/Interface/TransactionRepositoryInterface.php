<?php

namespace App\Interface;

interface TransactionRepositoryInterface
{
    public function getAll(
        ?string $search = null,
        ?string $type = null,
        ?string $categoryId = null,
        ?string $accountId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $limit = null,
        bool $execute = true
    );

    public function getAllPaginated(
        ?string $search = null,
        ?string $type = null,
        ?string $categoryId = null,
        ?string $accountId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?int $rowsPerPage = 10
    );

    public function create(array $data);

    public function update(string $id, array $data);

    public function getById(string $id);

    public function delete(string $id);

    public function getAccountList();

    public function getCategoryList(?string $type = null);

    public function getCurrencyList();
}
