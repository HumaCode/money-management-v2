<?php

namespace App\Interface;

interface TransactionRepositoryInterface
{
    public function getAll(
        ?string $search,
        ?string $type,
        ?string $categoryId,
        ?string $limit,
        bool $execute
    );

    public function getAllPaginated(
        ?string $search,
        ?string $type,
        ?string $categoryId,
        ?int $rowsPerPage
    );

    public function create(array $data);

    public function update(string $id, array $data);

    public function getById(string $id);

    public function delete(string $id);

    public function getAccountList();

    public function getCategoryList(?string $type = null);

    public function getCurrencyList();
}
