<?php

namespace App\Http\Controllers;

use App\Constants\BudgetExpenseMessage;
use App\Interface\BudgetExpenseRepositoryInnterface;
use Illuminate\Http\Request;

class BudgetExpenseController extends Controller
{
    private string $title               = BudgetExpenseMessage::TITLE;
    private string $subtitle            = BudgetExpenseMessage::SUBTITLE;
    private string $formView            = BudgetExpenseMessage::FORMVIEW;
    private string $indexView           = BudgetExpenseMessage::INDEXVIEW;

    private string $createUrl           = BudgetExpenseMessage::CREATEURL;
    private string $editUrl             = BudgetExpenseMessage::EDITURL;
    private string $storeUrl            = BudgetExpenseMessage::STOREURL;
    private string $updateUrl           = BudgetExpenseMessage::UPDATEURL;
    private string $destroyUrl          = BudgetExpenseMessage::DESTROYURL;

    private string $dataUrl             = BudgetExpenseMessage::PAGINATIONURL;
    private string $dataTableId         = BudgetExpenseMessage::TABLEID;

    private BudgetExpenseRepositoryInnterface $budgetExpenseRepository;

    public function __construct(BudgetExpenseRepositoryInnterface $budgetExpenseRepository)
    {
        $this->budgetExpenseRepository = $budgetExpenseRepository;
    }

    public function index()
    {
        // Gate::authorize('read ' . $this->permissionAkses);

        $data = [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'editUrl'           => route($this->editUrl, ['budgetExpense' => '__ID__']),
            'destroyUrl'        => route($this->destroyUrl, ['budgetExpense' => '__ID__']),
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
