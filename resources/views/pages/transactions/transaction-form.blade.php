@php
    $isEdit = !empty($data->id);
@endphp

<x-form.modal title="Transaction" :action="$action" :is-edit="$isEdit" size="xl">

    <div class="form-row">
        <div class="form-group">
            <label for="txType">Type <span class="required">*</span></label>
            <select id="txType" name="type" required>
                <option value="expense" {{ old('type', $data->type ?? 'expense') === 'expense' ? 'selected' : '' }}>Expense (Pengeluaran)</option>
                <option value="income" {{ old('type', $data->type ?? '') === 'income' ? 'selected' : '' }}>Income (Pemasukan)</option>
                <option value="transfer" {{ old('type', $data->type ?? '') === 'transfer' ? 'selected' : '' }}>Transfer</option>
            </select>
        </div>

        <div class="form-group">
            <label for="txAmount">Nominal (Amount) <span class="required">*</span></label>
            <input type="text" id="txAmount" name="amount" class="currency-input"
                value="{{ old('amount', $data->amount ?? '') }}" placeholder="0" required autofocus />
        </div>
    </div>

    <div class="form-row">
        <div class="form-group">
            <label for="txAccount" id="txAccountLabel">Account <span class="required">*</span></label>
            <select id="txAccount" name="account_id" required>
                <option value="">Select Account</option>
                @foreach ($AccountList ?? [] as $acc)
                    <option value="{{ $acc['id'] }}" data-balance="{{ $acc['balance'] ?? 0 }}" {{ old('account_id', $data->account_id ?? '') == $acc['id'] ? 'selected' : '' }}>
                        {{ $acc['icon'] ?? '💳' }} {{ $acc['name'] }} (Balance: {{ number_format($acc['balance'] ?? 0, 2) }})
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group" id="groupToAccount" style="display: {{ old('type', $data->type ?? '') === 'transfer' ? 'block' : 'none' }};">
            <label for="txToAccount">Destination Account (Akun Tujuan) <span class="required">*</span></label>
            <select id="txToAccount" name="to_account_id">
                <option value="">Select Destination Account</option>
                @foreach ($AccountList ?? [] as $acc)
                    <option value="{{ $acc['id'] }}" {{ old('to_account_id', $data->to_account_id ?? '') == $acc['id'] ? 'selected' : '' }}>
                        {{ $acc['icon'] ?? '💳' }} {{ $acc['name'] }} (Balance: {{ number_format($acc['balance'] ?? 0, 2) }})
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group" id="groupCategory" style="display: {{ old('type', $data->type ?? '') === 'transfer' ? 'none' : 'block' }};">
            <label for="txCategory">Category <span class="required">*</span></label>
            <select id="txCategory" name="category_id">
                <option value="">Select Category</option>
                @foreach ($CategoryList ?? [] as $cat)
                    <option value="{{ $cat['id'] }}" {{ old('category_id', $data->category_id ?? '') == $cat['id'] ? 'selected' : '' }}>
                        {{ $cat['icon'] ?? '🏷️' }} {{ $cat['name'] }} ({{ ucfirst($cat['type'] ?? '') }})
                    </option>
                @endforeach
            </select>
        </div>
    </div>

    <div class="form-row">
        <div class="form-group">
            <label for="txCurrency">Currency <span class="required">*</span></label>
            <select id="txCurrency" name="currency_id" required>
                @foreach ($CurrencyList ?? [] as $curr)
                    <option value="{{ $curr['id'] }}" {{ old('currency_id', $data->currency_id ?? '') == $curr['id'] ? 'selected' : '' }}>
                        {{ $curr['code'] }} ({{ $curr['symbol'] }}) - {{ $curr['name'] }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label for="txDate">Transaction Date <span class="required">*</span></label>
            <input type="date" id="txDate" name="transaction_date"
                value="{{ old('transaction_date', optional($data->transaction_date)->format('Y-m-d') ?? date('Y-m-d')) }}" required />
        </div>
    </div>

    <div class="form-group">
        <label for="txDescription">Description <span class="required">*</span></label>
        <input type="text" id="txDescription" name="description"
            value="{{ old('description', $data->description ?? '') }}" placeholder="e.g., Gaji Bulanan, Belanja Bulanan" required />
    </div>

    <div class="form-row">
        <div class="form-group">
            <label for="txRefNo">Reference Number</label>
            <input type="text" id="txRefNo" name="reference_number"
                value="{{ old('reference_number', $data->reference_number ?? '') }}" placeholder="e.g., INV-202602-001" />
        </div>

        <div class="form-group">
            <label for="txNotes">Notes</label>
            <textarea id="txNotes" name="notes" placeholder="Catatan tambahan (opsional)">{{ old('notes', $data->notes ?? '') }}</textarea>
        </div>
    </div>

    <script>
        $(document).ready(function() {
            function toggleTransferFields() {
                const type = $('#txType').val();
                if (type === 'transfer') {
                    $('#txAccountLabel').html('From Account (Akun Asal) <span class="required">*</span>');
                    $('#groupToAccount').show().find('select').prop('required', true);
                    $('#groupCategory').hide().find('select').prop('required', false);
                } else {
                    $('#txAccountLabel').html('Account <span class="required">*</span>');
                    $('#groupToAccount').hide().find('select').prop('required', false);
                    $('#groupCategory').show().find('select').prop('required', true);
                }
            }

            $('#txType').on('change', toggleTransferFields);
            toggleTransferFields();
        });
    </script>

</x-form.modal>
