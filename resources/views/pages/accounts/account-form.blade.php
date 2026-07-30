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
        {{-- DETAIL VIEW (STACKED CLEAN LAYOUT) --}}
        <div style="display: flex; flex-direction: column; gap: 24px;">

            {{-- TOP SECTION: ACCOUNT SUMMARY & DETAILS TABLE --}}
            <div class="table-wrapper">
                <table style="width: 100%;">
                    <tbody>
                        <tr>
                            <th style="width: 25%; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Account Name</th>
                            <td style="text-align: right;">
                                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                                    @if ($data->icon)
                                        <div class="account-icon" style="background: {{ $data->color ?? 'rgba(125,211,168,0.15)' }}; font-size: 18px; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                            {{ $data->icon }}
                                        </div>
                                    @endif
                                    <div style="text-align: right;">
                                        <strong style="font-size: 15px; color: var(--text-primary);">{{ $data->name }}</strong>
                                        <div style="font-size: 11px; color: var(--text-secondary);">{{ $data->accountType?->name ?? 'Account' }}</div>
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Account Type</th>
                            <td style="text-align: right; color: var(--text-primary); font-weight: 500;">{{ $data->accountType?->name ?? '—' }}</td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Institution</th>
                            <td style="text-align: right; color: var(--text-primary);">{{ $data->institution_name ?? '—' }}</td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Account Number</th>
                            <td style="text-align: right; color: var(--text-primary); font-family: monospace; font-size: 13px;">{{ $data->masked_account_number ?? ($data->account_number ?? '—') }}</td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Currency</th>
                            <td style="text-align: right; color: var(--text-primary);">{{ $data->currency?->name ?? $data->currency?->code ?? '—' }}</td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Balance (Saldo)</th>
                            <td style="text-align: right;"><strong style="font-size: 16px; color: #7dd3a8;">{{ $data->balance_formatted ?? number_format($data->balance, 2) }}</strong></td>
                        </tr>

                        @if ($data->credit_limit > 0)
                            <tr>
                                <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Credit Limit</th>
                                <td style="text-align: right;">{{ number_format($data->credit_limit, 2) }}</td>
                            </tr>
                        @endif

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Default Account</th>
                            <td style="text-align: right;">
                                <span class="badge {{ $data->is_default ? 'success' : 'secondary' }}">
                                    {{ $data->is_default ? 'Yes' : 'No' }}
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Status</th>
                            <td style="text-align: right;">
                                <span class="badge {{ $data->is_active ? 'success' : 'danger' }}">
                                    {{ $data->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Note</th>
                            <td style="text-align: right; color: var(--text-primary); font-style: italic;">{{ $data->notes ?? '—' }}</td>
                        </tr>

                        <tr>
                            <th style="font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary);">Created At</th>
                            <td style="text-align: right; color: var(--text-secondary); font-size: 12px;">{{ $data->created_at ? tgl_indo($data->created_at, false, true) : '—' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {{-- BOTTOM SECTION: TRANSACTION HISTORY TABLE --}}
            <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                        <span>📜</span> Transaction History (Riwayat Transaksi)
                    </h4>
                    <span style="font-size: 12px; color: var(--text-secondary);">Total {{ count($data->transactions ?? []) }} transaksi</span>
                </div>

                <div class="table-wrapper">
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th>Transaksi</th>
                                <th>Kategori</th>
                                <th>Tipe</th>
                                <th>Nominal</th>
                                <th>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($data->transactions ?? [] as $index => $tx)
                                @php
                                    $symbol = $tx->currency?->symbol ?? ($data->currency?->symbol ?? 'Rp');
                                    $typeBadgeClass = 'info';
                                    $amountColor = 'var(--text-primary)';
                                    $prefix = '';

                                    if ($tx->type === 'income') {
                                        $typeBadgeClass = 'success';
                                        $amountColor = '#7dd3a8';
                                        $prefix = '+ ';
                                    } elseif ($tx->type === 'expense') {
                                        $typeBadgeClass = 'danger';
                                        $amountColor = '#f87171';
                                        $prefix = '- ';
                                    }
                                @endphp
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="font-size: 16px;">{{ $tx->category?->icon ?? '💳' }}</span>
                                            <div>
                                                <div style="font-weight: 500; color: var(--text-primary);">{{ $tx->description }}</div>
                                                @if ($tx->notes)
                                                    <div style="font-size: 11px; color: var(--text-secondary);">{{ $tx->notes }}</div>
                                                @endif
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge secondary">
                                            {{ $tx->category?->name ?? '—' }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge {{ $typeBadgeClass }}">
                                            {{ ucfirst($tx->type) }}
                                        </span>
                                    </td>
                                    <td style="font-weight: 600; color: {{ $amountColor }};">
                                        {{ $prefix }}{{ $symbol }} {{ number_format($tx->amount, 2) }}
                                    </td>
                                    <td style="font-size: 12px; color: var(--text-primary);">
                                        {{ tgl_indo($tx->transaction_date) }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 24px;">
                                        Belum ada riwayat transaksi pada akun ini.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    @endif

</x-form.modal>
