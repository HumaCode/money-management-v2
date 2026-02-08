<?php

namespace App\Constants;

class BudgetExpenseMessage
{
    const TITLE                                 = 'Budget Expenses Management';
    const SUBTITLE                              = 'Manage expense allocations for this budget';
    const FORMVIEW                              = 'pages.budget-expenses.budget-expense-form';
    const INDEXVIEW                             = 'pages.budget-expenses.index';

    const PAGINATIONURL                         = 'budget.expense.allPagination';
    const CREATEURL                             = 'budget.expense.create';
    const EDITURL                               = 'budget.expense.edit';
    const ADDEXPENSESURL                        = 'budget.expense.addExpenses';
    const STOREEXPENSESURL                      = 'budget.expense.storeExpenses';
    const STOREURL                              = 'budget.expense.store';
    const UPDATEURL                             = 'budget.expense.update';
    const DESTROYURL                            = 'budget.expense.destroy';

    const TABLEID                               = 'table-budget-expense';


    const BUDGET_EXPENSE_RETRIEVED_SUCCESS            = 'Budget expense data retrieved successfully';
    const BUDGET_EXPENSE_CREATED_SUCCESS              = 'Budget expense created successfully';
    const BUDGET_EXPENSE_EXPENSE_ADDED_SUCCESS        = 'Budget expense added successfully';
    const BUDGET_EXPENSE_UPDATED_SUCCESS              = 'Budget expense updated successfully';
    const BUDGET_EXPENSE_DELETED_SUCCESS              = 'Budget expense deleted successfully';
}
