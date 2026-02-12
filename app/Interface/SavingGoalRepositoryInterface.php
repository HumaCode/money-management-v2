<?php

namespace App\Interface;

interface SavingGoalRepositoryInterface
{
    public function getAll(
        ?string $search,
        ?string $status,
        ?string $limit,
        bool $execute
    );

    public function getAllPaginated(
        ?string $search,
        ?string $status,
        ?int $rowsPerPage,
    );

    public function create(array $data);

    public function update(string $id, array $data);

    public function getById(string $id);

    public function delete(string $id);
}
