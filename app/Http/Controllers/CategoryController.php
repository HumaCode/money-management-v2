<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\CategoryStoreRequest;
use App\Http\Resources\CategoryResource;
use App\Interface\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    private CategoryRepositoryInterface $categoryRepository;
    private string $permissionAkses = 'categories';
    private string $indexView = 'pages.categories.index';
    private string $createView = 'categories.create';
    private string $editView = 'categories.edit';

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function index()
    {
        // Gate::authorize('read ' . $this->permissionAkses);

        $data = [
            'title'             => 'Categories',
            // 'permissionAkses'   => $this->permissionAkses,
        ];

        return view($this->indexView, $data);
    }

    public function create(Category $category)
    {
          // Get all active parent categories for dropdown
        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        return view('pages.categories.category-form', [
            'action'        => route('category.store'),
            'data'          => $category,
            'categories'    => $categories,
        ]);
    }

    public function store(CategoryStoreRequest $request)
    {
        $request = $request->validated();

        try {
            $category = $this->categoryRepository->create($request);

            return ResponseHelper::jsonResponse(true, 'Category successfully created.', new CategoryResource($category), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
