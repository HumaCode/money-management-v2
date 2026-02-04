<?php

namespace App\Http\Controllers;

use App\Constants\AccountMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\Account\AccountStoreRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\PaginateResource;
use App\Interface\AccountRepositoryInterface;
use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    private string $title               = AccountMessage::TITLE;
    private string $subtitle            = AccountMessage::SUBTITLE;
    private string $formView            = AccountMessage::FORMVIEW;
    private string $indexView           = AccountMessage::INDEXVIEW;

    private string $createUrl           = AccountMessage::CREATEURL;
    private string $editUrl             = AccountMessage::EDITURL;
    private string $showUrl             = AccountMessage::SHOWURL;
    private string $storeUrl            = AccountMessage::STOREURL;
    private string $updateUrl           = AccountMessage::UPDATEURL;
    private string $destroyUrl          = AccountMessage::DESTROYURL;

    private string $dataUrl             = AccountMessage::PAGINATIONURL;
    private string $dataTableId         = AccountMessage::TABLEID;


    private AccountRepositoryInterface $accountRepository;

    public function __construct(AccountRepositoryInterface $accountRepository)
    {
        $this->accountRepository = $accountRepository;
    }

    public function index()
    {
        // Gate::authorize('read ' . $this->permissionAkses);

        $data = [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'createUrl'         => route($this->createUrl),
            'editUrl'           => route($this->editUrl, ['account' => '__ID__']),
            'showUrl'           => route($this->showUrl, ['account' => '__ID__']),
            'destroyUrl'        => route($this->destroyUrl, ['account' => '__ID__']),
            'dataUrl'           => route($this->dataUrl),
            'dataTableId'       => $this->dataTableId,
            'AccountTypeList'   => $this->accountRepository->getAccountTypeList(),
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
            $accounts = $this->accountRepository->getAllPaginated(
                $request['search'] ?? null,
                $request['status'] ?? null,
                $request['type'] ?? null,
                $request['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, AccountMessage::ACCOUNT_RETRIEVED_SUCCESS, PaginateResource::make($accounts, AccountResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function create(Account $account)
    {
        return view($this->formView, [
            'action'            => route($this->storeUrl),
            'data'              => $account,
            'CurrencyList'      => $this->accountRepository->getCurrencyList(),
            'AccountTypeList'   => $this->accountRepository->getAccountTypeList(),
        ]);
    }

    public function store(AccountStoreRequest $request)
    {
        $request = $request->validated();

        try {
            $account = $this->accountRepository->create($request);

            return ResponseHelper::jsonResponse(true, AccountMessage::ACCOUNT_CREATED_SUCCESS, new AccountResource($account), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
