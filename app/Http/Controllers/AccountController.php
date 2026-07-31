<?php

namespace App\Http\Controllers;

use App\Constants\AccountMessage;
use App\Constants\GlobalMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\Account\AccountStoreRequest;
use App\Http\Requests\Account\AccountUpdateRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\PaginateResource;
use App\Services\AccountService;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    private string $title               = AccountMessage::TITLE;
    private string $subtitle            = AccountMessage::SUBTITLE;
    private AccountService $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function index()
    {
        return Inertia::render('Accounts/Index', [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'accountTypes'      => $this->accountService->getAccountTypeList(),
            'currencies'        => $this->accountService->getCurrencyList(),
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
            $accounts = $this->accountService->getAllPaginated(
                $requestData['search'] ?? null,
                $requestData['status'] ?? null,
                $requestData['type'] ?? null,
                $requestData['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, AccountMessage::ACCOUNT_RETRIEVED_SUCCESS, PaginateResource::make($accounts, AccountResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function store(AccountStoreRequest $request)
    {
        $data = $request->validated();

        try {
            $account = $this->accountService->createAccount($data);

            return ResponseHelper::jsonResponse(true, AccountMessage::ACCOUNT_CREATED_SUCCESS, new AccountResource($account), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function update(AccountUpdateRequest $request, Account $account)
    {
        $data = $request->validated();

        try {
            $account = $this->accountService->updateAccount($account->id, $data);

            return ResponseHelper::jsonResponse(true, AccountMessage::ACCOUNT_UPDATED_SUCCESS, new AccountResource($account), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(Account $account)
    {
        try {
            $accountRecord = $this->accountService->getAccountById($account->id);
            if (!$accountRecord) {
                return ResponseHelper::jsonResponse(false, GlobalMessage::NOT_FOUND, null, 404);
            }

            $this->accountService->deleteAccount($accountRecord->id);

            return ResponseHelper::jsonResponse(true, AccountMessage::ACCOUNT_DELETED_SUCCESS, null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
