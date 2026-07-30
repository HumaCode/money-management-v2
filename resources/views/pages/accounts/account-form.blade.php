@php
    // pastikan $data SELALU ada
    $isEdit = !empty($data->id);
@endphp

<x-form.modal title="Account" :action="$action ?? null" :is-edit="$isEdit" type="{{ $type ?? null }}" size="xl">

    @if ($action ?? null)
        <div class="form-group">
            <label for="accountName">Account Name <span class="required">*</span></label>
            <input type="text" id="accountName" name="name" placeholder="e.g., BCA Savings" value="{{ $data->name }}"
                required />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="accountType">Account Type <span class="required">*</span></label>
                <select id="accountType" name="account_type_id" required>

                    <option value="">Select Type</option>

                    @foreach ($AccountTypeList as $key => $item)
                        <option value="{{ $key }}"
                            {{ isset($data->account_type_id) && $data->account_type_id == $key ? 'selected' : '' }}>
                            {{ $item }}
                        </option>
                    @endforeach

                </select>
            </div>

            <div class="form-group">
                <label for="accountCurrency">Currency <span class="required">*</span></label>
                <select id="accountCurrency" name="currency_id" required>

                    <option value="">Select Currency</option>
                    @foreach ($CurrencyList as $key => $item)
                        <option value="{{ $key }}"
                            {{ isset($data->currency_id) && $data->currency_id == $key ? 'selected' : '' }}>
                            {{ $item }}
                        </option>
                    @endforeach

                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="accountInstitution">Institution Name</label>
            <input type="text" name="institution_name" id="accountInstitution" placeholder="e.g., Bank Central Asia"
                value="{{ $data->institution_name ?? '' }}" />
        </div>

        <div class="form-group">
            <label for="accountNumber">Account Number</label>
            <input type="text" name="account_number" id="accountNumber" placeholder="Last 4 digits or masked number"
                value="{{ $data->account_number ?? '' }}" />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="accountBalance">Balance <span class="required">*</span></label>
                <input type="number" name="balance" min="0" id="accountBalance" placeholder="0" step="0.01"
                    value="{{ $data->balance }}" required />
            </div>

            <div class="form-group">
                <label for="accountCreditLimit">Credit Limit</label>
                <input type="number" name="credit_limit" min="0" id="accountCreditLimit"
                    placeholder="0 (for credit cards)" step="0.01" value="{{ $data->credit_limit }}" />
            </div>
        </div>


        @if (!$isEdit)
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
                    <label for="inputRgba">Color (RGBA)</label>

                    <div class="color-picker-wrapper" style="display:flex; gap:8px; align-items:center;">
                        <!-- base color -->
                        <input type="color" name="color" id="rgbaColorPicker" value="#3b82f6">

                        <!-- alpha -->
                        <input type="range" id="rgbaAlpha" min="0" max="1" step="0.01"
                            value="0.15">

                        <!-- final value -->
                        <input type="text" id="inputRgba" name="color" value="{{ $data->color ?? '' }}" readonly>
                    </div>

                    <small class="text-muted">Format: rgba(r,g,b,a)</small>
                </div>
            </div>
        @endif

        <div class="form-group">
            <div class="checkbox-group">
                <input type="hidden" name="is_default" value="0">
                <input type="checkbox" name="is_default" id="accountDefault" value="1"
                    {{ old('is_default', $data->is_default) ? 'checked' : '' }} />
                <label for="accountDefault" style="margin-top: 10px;">Set as default account</label>
            </div>
        </div>

        <div class="form-group">
            <label for="accountNotes">Notes</label>
            <textarea id="accountNotes" name="notes" placeholder="Optional notes about this account">{{ old('notes', $data->notes) }}</textarea>
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
    @else
        {{-- DETAIL VIEW --}}
        <div class="table-wrapper">
            <table>
                <tbody>
                    <tr>
                        <th>Account Name</th>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                @if ($data->icon)
                                    <span class="account-icon" style="background: {{ $data->color ?? 'rgba(125,211,168,0.15)' }};">{{ $data->icon }}</span>
                                @endif
                                <strong style="color: var(--text-primary);">{{ $data->name }}</strong>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th>Account Type</th>
                        <td>{{ $data->accountType?->name ?? '—' }}</td>
                    </tr>

                    <tr>
                        <th>Institution</th>
                        <td>{{ $data->institution_name ?? '—' }}</td>
                    </tr>

                    <tr>
                        <th>Account Number</th>
                        <td>{{ $data->masked_account_number ?? ($data->account_number ?? '—') }}</td>
                    </tr>

                    <tr>
                        <th>Currency</th>
                        <td>{{ $data->currency?->name ?? $data->currency?->code ?? '—' }}</td>
                    </tr>

                    <tr>
                        <th>Balance</th>
                        <td><strong>{{ $data->balance_formatted ?? number_format($data->balance, 2) }}</strong></td>
                    </tr>

                    <tr>
                        <th>Credit Limit</th>
                        <td>{{ $data->credit_limit > 0 ? number_format($data->credit_limit, 2) : '—' }}</td>
                    </tr>

                    <tr>
                        <th>Default Account</th>
                        <td>
                            <span class="badge {{ $data->is_default ? 'success' : 'secondary' }}">
                                {{ $data->is_default ? 'Yes' : 'No' }}
                            </span>
                        </td>
                    </tr>

                    <tr>
                        <th>Status</th>
                        <td>
                            <span class="badge {{ $data->is_active ? 'success' : 'danger' }}">
                                {{ $data->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                    </tr>

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
