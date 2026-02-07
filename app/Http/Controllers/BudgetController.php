<?php

namespace App\Http\Controllers;

use App\Constants\BudgetMessage;
use App\Constants\GlobalMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\Budget\BudgetStoreExpenseRequest;
use App\Http\Requests\Budget\BudgetStoreRequest;
use App\Http\Requests\Budget\BudgetUpdateRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\PaginateResource;
use App\Interface\BudgetRepositoryInterface;
use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    private string $title               = BudgetMessage::TITLE;
    private string $subtitle            = BudgetMessage::SUBTITLE;
    private string $formView            = BudgetMessage::FORMVIEW;
    private string $formViewAddExpenses = BudgetMessage::FORMVIEW_ADD_EXPENSES;
    private string $indexView           = BudgetMessage::INDEXVIEW;

    private string $createUrl           = BudgetMessage::CREATEURL;
    private string $editUrl             = BudgetMessage::EDITURL;
    private string $addExpensesUrl      = BudgetMessage::ADDEXPENSESURL;
    private string $storeExpensesUrl    = BudgetMessage::STOREEXPENSESURL;
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
            'addExpensesUrl'    => route($this->addExpensesUrl, ['budget' => '__ID__']),
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

    public function create(Budget $budget)
    {
        return view($this->formView, [
            'action'            => route($this->storeUrl),
            'data'              => $budget,
            'CurrencyList'      => $this->budgetRepository->getCurrencyList(),
            'PeriodList'        => $this->budgetRepository->getPeriodList(),
        ]);
    }

    public function store(BudgetStoreRequest $request)
    {
        $request = $request->validated();

        try {
            $budget = $this->budgetRepository->create($request);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_CREATED_SUCCESS, new BudgetResource($budget), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function addExpenses(Budget $budget)
    {
        return view($this->formViewAddExpenses, [
            'action'            => route($this->storeExpensesUrl, ['budget' => $budget->id]),
            'data'              => $budget,
            'categories'        => $this->budgetRepository->getCategoryList(),
        ]);
    }

    public function storeExpenses(BudgetStoreExpenseRequest $request, Budget $budget)
    {
        $request =  $request->validated();

        try {
            $budgetexpense = $this->budgetRepository->budgetExpenses($budget->id, $request);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_EXPENSE_ADDED_SUCCESS, new BudgetResource($budgetexpense), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function edit(Budget $budget)
    {
        return view($this->formView, [
            'action'            => route($this->updateUrl, ['budget' => $budget->id]),
            'data'              => $budget,
            'CurrencyList'      => $this->budgetRepository->getCurrencyList(),
            'PeriodList'        => $this->budgetRepository->getPeriodList(),
        ]);
    }

    public function update(BudgetUpdateRequest $request, Budget $budget)
    {
        $request = $request->validated();

        try {
            $budget = $this->budgetRepository->update($budget->id, $request);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_UPDATED_SUCCESS, new BudgetResource($budget), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(Budget $budget)
    {

        try {
            $budget = $this->budgetRepository->getById($budget->id);
            if (!$budget) {
                return ResponseHelper::jsonResponse(false, GlobalMessage::NOT_FOUND, null, 404);
            }

            $this->budgetRepository->delete($budget->id);

            return ResponseHelper::jsonResponse(true, BudgetMessage::BUDGET_DELETED_SUCCESS, null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
