<?php

namespace App\Interface;

interface BudgetRepositoryInterface
{
    public function getAll(
        ?string $search,
        ?string $status,
        ?string $period,
        ?string $limit,
        bool $execute
    );

    public function getAllPaginated(
        ?string $search,
        ?string $status,
        ?string $period,
        ?int $rowsPerPage,
    );

    public function create(array $data);

    public function update(string $id, array $data);

    public function getById(string $id);

    public function delete(string $id);
}
