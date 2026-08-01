<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Analitik Keuangan - MoneyFlow</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1f2937;
            background: #f3f4f6;
            margin: 0;
            padding: 0;
            font-size: 12.5px;
            line-height: 1.6;
        }
        .report-page-wrapper {
            padding: 40px 20px;
        }
        .report-container {
            max-width: 1040px;
            margin: 0 auto;
            background: #ffffff;
            padding: 48px 56px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid #e5e7eb;
        }
        .banner-print {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 24px;
            text-align: center;
            font-weight: 600;
            font-size: 13.5px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }
        .btn-print {
            padding: 6px 18px;
            cursor: pointer;
            background: #ffffff;
            color: #059669;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
            transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .btn-print:hover {
            background: #f0fdf4;
            transform: translateY(-1px);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 32px;
        }
        .brand {
            font-size: 26px;
            font-weight: 800;
            color: #10b981;
            letter-spacing: -0.5px;
        }
        .title {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin: 4px 0 0;
        }
        .meta-info {
            text-align: right;
            font-size: 12px;
            color: #6b7280;
            line-height: 1.6;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 32px;
        }
        .summary-card {
            padding: 16px 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-sizing: border-box;
        }
        .card-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .card-value {
            font-size: 18px;
            font-weight: 800;
            color: #111827;
        }
        .success { color: #10b981; }
        .danger  { color: #ef4444; }
        
        .section-title {
            font-size: 15px;
            font-weight: 700;
            color: #111827;
            margin: 28px 0 14px;
            padding-bottom: 8px;
            border-bottom: 1.5px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            border-radius: 8px;
            overflow: hidden;
        }
        th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #f3f4f6;
            font-size: 12px;
        }
        th {
            background-color: #f9fafb;
            color: #374151;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid #e5e7eb;
        }
        tr:nth-child(even) td {
            background-color: #fafafa;
        }
        .text-right { text-align: right; }
        .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
        }

        @media print {
            body {
                background: #ffffff;
            }
            .report-page-wrapper {
                padding: 0;
            }
            .report-container {
                max-width: 100%;
                margin: 0;
                padding: 0;
                border: none;
                box-shadow: none;
                border-radius: 0;
            }
            .no-print { display: none !important; }
            .summary-grid {
                display: flex;
                gap: 12px;
            }
            .summary-card {
                flex: 1;
            }
        }
    </style>
</head>
<body>
    <div class="no-print banner-print">
        <span>💡 Silakan pilih <strong>"Save as PDF"</strong> / <strong>"Simpan sebagai PDF"</strong> pada dialog cetak.</span>
        <button onclick="window.print()" class="btn-print">Cetak / Simpan PDF</button>
    </div>

    <div class="report-page-wrapper">
        <div class="report-container">
            <div class="header">
                <div>
                    <div class="brand">MoneyFlow</div>
                    <div class="title">Laporan Analitik Keuangan</div>
                </div>
                <div class="meta-info">
                    <div><strong>Periode:</strong> {{ ucfirst(str_replace('_', ' ', $period)) }}</div>
                    <div><strong>Dicetak Pada:</strong> {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }}</div>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <div class="card-label">Total Pemasukan</div>
                    <div class="card-value success">Rp {{ number_format($overview['total_income'] ?? 0, 2, ',', '.') }}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Total Pengeluaran</div>
                    <div class="card-value danger">Rp {{ number_format($overview['total_expense'] ?? 0, 2, ',', '.') }}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Tabungan Bersih</div>
                    <div class="card-value">Rp {{ number_format($overview['net_savings'] ?? 0, 2, ',', '.') }}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Rasio Tabungan</div>
                    <div class="card-value success">{{ $overview['savings_rate'] ?? 0 }}%</div>
                </div>
            </div>

            <div class="section-title">Kategori Pengeluaran Teratas</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th>Nama Kategori</th>
                        <th class="text-right">Total Pengeluaran</th>
                        <th class="text-right" style="width: 120px;">Persentase</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($topCategories as $idx => $cat)
                        <tr>
                            <td>{{ $idx + 1 }}</td>
                            <td style="font-weight: 600;">{{ $cat['icon'] }} {{ $cat['name'] }}</td>
                            <td class="text-right">Rp {{ number_format($cat['amount'], 2, ',', '.') }}</td>
                            <td class="text-right" style="font-weight: 600; color: #10b981;">{{ $cat['percentage'] }}%</td>
                        </tr>
                    @empty
                        <tr>
                            <td colSpan="4" style="text-align: center; color: #9ca3af; padding: 20px;">Tidak ada data kategori.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            <div class="section-title">Rincian Transaksi Data</div>
            <table>
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Tipe</th>
                        <th>Kategori</th>
                        <th>Akun</th>
                        <th>Deskripsi</th>
                        <th class="text-right">Nominal</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($transactions as $t)
                        <tr>
                            <td>{{ $t->transaction_date ? $t->transaction_date->format('d/m/Y') : '-' }}</td>
                            <td><strong class="{{ $t->type === 'income' ? 'success' : 'danger' }}">{{ ucfirst($t->type) }}</strong></td>
                            <td>{{ $t->category->name ?? 'Uncategorized' }}</td>
                            <td>{{ $t->account->name ?? '-' }}</td>
                            <td>{{ $t->description ?? '-' }}</td>
                            <td class="text-right {{ $t->type === 'income' ? 'success' : 'danger' }}" style="font-weight: 700;">
                                {{ $t->type === 'income' ? '+ ' : '- ' }}Rp {{ number_format($t->amount, 2, ',', '.') }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colSpan="6" style="text-align: center; color: #9ca3af; padding: 20px;">Tidak ada transaksi ditemukan.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            <div class="footer">
                Dicetak secara otomatis oleh sistem MoneyFlow pada {{ date('d F Y') }}. Hak Cipta Dilindungi Undang-Undang.
            </div>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 600);
        };
    </script>
</body>
</html>
