<?php

namespace App\Constants;

class BudgetMessage
{
    const TITLE                                 = 'Manage Budgets';
    const SUBTITLE                              = 'Set spending limits and track your financial goals';
    const FORMVIEW                              = 'pages.budgets.budget-form';
    const INDEXVIEW                             = 'pages.budgets.index';

    const PAGINATIONURL                         = 'budget.allPagination';
    const CREATEURL                             = 'budget.create';
    const EDITURL                               = 'budget.edit';
    const SHOWURL                               = 'budget.show';
    const STOREURL                              = 'budget.store';
    const UPDATEURL                             = 'budget.update';
    const DESTROYURL                            = 'budget.destroy';

    const TABLEID                               = 'table-budget';


    const BUDGET_RETRIEVED_SUCCESS            = 'Budget data retrieved successfully';
    const BUDGET_CREATED_SUCCESS              = 'Budget created successfully';
    const BUDGET_UPDATED_SUCCESS              = 'Budget updated successfully';
    const BUDGET_DELETED_SUCCESS              = 'Budget deleted successfully';
}
