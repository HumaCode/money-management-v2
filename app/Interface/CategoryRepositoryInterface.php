<?php

namespace App\Interface;

interface CategoryRepositoryInterface
{
    public function getAll(
        ?string $search,
        ?string $status,
        ?string $type,
        ?string $limit,
        bool $execute
    );

    public function getAllPaginated(
        ?string $search,
        ?string $status,
        ?string $type,
        ?int $rowsPerPage,
    );

    public function create(array $data);

    public function update(string $id, array $data);

    public function getById(string $id);

    public function delete(string $id);
}
