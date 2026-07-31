@php
    $isEdit = !empty($data->id);
@endphp

<x-form.modal title="Saving Goal" :action="$action ?? null" :is-edit="$isEdit" type="{{ $type ?? null }}" size="xl">

    @if ($action ?? null)

        <div class="form-group">
            <label for="savingName">Goal Name <span class="required">*</span></label>
            <input type="text" id="savingName" name="name" value="{{ old('name', $data->name ?? '') }}"
                placeholder="e.g., Emergency Fund, New Car" required />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="savingAccount">Account <span class="required">*</span></label>
                <select id="savingAccount" name="account_id" required>
                    <option value="">Select Account</option>
                    @foreach ($AccountList ?? [] as $item)
                        <option value="{{ $item['id'] }}"
                            {{ old('account_id', $data->account_id ?? '') == $item['id'] ? 'selected' : '' }}>
                            {{ $item['name'] }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div class="form-group">
                <label for="savingCurrency">Currency <span class="required">*</span></label>
                <select id="savingCurrency" name="currency_id" required>
                    <option value="">Select Currency</option>
                    @foreach ($CurrencyList ?? [] as $item)
                        <option value="{{ $item['id'] }}"
                            {{ old('currency_id', $data->currency_id ?? '') == $item['id'] ? 'selected' : '' }}>
                            {{ $item['code'] }} - {{ $item['name'] }}
                        </option>
                    @endforeach
                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="savingTargetAmount">Target Amount <span class="required">*</span></label>
                <input type="text" id="savingTargetAmount" name="target_amount" class="currency-input"
                    value="{{ old('target_amount', $data->target_amount ?? '') }}" placeholder="0" required />
            </div>

            <div class="form-group">
                <label for="savingCurrentAmount">Current Amount</label>
                <input type="text" id="savingCurrentAmount" name="current_amount" class="currency-input"
                    value="{{ old('current_amount', $data->current_amount ?? 0) }}" placeholder="0" />
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="savingMonthlyTarget">Monthly Target</label>
                <input type="text" id="savingMonthlyTarget" name="monthly_target" class="currency-input"
                    value="{{ old('monthly_target', $data->monthly_target ?? '') }}" placeholder="0" />
            </div>

            <div class="form-group">
                <label for="savingTargetDate">Target Date <span class="required">*</span></label>
                <input type="date" id="savingTargetDate" name="target_date"
                    value="{{ old('target_date', optional($data->target_date)->format('Y-m-d')) }}" required />
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="savingIcon">Icon</label>
                <input type="text" id="savingIcon" name="icon" value="{{ old('icon', $data->icon ?? '🎯') }}"
                    placeholder="🎯" maxlength="10" />
            </div>

            <div class="form-group">
                <label for="savingColor">Color</label>
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
                <label for="savingStatus">Status <span class="required">*</span></label>
                <select id="savingStatus" name="status" required>
                    <option value="active" {{ old('status', $data->status ?? '') == 'active' ? 'selected' : '' }}>Active</option>
                    <option value="completed" {{ old('status', $data->status ?? '') == 'completed' ? 'selected' : '' }}>Completed</option>
                    <option value="paused" {{ old('status', $data->status ?? '') == 'paused' ? 'selected' : '' }}>Paused</option>
                    <option value="cancelled" {{ old('status', $data->status ?? '') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                </select>
            </div>
        @endif

        <div class="form-group">
            <label for="savingDescription">Description</label>
            <textarea id="savingDescription" name="description" placeholder="Optional description about this goal">{{ old('description', $data->description ?? '') }}</textarea>
        </div>

    @else
        {{-- DETAIL VIEW --}}
        <div class="table-wrapper">
            <table>
                <tbody>
                    <tr>
                        <th>Goal Name</th>
                        <td>{{ $data->name ?? '—' }}</td>
                    </tr>
                    <tr>
                        <th>Target Amount</th>
                        <td>{{ number_format($data->target_amount ?? 0, 2) }}</td>
                    </tr>
                    <tr>
                        <th>Current Amount</th>
                        <td>{{ number_format($data->current_amount ?? 0, 2) }}</td>
                    </tr>
                    <tr>
                        <th>Target Date</th>
                        <td>{{ $data->target_date ? tgl_indo($data->target_date) : '—' }}</td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>{{ $data->description ?? '—' }}</td>
                    </tr>
                    <tr>
                        <th>Created At</th>
                        <td>{{ $data->created_at ? tgl_indo($data->created_at, false, true) : '—' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

</x-form.modal>
