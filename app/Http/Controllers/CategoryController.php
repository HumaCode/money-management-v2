<?php

namespace App\Http\Controllers;

use App\Constants\CategoryMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\CategoryStoreRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PaginateResource;
use App\Interface\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    private string $title               = CategoryMessage::TITLE;
    private string $subtitle            = CategoryMessage::SUBTITLE;
    private string $formView            = CategoryMessage::FORMVIEW;
    private string $indexView           = CategoryMessage::INDEXVIEW;

    private string $createUrl           = CategoryMessage::CREATEURL;
    private string $storeUrl            = CategoryMessage::STOREURL;

    private string $dataUrl             = CategoryMessage::PAGINATIONURL;
    private string $dataTableId         = CategoryMessage::TABLEID;


    private CategoryRepositoryInterface $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function index()
    {
        // Gate::authorize('read ' . $this->permissionAkses);

        $data = [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'createUrl'         => route($this->createUrl),
            'dataUrl'           => route($this->dataUrl),
            'dataTableId'       => $this->dataTableId,
            // 'permissionAkses'   => $this->permissionAkses,
        ];

        return view($this->indexView, $data);
    }

    public function getAllPaginated(Request $request)
    {
        $request = $request->validate([
            'search'        => 'nullable|string',
            'status'        => 'nullable|string',
            'type'        => 'nullable|string',
            'row_per_page'  => 'required|integer'
        ]);

        try {
            $categories = $this->categoryRepository->getAllPaginated(
                $request['search'] ?? null,
                $request['status'] ?? null,
                $request['type'] ?? null,
                $request['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, CategoryMessage::CATEGORY_RETRIEVED_SUCCESS, PaginateResource::make($categories, CategoryResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function create(Category $category)
    {
        return view($this->formView, [
            'action'        => route($this->storeUrl),
            'data'          => $category,
            'categories'    => $this->categoryRepository->getCategoriesWithoutParentId(),
        ]);
    }

    public function store(CategoryStoreRequest $request)
    {
        $request = $request->validated();

        try {
            $category = $this->categoryRepository->create($request);

            return ResponseHelper::jsonResponse(true, CategoryMessage::CATEGORY_RETRIEVED_SUCCESS, new CategoryResource($category), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
