@php
    // pastikan $data SELALU ada
    $isEdit = !empty($data->id);
@endphp

<x-form.modal title="Category" :action="$action ?? null" :is-edit="$isEdit" type="{{ $type ?? null }}">

    @if ($action ?? null)
        <div class="form-group">
            <label for="name">
                Category Name <span class="required">*</span>
            </label>

            <input type="text" id="name" name="name" value="{{ old('name', $data->name) }}"
                placeholder="e.g., Food & Dining" required />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="categoryType">
                    Type <span class="required">*</span>
                </label>

                <select id="categoryType" name="type" required>
                    <option value="">Select Type</option>

                    <option value="income" {{ old('type', $data->type) === 'income' ? 'selected' : '' }}>
                        Income
                    </option>

                    <option value="expense" {{ old('type', $data->type) === 'expense' ? 'selected' : '' }}>
                        Expense
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label for="categoryParent">Parent Category</label>

                <select id="categoryParent" name="parent_id">
                    <option value="">None (Main Category)</option>

                    @foreach ($categories ?? [] as $category)
                        <option value="{{ $category->id }}"
                            {{ old('parent_id', $data->parent_id) == $category->id ? 'selected' : '' }}>
                            {{ $category->icon }} {{ $category->name }}
                        </option>
                    @endforeach
                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="categoryIcon">Icon</label>

                <input type="text" id="categoryIcon" name="icon" value="{{ old('icon', $data->icon) }}"
                    placeholder="🍔" maxlength="10" />
                <small class="text-muted">
                    Press <b>Win + .</b> (Windows) or <b>Ctrl + Cmd + Space</b> (Mac)
                </small>
            </div>

            <div class="form-group">
                <label for="categoryColor">Color</label>

                <div class="color-picker-wrapper" style="display:flex; gap:8px;">
                    <input type="color" id="inputColor" name="color" class="color-picker"
                        value="{{ old('color', $data->color ?? '#7dd3a8') }}" />

                    <input type="text" id="inputColorHex" class="form-control"
                        value="{{ old('color', $data->color ?? '#7dd3a8') }}" placeholder="#7dd3a8" readonly />
                </div>
            </div>
        </div>

        @if ($isEdit)
            <div class="form-group">
                <label for="categoryStatus">
                    Status <span class="required">*</span>
                </label>

                <select id="categoryStatus" name="is_active" required>
                    <option value="1" {{ old('is_active', $data->is_active) == 1 ? 'selected' : '' }}>
                        Active
                    </option>

                    <option value="0" {{ old('is_active', $data->is_active) == 0 ? 'selected' : '' }}>
                        Inactive
                    </option>
                </select>
            </div>
        @endif


        <div class="form-group">
            <label for="categoryDescription">Description</label>

            <textarea id="categoryDescription" name="description" placeholder="Optional description for this category">{{ old('description', $data->description) }}</textarea>
        </div>
    @else
        {{-- DETAIL VIEW --}}
        <div class="table-wrapper">
            <table>
                <tbody>

                    <tr>
                        <th>Description</th>
                        <td>{{ $data->description ?? '—' }}</td>
                    </tr>

                    <tr>
                        <th>Created At</th>
                        <td>{{ $data->created_at?->format('d M Y H:i') }}</td>
                    </tr>

                    <tr>
                        <th>Last Updated</th>
                        <td>{{ $data->updated_at?->format('d M Y H:i') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    @endif

</x-form.modal>
