<?php

namespace App\Http\Controllers;

use App\Constants\BudgetMessage;
use App\Helpers\ResponseHelper;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\PaginateResource;
use App\Interface\BudgetRepositoryInterface;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    private string $title               = BudgetMessage::TITLE;
    private string $subtitle            = BudgetMessage::SUBTITLE;
    private string $formView            = BudgetMessage::FORMVIEW;
    private string $indexView           = BudgetMessage::INDEXVIEW;

    private string $createUrl           = BudgetMessage::CREATEURL;
    private string $editUrl             = BudgetMessage::EDITURL;
    private string $showUrl             = BudgetMessage::SHOWURL;
    private string $storeUrl            = BudgetMessage::STOREURL;
    private string $updateUrl           = BudgetMessage::UPDATEURL;
    private string $destroyUrl          = BudgetMessage::DESTROYURL;

    private string $dataUrl             = BudgetMessage::PAGINATIONURL;
    private string $dataTableId         = BudgetMessage::TABLEID;


    private BudgetRepositoryInterface $budgetRepository;

    public function __construct(BudgetRepositoryInterface $budgetRepository)
    {
        $this->budgetRepository = $budgetRepository;
    }

    public function index()
    {
        // Gate::authorize('read ' . $this->permissionAkses);

        $data = [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'createUrl'         => route($this->createUrl),
            'editUrl'           => route($this->editUrl, ['budget' => '__ID__']),
            'showUrl'           => route($this->showUrl, ['budget' => '__ID__']),
            'destroyUrl'        => route($this->destroyUrl, ['budget' => '__ID__']),
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
            'period'        => 'nullable|string',
            'row_per_page'  => 'required|integer'
        ]);

        try {
            $accounts = $this->budgetRepository->getAllPaginated(
                $request['search'] ?? null,
                $request['status'] ?? null,
                $request['period'] ?? null,
                $request['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_RETRIEVED_SUCCESS, PaginateResource::make($accounts, BudgetResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
