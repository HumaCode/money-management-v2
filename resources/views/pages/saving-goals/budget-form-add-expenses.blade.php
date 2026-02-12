@php
    // pastikan $data SELALU ada
    $isEdit = !empty($data->id);
@endphp

<x-form.modal title="Budget Expenses" :action="$action ?? null" :is-edit="$isEdit" type="{{ $type ?? null }}">

    @if ($action ?? null)
        <div class="form-group">
            <label for="categorySelect">Category *</label>
            <select id="categorySelect" name="category_id" required>
                <option value="">Select Category</option>

                @foreach ($categories as $item)
                    <option value="{{ $item['id'] }}">{{ $item['icon'] }} {{ $item['name'] }}</option>
                @endforeach

            </select>
        </div>

        <div class="form-group">
                <label for="budgetStartDate">Spent Date <span class="required">*</span></label>
                <input
                    type="date"
                    id="budgetStartDate"
                    name="spent_date"
                    value="{{ old('spent_date', optional($data->spent_date)->format('Y-m-d')) }}"
                    required
                />

        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="allocatedAmount">Allocated Amount *</label>
                <input type="number" id="allocatedAmount" placeholder="0" min="0" name="allocated_amount"
                    step="1000" required>
            </div>
            <div class="form-group">
                <label for="spentAmount">Spent Amount</label>
                <input type="number" id="spentAmount" placeholder="0" min="0" name="spent_amount" step="1000"
                    value="0">
            </div>
        </div>

        <div class="form-group">
            <label for="accountNotes">Notes</label>
            <textarea id="accountNotes" name="notes" placeholder="Optional notes about this budget"></textarea>
        </div>
    @endif

</x-form.modal>
