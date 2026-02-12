<?php

namespace App\Constants;

class SavingMessage
{
    const TITLE                                 = 'Savings Goals';
    const SUBTITLE                              = 'Set and track your savings targets';
    const FORMVIEW                              = 'pages.saving-goals.saving-form';
    const INDEXVIEW                             = 'pages.saving-goals.index';

    const PAGINATIONURL                         = 'saving.goals.allPagination';
    const CREATEURL                             = 'saving.goals.create';
    const EDITURL                               = 'saving.goals.edit';
    const STOREURL                              = 'saving.goals.store';
    const UPDATEURL                             = 'saving.goals.update';
    const DESTROYURL                            = 'saving.goals.destroy';

    const TABLEID                               = 'table-saving';


    const SAVING_RETRIEVED_SUCCESS            = 'Saving goal data retrieved successfully';
    const SAVING_CREATED_SUCCESS              = 'Saving goal created successfully';
    const SAVING_EXPENSE_ADDED_SUCCESS        = 'Saving goal expense added successfully';
    const SAVING_UPDATED_SUCCESS              = 'Saving goal updated successfully';
    const SAVING_DELETED_SUCCESS              = 'Saving goal deleted successfully';
}
