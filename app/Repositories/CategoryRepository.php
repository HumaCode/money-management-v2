<?php

namespace App\Repositories;

use App\Interface\CategoryRepositoryInterface;
use App\Models\Category;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function getAll(?string $search, ?string $status, ?string $type, ?string $limit, bool $execute)
    {
        $query = Category::query();

        // Search filter
        if ($search) {
            $query->search($search);
        }

        // Status filter
        if ($status && $status !== 'all') {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Type filter
        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        // Limit
        if ($limit) {
            $query->take((int)$limit);
        }

        // Order by
        $query->orderBy('id', 'asc');

        // Eager loading jika diperlukan
        // $query->with(['parent', 'children', 'user']);

        // Execute or return query builder
        if ($execute) {
            return $query->get();
        }

        return $query;
    }

    public function getAllPaginated(?string $search, ?string $status, ?string $type, ?int $rowsPerPage)
    {
        return $this->getAll($search, $status, $type, null, false)
            ->paginate($rowsPerPage);
    }

    public function getById(string $id)
    {
        $query = Category::where('id', $id);
        return $query->first();
    }

    public function create(array $data)
    {
        return Category::create($data);
    }

    public function update(string $id, array $data)
    {
        $category = $this->getById($id);

        if (!$category) {
            return false;
        }

        return $category->update($data);
    }

    public function toggleStatus(string $id)
    {
        $category = $this->getById($id);

        if (!$category) {
            return false;
        }

        return $category->update([
            'is_active' => !$category->is_active
        ]);
    }

    public function delete(string $id)
    {
        $category = $this->getById($id);

        if (!$category) {
            return false;
        }

        return $category->delete();
    }

}