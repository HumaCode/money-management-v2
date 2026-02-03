<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:255',
            'type'          => 'required|in:income,expense',
            'parent_id'     => 'nullable|exists:categories,id',
            'icon'          => 'nullable|string|max:10',
            'color'         => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active'     => 'nullable|boolean',
            'description'   => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'         => 'Category name is required',
            'name.max'              => 'Category name cannot exceed 255 characters',
            'type.required'         => 'Category type is required',
            'type.in'               => 'Category type must be either income or expense',
            'parent_id.exists'      => 'Selected parent category does not exist',
            'icon.max'              => 'Icon cannot exceed 10 characters',
            'color.regex'           => 'Color must be in hexadecimal format (e.g., #FF5733)',
            'description.max'       => 'Description cannot exceed 1000 characters',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name'          => 'category name',
            'type'          => 'category type',
            'parent_id'     => 'parent category',
            'icon'          => 'category icon',
            'color'         => 'category color',
            'is_active'     => 'status',
            'description'   => 'description',
        ];
    }
}
