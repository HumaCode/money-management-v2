<?php

namespace App\Constants;

class TransactionMessage
{
    const TITLE                                 = 'Transactions';
    const SUBTITLE                              = 'Manage and track all income and expense transactions';
    const FORMVIEW                              = 'pages.transactions.transaction-form';
    const INDEXVIEW                             = 'pages.transactions.index';

    const PAGINATIONURL                         = 'transaction.allPagination';
    const CREATEURL                             = 'transaction.create';
    const EDITURL                               = 'transaction.edit';
    const STOREURL                              = 'transaction.store';
    const UPDATEURL                             = 'transaction.update';
    const DESTROYURL                            = 'transaction.destroy';

    const TABLEID                               = 'table-transaction';

    const TRANSACTION_RETRIEVED_SUCCESS         = 'Transaction data retrieved successfully';
    const TRANSACTION_CREATED_SUCCESS           = 'Transaction created successfully';
    const TRANSACTION_UPDATED_SUCCESS           = 'Transaction updated successfully';
    const TRANSACTION_DELETED_SUCCESS           = 'Transaction deleted successfully';
}
