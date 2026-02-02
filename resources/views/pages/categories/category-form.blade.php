@php
    // pastikan $data SELALU ada
    $isEdit = !empty($data->id);
@endphp

<x-form.modal
    title="Category"
    :action="$action ?? null"
    :is-edit="$isEdit"
>
    <div class="form-group">
        <label for="categoryName">
            Category Name <span class="required">*</span>
        </label>

        <input
            type="text"
            id="categoryName"
            name="name"
            value="{{ old('name', $data->name) }}"
            placeholder="e.g., Food & Dining"
            required
        />
    </div>

    <div class="form-row">
        <div class="form-group">
            <label for="categoryType">
                Type <span class="required">*</span>
            </label>

            <select id="categoryType" name="type" required>
                <option value="">Select Type</option>

                <option value="income"
                    {{ old('type', $data->type) === 'income' ? 'selected' : '' }}>
                    Income
                </option>

                <option value="expense"
                    {{ old('type', $data->type) === 'expense' ? 'selected' : '' }}>
                    Expense
                </option>
            </select>
        </div>

        <div class="form-group">
            <label for="categoryParent">Parent Category</label>

            <select id="categoryParent" name="parent_id">
                <option value="">None (Main Category)</option>

                @foreach ($categories ?? [] as $category)
                    <option
                        value="{{ $category->id }}"
                        {{ old('parent_id', $data->parent_id) == $category->id ? 'selected' : '' }}
                    >
                        {{ $category->icon }} {{ $category->name }}
                    </option>
                @endforeach
            </select>
        </div>
    </div>

    <div class="form-row">
        <div class="form-group">
            <label for="categoryIcon">Icon</label>

            <input
                type="text"
                id="categoryIcon"
                name="icon"
                value="{{ old('icon', $data->icon) }}"
                placeholder="🍔"
                maxlength="10"
            />
        </div>

        <div class="form-group">
            <label for="categoryColor">Color</label>

            <div class="color-picker-wrapper">
                <input
                    type="color"
                    id="categoryColor"
                    name="color"
                    class="color-picker"
                    value="{{ old('color', $data->color ?? '#7dd3a8') }}"
                />

                <input
                    type="text"
                    id="categoryColorHex"
                    value="{{ old('color', $data->color ?? '#7dd3a8') }}"
                    placeholder="#7dd3a8"
                    style="flex:1;"
                />
            </div>
        </div>
    </div>

    <div class="form-group">
        <label for="categoryStatus">
            Status <span class="required">*</span>
        </label>

        <select id="categoryStatus" name="is_active" required>
            <option value="1"
                {{ old('is_active', $data->is_active) == 1 ? 'selected' : '' }}>
                Active
            </option>

            <option value="0"
                {{ old('is_active', $data->is_active) == 0 ? 'selected' : '' }}>
                Inactive
            </option>
        </select>
    </div>

    <div class="form-group">
        <label for="categoryDescription">Description</label>

        <textarea
            id="categoryDescription"
            name="description"
            placeholder="Optional description for this category"
        >{{ old('description', $data->description) }}</textarea>
    </div>
</x-form.modal>
