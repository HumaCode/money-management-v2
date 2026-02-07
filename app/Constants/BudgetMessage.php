<?php

namespace App\Constants;

class BudgetMessage
{
    const TITLE                                 = 'Manage Budgets';
    const SUBTITLE                              = 'Set spending limits and track your financial goals';
    const FORMVIEW                              = 'pages.budgets.budget-form';
    const FORMVIEW_ADD_EXPENSES                 = 'pages.budgets.budget-form-add-expenses';
    const INDEXVIEW                             = 'pages.budgets.index';

    const PAGINATIONURL                         = 'budget.allPagination';
    const CREATEURL                             = 'budget.create';
    const EDITURL                               = 'budget.edit';
    const ADDEXPENSESURL                        = 'budget.addExpenses';
    const STOREEXPENSESURL                      = 'budget.storeExpenses';
    const STOREURL                              = 'budget.store';
    const UPDATEURL                             = 'budget.update';
    const DESTROYURL                            = 'budget.destroy';

    const TABLEID                               = 'table-budget';


    const BUDGET_RETRIEVED_SUCCESS            = 'Budget data retrieved successfully';
    const BUDGET_CREATED_SUCCESS              = 'Budget created successfully';
    const BUDGET_EXPENSE_ADDED_SUCCESS        = 'Budget expense added successfully';
    const BUDGET_UPDATED_SUCCESS              = 'Budget updated successfully';
    const BUDGET_DELETED_SUCCESS              = 'Budget deleted successfully';
}
