<?php

namespace App\Constants;

class CategoryMessage
{
    const TITLE                                 = 'Manage Categories';
    const SUBTITLE                              = 'Organize your income and expense categories';
    const FORMVIEW                              = 'pages.categories.category-form';
    const INDEXVIEW                             = 'pages.categories.index';

    const PAGINATIONURL                         = 'category.allPagination';
    const CREATEURL                             = 'category.create';
    const EDITURL                               = 'category.edit';
    const SHOWURL                               = 'category.show';
    const STOREURL                              = 'category.store';
    const UPDATEURL                             = 'category.update';
    const DESTROYURL                            = 'category.destroy';

    const TABLEID                               = 'table-category';


    const CATEGORY_RETRIEVED_SUCCESS            = 'Category data retrieved successfully';
    const CATEGORY_CREATED_SUCCESS              = 'Category created successfully';
    const CATEGORY_UPDATED_SUCCESS              = 'Category updated successfully';
    const CATEGORY_DELETED_SUCCESS              = 'Category deleted successfully';
}
