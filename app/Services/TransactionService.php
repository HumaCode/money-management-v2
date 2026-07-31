<?php

namespace App\Services;

use App\Interface\TransactionRepositoryInterface;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    protected TransactionRepositoryInterface $transactionRepository;

    public function __construct(TransactionRepositoryInterface $transactionRepository)
    {
        $this->transactionRepository = $transactionRepository;
    }

    public function getAllPaginated(?string $search, ?string $type, ?string $categoryId, ?int $rowsPerPage)
    {
        return $this->transactionRepository->getAllPaginated($search, $type, $categoryId, $rowsPerPage);
    }

    public function createTransaction(array $data)
    {
        DB::beginTransaction();

        try {
            $transaction = $this->transactionRepository->create($data);
            DB::commit();

            return $transaction;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateTransaction(string $id, array $data)
    {
        DB::beginTransaction();

        try {
            $transaction = $this->transactionRepository->update($id, $data);
            DB::commit();

            return $transaction;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteTransaction(string $id)
    {
        DB::beginTransaction();

        try {
            $result = $this->transactionRepository->delete($id);
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
            'AccountList'  => $this->transactionRepository->getAccountList(),
            'CategoryList' => $this->transactionRepository->getCategoryList(),
            'CurrencyList' => $this->transactionRepository->getCurrencyList(),
        ];
    }
}
