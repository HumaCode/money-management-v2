<?php

namespace App\Constants;

class CategoryMessage
{
    const TITLE                                 = 'Manage Categories';
    const SUBTITLE                              = 'Organize your income and expense categories';
    const FORMVIEW                              = 'pages.categories.category-form';
    const INDEXVIEW                             = 'pages.categories.index';

    const CREATEURL                             = 'category.create';
    const STOREURL                              = 'category.store';
    const TABLEID                               = 'table-category';


    const CATEGORY_RETRIEVED_SUCCESS            = 'User data retrieved successfully';
    const CATEGORY_CREATED_SUCCESS              = 'User created successfully';
    const CATEGORY_UPDATED_SUCCESS              = 'User updated successfully';
    const CATEGORY_DELETED_SUCCESS              = 'User deleted successfully';

    const ERROR_CREATING                        = 'Error creating : ';
    const ERROR_UPDATING                        = 'Error updating : ';
    const ERROR_DELETED                         = 'Error deleting : ';
}