<?php

namespace App\Services;

use App\Interface\RecurringTransactionRepositoryInterface;
use Illuminate\Support\Facades\DB;

class RecurringTransactionService
{
    protected RecurringTransactionRepositoryInterface $recurringRepository;

    public function __construct(RecurringTransactionRepositoryInterface $recurringRepository)
    {
        $this->recurringRepository = $recurringRepository;
    }

    public function createRecurring(array $data)
    {
        DB::beginTransaction();
        try {
            $recurring = $this->recurringRepository->create($data);
            DB::commit();

            return $recurring;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateRecurring(string $id, array $data)
    {
        DB::beginTransaction();
        try {
            $recurring = $this->recurringRepository->update($id, $data);
            DB::commit();

            return $recurring;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteRecurring(string $id)
    {
        DB::beginTransaction();
        try {
            $result = $this->recurringRepository->delete($id);
            DB::commit();

            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getFormData()
    {
        return [
            'AccountList'  => $this->recurringRepository->getAccountList(),
            'CategoryList' => $this->recurringRepository->getCategoryList(),
            'CurrencyList' => $this->recurringRepository->getCurrencyList(),
        ];
    }
}
