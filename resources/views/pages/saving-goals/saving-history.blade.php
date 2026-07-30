<x-form.modal title="Deposit History" size="xl" type="show">

    <div style="background: rgba(125, 211, 168, 0.1); border: 1px solid rgba(125, 211, 168, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px;">{{ $data->icon ?? '🎯' }}</div>
            <div>
                <div style="font-weight: 600; color: #fff;">{{ $data->name }}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    Target: {{ $data->currency?->symbol ?? 'Rp' }} {{ number_format($data->target_amount, 2) }}
                </div>
            </div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-secondary);">Total Terkumpul</div>
            <div style="font-size: 18px; font-weight: 700; color: #7dd3a8;">
                {{ $data->currency?->symbol ?? 'Rp' }} {{ number_format($data->current_amount, 2) }}
            </div>
        </div>
    </div>

    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th style="width: 50px;">#</th>
                    <th>Nominal Setor</th>
                    <th>Tanggal Setor</th>
                    <th>Catatan</th>
                    <th style="text-align: center; width: 100px;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($data->contributions as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td style="font-weight: 600; color: #7dd3a8;">
                            {{ $data->currency?->symbol ?? 'Rp' }} {{ number_format($item->amount, 2) }}
                        </td>
                        <td>{{ tgl_indo($item->contributed_at, false, true) }}</td>
                        <td>{{ $item->notes ?? '—' }}</td>
                        <td>
                            <div class="action-buttons" style="justify-content: center;">
                                <a href="{{ route('saving.contributions.edit', ['contribution' => $item->id]) }}"
                                   class="btn-action edit action" title="Edit Setoran">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </a>
                                <a href="{{ route('saving.contributions.destroy', ['contribution' => $item->id]) }}"
                                   class="btn-action delete" title="Hapus Setoran">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </a>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-secondary); py-4;">
                            Belum ada riwayat setoran tabungan.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

</x-form.modal>
