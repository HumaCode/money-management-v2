@php
    // pastikan $data SELALU ada
    $isEdit = !empty($data->id);
@endphp

<x-form.modal title="Budget" :action="$action ?? null" :is-edit="$isEdit" type="{{ $type ?? null }}">

    @if ($action ?? null)

        <div class="form-group">
            <label for="budgetName">Budget Name <span class="required">*</span></label>
            <input type="text" id="budgetName" name="name" value="{{ $data->name ?? '' }}"
                placeholder="e.g., Monthly Expenses" required />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="budgetPeriod">Period <span class="required">*</span></label>
                <select id="budgetPeriod" name="period" required>
                    <option value="">Select Period</option>

                    @foreach ($PeriodList as $key => $item)
                        <option value="{{ $item }}"
                            {{ old('period', $data->period ?? '') == $item ? 'selected' : '' }}>{{ ucfirst($item) }} 
                        </option>
                    @endforeach

                </select>
            </div>

            <div class="form-group">
                <label for="budgetCurrency">Currency <span class="required">*</span></label>
                <select id="budgetCurrency" name="currency_id" required>
                    <option value="">Select Currency</option>

                    @foreach ($CurrencyList as $item)
                        <option value="{{ $item['id'] }}"
                            {{ old('currency_id', $data->currency_id ?? '') == $item['id'] ? 'selected' : '' }}>
                            {{ $item['code'] }} - {{ $item['name'] }}</option>
                    @endforeach

                </select>
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="budgetStartDate">Start Date <span class="required">*</span></label>
                <input
                    type="date"
                    id="budgetStartDate"
                    name="start_date"
                    value="{{ old('start_date', optional($data->start_date)->format('Y-m-d')) }}"
                    required
                />

            </div>

            <div class="form-group">
                <label for="budgetEndDate">End Date <span class="required">*</span></label>
                <input type="date" id="budgetEndDate" name="end_date"
                    value="{{ old('end_date', optional($data->end_date)->format('Y-m-d')) }}" required />
            </div>
        </div>

        <div class="form-group">
            <label for="budgetTotalAmount">Total Budget Amount <span class="required">*</span></label>
            <input type="number" id="budgetTotalAmount" name="total_amount"
                value="{{ old('total_amount', $data->total_amount ?? '') }}" placeholder="0" step="0.01" required />
        </div>


        @if ($isEdit)
            <div class="form-group">
                <label for="budgetStatus">
                    Status <span class="required">*</span>
                </label>

                <select id="budgetStatus" name="is_active" required>
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
            <div class="checkbox-group">
                <input type="checkbox" id="budgetRollover" name="rollover_unused" value="1"
                    {{ old('rollover_unused', $data->rollover_unused ?? 0) == 1 ? 'checked' : '' }} />
                <label for="budgetRollover" style="margin-top: 10px;">Rollover unused budget to next period</label>
            </div>
        </div>

        <div class="form-group">
            <label for="accountNotes">Notes</label>
            <textarea id="accountNotes" name="notes" placeholder="Optional notes about this budget">{{ old('notes', $data->notes) }}</textarea>
        </div>
    @else
        {{-- DETAIL VIEW --}}
        <div class="table-wrapper">
            <table>
                <tbody>
                    <tr>
                        <th>Note</th>
                        <td>{{ $data->notes ?? '—' }}</td>
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
