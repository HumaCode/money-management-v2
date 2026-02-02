<?php

namespace App\Http\Controllers;

use App\Interface\CategoryRepositoryInterface;
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
}
