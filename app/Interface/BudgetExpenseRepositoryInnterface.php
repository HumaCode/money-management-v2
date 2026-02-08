<?php

namespace App\Interface;

interface BudgetExpenseRepositoryInnterface
{
    public function getAll(
        ?string $search,
        ?string $limit,
        bool $execute
    );

    public function getAllPaginated(
        ?string $search,
        ?int $rowsPerPage,
    );

    public function update(string $id, array $data);

    public function getById(string $id);

    public function delete(string $id);
}
