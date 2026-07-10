<?php

namespace App\Http\Controllers;

use App\Constants\CategoryMessage;
use App\Constants\GlobalMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\Category\CategoryStoreRequest;
use App\Http\Requests\Category\CategoryUpdateRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PaginateResource;
use App\Services\CategoryService;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    private string $title               = CategoryMessage::TITLE;
    private string $subtitle            = CategoryMessage::SUBTITLE;
    private CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index()
    {
        return Inertia::render('Categories/Index', [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'parentCategories'  => CategoryResource::collection($this->categoryService->getCategoriesWithoutParentId()),
        ]);
    }

    public function getAllPaginated(Request $request)
    {
        $requestData = $request->validate([
            'search'        => 'nullable|string',
            'status'        => 'nullable|string',
            'type'          => 'nullable|string',
            'row_per_page'  => 'required|integer'
        ]);

        try {
            $categories = $this->categoryService->getAllPaginated(
                $requestData['search'] ?? null,
                $requestData['status'] ?? null,
                $requestData['type'] ?? null,
                $requestData['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, CategoryMessage::CATEGORY_RETRIEVED_SUCCESS, PaginateResource::make($categories, CategoryResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function store(CategoryStoreRequest $request)
    {
        $data = $request->validated();

        try {
            $category = $this->categoryService->createCategory($data);

            return ResponseHelper::jsonResponse(true, CategoryMessage::CATEGORY_CREATED_SUCCESS, new CategoryResource($category), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function update(CategoryUpdateRequest $request, Category $category)
    {
        $data = $request->validated();

        try {
            $category = $this->categoryService->updateCategory($category->id, $data);

            return ResponseHelper::jsonResponse(true, CategoryMessage::CATEGORY_UPDATED_SUCCESS, new CategoryResource($category), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(Category $category)
    {
        try {
            $categoryRecord = $this->categoryService->getCategoryById($category->id);

            if (!$categoryRecord) {
                return ResponseHelper::jsonResponse(false, GlobalMessage::NOT_FOUND, null, 404);
            }

            $this->categoryService->deleteCategory($categoryRecord->id);

            return ResponseHelper::jsonResponse(true, CategoryMessage::CATEGORY_DELETED_SUCCESS, null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
