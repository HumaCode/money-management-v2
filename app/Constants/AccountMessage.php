<?php

namespace App\Constants;

class AccountMessage
{
    const TITLE                                 = 'Manage Accounts';
    const SUBTITLE                              = 'Track all your financial accounts in one place';
    const FORMVIEW                              = 'pages.accounts.account-form';
    const INDEXVIEW                             = 'pages.accounts.index';

    const PAGINATIONURL                         = 'account.allPagination';
    const CREATEURL                             = 'account.create';
    const EDITURL                               = 'account.edit';
    const SHOWURL                               = 'account.show';
    const STOREURL                              = 'account.store';
    const UPDATEURL                             = 'account.update';
    const DESTROYURL                            = 'account.destroy';

    const TABLEID                               = 'table-account';


    const ACCOUNT_RETRIEVED_SUCCESS            = 'Account data retrieved successfully';
    const ACCOUNT_CREATED_SUCCESS              = 'Account created successfully';
    const ACCOUNT_UPDATED_SUCCESS              = 'Account updated successfully';
    const ACCOUNT_DELETED_SUCCESS              = 'Account deleted successfully';
}
