<?php

namespace App\Http\Controllers;

use App\Constants\SavingMessage;
use App\Helpers\ResponseHelper;
use App\Http\Resources\PaginateResource;
use App\Http\Resources\SavingResource;
use App\Interface\SavingGoalRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SavingGoalController extends Controller
{
    private string $title               = SavingMessage::TITLE;
    private string $subtitle            = SavingMessage::SUBTITLE;
    private string $formView            = SavingMessage::FORMVIEW;
    private string $indexView           = SavingMessage::INDEXVIEW;

    private string $createUrl           = SavingMessage::CREATEURL;
    private string $editUrl             = SavingMessage::EDITURL;
    private string $storeUrl            = SavingMessage::STOREURL;
    private string $updateUrl           = SavingMessage::UPDATEURL;
    private string $destroyUrl          = SavingMessage::DESTROYURL;

    private string $dataUrl             = SavingMessage::PAGINATIONURL;
    private string $dataTableId         = SavingMessage::TABLEID;

    private SavingGoalRepositoryInterface $savingGoalRepository;

    public function __construct(SavingGoalRepositoryInterface $savingGoalRepository)
    {
        $this->savingGoalRepository = $savingGoalRepository;
    }

    public function index()
    {
        // Gate::authorize('read ' . $this->permissionAkses);

        $data = [
            'title'             => $this->title,
            'subtitle'          => $this->subtitle,
            'createUrl'         => route($this->createUrl),
            'editUrl'           => route($this->editUrl, ['saving' => '__ID__']),
            'destroyUrl'        => route($this->destroyUrl, ['saving' => '__ID__']),
            'dataUrl'           => route($this->dataUrl),
            'dataTableId'       => $this->dataTableId,
        ];

        return view($this->indexView, $data);
    }

    public function getAllPaginated(Request $request)
    {
        $request = $request->validate([
            'search'        => 'nullable|string',
            'status'        => 'nullable|string',
            'row_per_page'  => 'required|integer'
        ]);

        try {
            $saving = $this->savingGoalRepository->getAllPaginated(
                $request['search'] ?? null,
                $request['status'] ?? null,
                $request['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_RETRIEVED_SUCCESS, PaginateResource::make($saving, SavingResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function create(\App\Models\SavingsGoal $saving)
    {
        return view($this->formView, [
            'action'            => route($this->storeUrl),
            'data'              => $saving,
            'AccountList'       => $this->savingGoalRepository->getAccountList(),
            'CurrencyList'      => $this->savingGoalRepository->getCurrencyList(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'account_id'     => 'required|exists:accounts,id',
            'currency_id'    => 'required|exists:currencies,id',
            'target_amount'  => 'required|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'monthly_target' => 'nullable|numeric|min:0',
            'target_date'    => 'required|date',
            'icon'           => 'nullable|string|max:10',
            'color'          => 'nullable|string|max:50',
            'description'    => 'nullable|string',
        ]);

        try {
            $saving = $this->savingGoalRepository->create($validated);

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_CREATED_SUCCESS, new SavingResource($saving), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function edit(\App\Models\SavingsGoal $saving)
    {
        Gate::authorize('update', $saving);

        return view($this->formView, [
            'action'            => route($this->updateUrl, ['saving' => $saving->id]),
            'data'              => $saving,
            'AccountList'       => $this->savingGoalRepository->getAccountList(),
            'CurrencyList'      => $this->savingGoalRepository->getCurrencyList(),
        ]);
    }

    public function update(Request $request, \App\Models\SavingsGoal $saving)
    {
        Gate::authorize('update', $saving);

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'account_id'     => 'required|exists:accounts,id',
            'currency_id'    => 'required|exists:currencies,id',
            'target_amount'  => 'required|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'monthly_target' => 'nullable|numeric|min:0',
            'target_date'    => 'required|date',
            'status'         => 'nullable|string',
            'icon'           => 'nullable|string|max:10',
            'color'          => 'nullable|string|max:50',
            'description'    => 'nullable|string',
        ]);

        try {
            $saving = $this->savingGoalRepository->update($saving->id, $validated);

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_UPDATED_SUCCESS, new SavingResource($saving), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(\App\Models\SavingsGoal $saving)
    {
        Gate::authorize('delete', $saving);

        try {
            $this->savingGoalRepository->delete($saving->id);

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_DELETED_SUCCESS, null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function depositForm(\App\Models\SavingsGoal $saving)
    {
        Gate::authorize('update', $saving);
        $saving->load(['currency']);

        return view('pages.saving-goals.saving-deposit-form', [
            'action' => route('saving.goals.storeDeposit', ['saving' => $saving->id]),
            'data'   => $saving,
        ]);
    }

    public function storeDeposit(Request $request, \App\Models\SavingsGoal $saving)
    {
        Gate::authorize('update', $saving);

        $validated = $request->validate([
            'amount'         => 'required|numeric|min:0.01',
            'contributed_at' => 'required|date',
            'notes'          => 'nullable|string',
        ]);

        try {
            $updatedSaving = $this->savingGoalRepository->addDeposit($saving->id, $validated);

            return ResponseHelper::jsonResponse(true, 'Setor tabungan berhasil disimpan', new SavingResource($updatedSaving), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function history(\App\Models\SavingsGoal $saving)
    {
        Gate::authorize('view', $saving);

        $saving->load(['currency', 'contributions' => function($q) {
            $q->orderBy('contributed_at', 'desc');
        }]);

        return view('pages.saving-goals.saving-history', [
            'data' => $saving,
        ]);
    }

    public function editContribution(\App\Models\SavingsGoalContribution $contribution)
    {
        Gate::authorize('update', $contribution->savingsGoal);

        return view('pages.saving-goals.saving-contribution-edit-form', [
            'action' => route('saving.contributions.update', ['contribution' => $contribution->id]),
            'data'   => $contribution,
        ]);
    }

    public function updateContribution(Request $request, \App\Models\SavingsGoalContribution $contribution)
    {
        Gate::authorize('update', $contribution->savingsGoal);

        $validated = $request->validate([
            'amount'         => 'required|numeric|min:0.01',
            'contributed_at' => 'required|date',
            'notes'          => 'nullable|string',
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            $contribution->update($validated);
            \Illuminate\Support\Facades\DB::commit();

            return ResponseHelper::jsonResponse(true, 'Riwayat setoran berhasil diperbarui', null, 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroyContribution(\App\Models\SavingsGoalContribution $contribution)
    {
        Gate::authorize('delete', $contribution->savingsGoal);

        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            $contribution->delete();
            \Illuminate\Support\Facades\DB::commit();

            return ResponseHelper::jsonResponse(true, 'Riwayat setoran berhasil dihapus', null, 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
