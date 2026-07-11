<?php

namespace App\Http\Controllers;

use App\Constants\SavingMessage;
use App\Constants\GlobalMessage;
use App\Helpers\ResponseHelper;
use App\Http\Requests\SavingGoal\SavingGoalStoreRequest;
use App\Http\Requests\SavingGoal\SavingGoalUpdateRequest;
use App\Http\Resources\SavingResource;
use App\Http\Resources\PaginateResource;
use App\Models\SavingsGoal;
use App\Services\SavingGoalService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavingGoalController extends Controller
{
    private string $title    = SavingMessage::TITLE;
    private string $subtitle = SavingMessage::SUBTITLE;
    private SavingGoalService $savingGoalService;

    public function __construct(SavingGoalService $savingGoalService)
    {
        $this->savingGoalService = $savingGoalService;
    }

    public function index()
    {
        return Inertia::render('SavingGoals/Index', [
            'title'      => $this->title,
            'subtitle'   => $this->subtitle,
            'currencies' => $this->savingGoalService->getCurrencyList(),
            'accounts'   => $this->savingGoalService->getAccountList(),
            'statuses'   => ['active', 'paused', 'completed', 'cancelled'],
        ]);
    }

    public function getAllPaginated(Request $request)
    {
        $data = $request->validate([
            'search'       => 'nullable|string',
            'status'       => 'nullable|string',
            'row_per_page' => 'required|integer',
            'page'         => 'nullable|integer',
        ]);

        try {
            $savingGoals = $this->savingGoalService->getAllPaginated(
                $data['search'] ?? null,
                $data['status'] ?? null,
                $data['row_per_page'],
            );

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_RETRIEVED_SUCCESS, PaginateResource::make($savingGoals, SavingResource::class), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function store(SavingGoalStoreRequest $request)
    {
        $data = $request->validated();

        try {
            $savingGoal = $this->savingGoalService->createSavingGoal($data);

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_CREATED_SUCCESS, new SavingResource($savingGoal), 201);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function update(SavingGoalUpdateRequest $request, SavingsGoal $saving)
    {
        $data = $request->validated();

        try {
            $savingGoal = $this->savingGoalService->updateSavingGoal($saving->id, $data);

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_UPDATED_SUCCESS, new SavingResource($savingGoal), 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }

    public function destroy(SavingsGoal $saving)
    {
        try {
            $record = $this->savingGoalService->getSavingGoalById($saving->id);
            if (!$record) {
                return ResponseHelper::jsonResponse(false, GlobalMessage::NOT_FOUND, null, 404);
            }

            $this->savingGoalService->deleteSavingGoal($record->id);

            return ResponseHelper::jsonResponse(true, SavingMessage::SAVING_DELETED_SUCCESS, null, 200);
        } catch (\Exception $e) {
            return ResponseHelper::jsonResponse(false, $e->getMessage(), null, 500);
        }
    }
}
