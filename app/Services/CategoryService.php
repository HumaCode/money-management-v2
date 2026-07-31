<?php

namespace App\Services;

use App\Interface\CategoryRepositoryInterface;

class CategoryService
{
    private CategoryRepositoryInterface $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAllPaginated(?string $search, ?string $status, ?string $type, int $rowsPerPage)
    {
        return $this->categoryRepository->getAllPaginated($search, $status, $type, $rowsPerPage);
    }

    public function getCategoriesWithoutParentId()
    {
        return $this->categoryRepository->getCategoriesWithoutParentId();
    }

    public function createCategory(array $data)
    {
        return $this->categoryRepository->create($data);
    }

    public function updateCategory(string $id, array $data)
    {
        return $this->categoryRepository->update($id, $data);
    }

    public function getCategoryById(string $id)
    {
        return $this->categoryRepository->getById($id);
    }

    public function deleteCategory(string $id)
    {
        return $this->categoryRepository->delete($id);
    }
}
