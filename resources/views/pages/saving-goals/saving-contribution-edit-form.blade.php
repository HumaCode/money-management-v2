@php
    $isEdit = true;
@endphp

<x-form.modal title="Deposit Entry" :action="$action" :is-edit="$isEdit" size="md">

    <div class="form-group">
        <label for="depositAmount">Nominal Setor <span class="required">*</span></label>
        <input type="text" id="depositAmount" name="amount" class="currency-input" value="{{ old('amount', $data->amount) }}" required />
    </div>

    <div class="form-group">
        <label for="contributedAt">Tanggal Setor <span class="required">*</span></label>
        <input type="date" id="contributedAt" name="contributed_at" value="{{ old('contributed_at', optional($data->contributed_at)->format('Y-m-d')) }}" required />
    </div>

    <div class="form-group">
        <label for="depositNotes">Catatan</label>
        <textarea id="depositNotes" name="notes" placeholder="Catatan opsional">{{ old('notes', $data->notes) }}</textarea>
    </div>

</x-form.modal>
