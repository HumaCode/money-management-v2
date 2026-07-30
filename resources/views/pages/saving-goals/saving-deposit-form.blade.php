<x-form.modal title="Tambah Tabungan (Setor)" :action="$action ?? null" size="md">

    @if ($action ?? null)

        <div style="background: rgba(125, 211, 168, 0.1); border: 1px solid rgba(125, 211, 168, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">{{ $data->icon ?? '🎯' }}</div>
            <div>
                <div style="font-weight: 600; color: #fff;">{{ $data->name }}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    Target: {{ $data->currency?->symbol ?? 'Rp' }} {{ number_format($data->target_amount, 2) }} | 
                    Terkumpul: {{ $data->currency?->symbol ?? 'Rp' }} {{ number_format($data->current_amount, 2) }}
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="depositAmount">Jumlah Setor (Nominal Nabung) <span class="required">*</span></label>
            <input type="text" id="depositAmount" name="amount" class="currency-input" placeholder="0" required autofocus />
        </div>

        <div class="form-group">
            <label for="contributedAt">Tanggal Setor <span class="required">*</span></label>
            <input type="date" id="contributedAt" name="contributed_at" value="{{ date('Y-m-d') }}" required />
        </div>

        <div class="form-group">
            <label for="depositNotes">Catatan</label>
            <textarea id="depositNotes" name="notes" placeholder="Catatan opsional (misal: Alokasi gaji bulan ini)"></textarea>
        </div>

    @endif

</x-form.modal>
