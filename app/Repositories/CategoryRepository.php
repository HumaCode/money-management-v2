<?php

namespace App\Repositories;

use App\Interface\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
                $query->active();
            }

            if ($status === 'inactive') {
                $query->where('is_active', 0);
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
        $query->orderBy('id', 'desc');

        // Eager loading jika diperlukan
        $query->with(['parent', 'children', 'user']);

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
        DB::beginTransaction();
        try {
            $category = new Category();
            $category->user_id      = user('id');
            $category->parent_id    = $data['parent_id'] ?? null;
            $category->name         = $data['name'];
            $category->slug         = Str::of($data['name'])->slug('-');
            $category->type         = $data['type'];
            $category->icon         = $data['icon'] ?? null;
            $category->color        = $data['color'] ?? null;
            $category->is_active    = '1';
            $category->save();

            DB::commit();

            return $category;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error creating category: ' . $e->getMessage());
        }
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

    public function getCategoriesWithoutParentId()
    {
        return Category::active()->whereNull('parent_id')
            ->orderBy('name', 'asc')
            ->get();
    }
}
