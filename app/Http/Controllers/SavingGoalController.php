<?php

namespace App\Http\Controllers;

use App\Constants\SavingMessage;
use App\Helpers\ResponseHelper;
use App\Http\Resources\PaginateResource;
use App\Http\Resources\SavingResource;
use App\Interface\SavingGoalRepositoryInterface;
use Illuminate\Http\Request;

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
}
