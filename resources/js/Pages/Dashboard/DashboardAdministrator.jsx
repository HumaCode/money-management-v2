import React, { useEffect, useRef } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { usePage, Head, Link } from '@inertiajs/react';
import { 
    DollarSign, ArrowUpRight, ArrowDownRight, Award, 
    Calendar, CreditCard, ArrowLeftRight, PieChart, 
    ChevronRight, Wallet, TrendingUp, Receipt
} from 'lucide-react';

export default function DashboardAdministrator({ title, stats, recentTransactions = [], chartData }) {
    const { auth } = usePage().props;
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    useEffect(() => {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
            });
        }
    }, []);

    useEffect(() => {
        const ChartJS = window.Chart;
        if (!chartRef.current || !chartData || !ChartJS) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels || [],
                datasets: [
                    {
                        label: 'Pemasukan',
                        data: chartData.incomes || [],
                        backgroundColor: 'rgba(125, 211, 168, 0.85)',
                        borderColor: '#7dd3a8',
                        borderWidth: 1.5,
                        borderRadius: 6,
                    },
                    {
                        label: 'Pengeluaran',
                        data: chartData.expenses || [],
                        backgroundColor: 'rgba(239, 68, 68, 0.75)',
                        borderColor: '#ef4444',
                        borderWidth: 1.5,
                        borderRadius: 6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Plus Jakarta Sans', size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { 
                            color: '#94a3b8', 
                            font: { family: 'Plus Jakarta Sans', size: 11 },
                            callback: (v) => 'Rp ' + (v >= 1000000 ? (v / 1000000) + 'Jt' : v >= 1000 ? (v / 1000) + 'Rb' : v)
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData]);

    const statData = stats || {
        total_balance: 0,
        income_this_month: 0,
        income_trend: 0,
        expenses_this_month: 0,
        expense_trend: 0,
        savings_goals_saved: 0,
        savings_goals_target: 0,
        savings_progress_pct: 0,
    };

    return (
        <AuthenticatedLayout>
            <Head title={title || "Dashboard"} />

            <style>{`
                .dash-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .recent-card {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: var(--radius);
                    padding: 24px;
                }
                .recent-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .tx-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .tx-table th {
                    text-align: left;
                    font-size: 11.5px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-secondary);
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .tx-table td {
                    padding: 14px;
                    font-size: 13px;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .tx-table tr:last-child td {
                    border-bottom: none;
                }
                .badge-type {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: capitalize;
                }
                .badge-income { background: rgba(125, 211, 168, 0.15); color: #7dd3a8; }
                .badge-expense { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .badge-transfer { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                @media (max-width: 1024px) {
                    .dash-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Welcome Banner */}
            <div className="welcome-banner" data-aos="fade-down" style={{ marginBottom: '24px' }}>
                <h2>Selamat Datang Kembali, {auth.user?.name || 'Pengguna'}! 👋</h2>
                <p>Berikut adalah ringkasan keuangan dan aktivitas transaksi terbaru Anda.</p>
            </div>

            {/* Real Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '28px' }}>
                {/* Total Balance */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
                    <div className="stat-card-header">
                        <div className="stat-card-icon success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={20} />
                        </div>
                        <span className="stat-card-trend up">Aktif</span>
                    </div>
                    <div className="stat-card-body">
                        <h3>{formatCurrency(statData.total_balance)}</h3>
                        <p>Total Saldo Akun</p>
                    </div>
                </div>

                {/* Income This Month */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
                    <div className="stat-card-header">
                        <div className="stat-card-icon primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={20} />
                        </div>
                        <span className={`stat-card-trend ${statData.income_trend >= 0 ? 'up' : 'down'}`}>
                            {statData.income_trend >= 0 ? `+${statData.income_trend}%` : `${statData.income_trend}%`}
                        </span>
                    </div>
                    <div className="stat-card-body">
                        <h3>{formatCurrency(statData.income_this_month)}</h3>
                        <p>Pemasukan Bulan Ini</p>
                    </div>
                </div>

                {/* Expenses This Month */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
                    <div className="stat-card-header">
                        <div className="stat-card-icon error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowDownRight size={20} />
                        </div>
                        <span className={`stat-card-trend ${statData.expense_trend <= 0 ? 'up' : 'down'}`}>
                            {statData.expense_trend >= 0 ? `+${statData.expense_trend}%` : `${statData.expense_trend}%`}
                        </span>
                    </div>
                    <div className="stat-card-body">
                        <h3>{formatCurrency(statData.expenses_this_month)}</h3>
                        <p>Pengeluaran Bulan Ini</p>
                    </div>
                </div>

                {/* Savings Goals Progress */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="400">
                    <div className="stat-card-header">
                        <div className="stat-card-icon warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={20} />
                        </div>
                        <span className="stat-card-trend up">{statData.savings_progress_pct}% Target</span>
                    </div>
                    <div className="stat-card-body">
                        <h3>{formatCurrency(statData.savings_goals_saved)}</h3>
                        <p>Terkumpul dari {formatCurrency(statData.savings_goals_target)}</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Main Grid (Chart + Recent Transactions) */}
            <div className="dash-grid">
                {/* Monthly Chart */}
                <div className="recent-card" data-aos="fade-up">
                    <div className="recent-header">
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Perbandingan Keuangan Bulanan</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Grafik pemasukan vs pengeluaran 6 bulan terakhir</p>
                        </div>
                        <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div style={{ height: '320px', position: 'relative' }}>
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Quick Info & Goal Progress Bar */}
                <div className="recent-card" data-aos="fade-up" data-aos-delay="150" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div className="recent-header">
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Progres Tabungan</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Capaian target impian Anda</p>
                            </div>
                            <Award size={20} style={{ color: '#eab308' }} />
                        </div>

                        <div style={{ margin: '20px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Terkumpul:</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(statData.savings_goals_saved)}</span>
                            </div>
                            <div style={{ height: '10px', background: 'var(--bg-input)', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${Math.min(statData.savings_progress_pct, 100)}%`, 
                                    background: 'linear-gradient(90deg, var(--accent), #3b82f6)',
                                    borderRadius: '10px',
                                    transition: 'width 0.6s ease'
                                }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span>0%</span>
                                <span>Target: {formatCurrency(statData.savings_goals_target)}</span>
                            </div>
                        </div>
                    </div>

                    <Link 
                        href={route('analytics.index')} 
                        className="btn btn-secondary"
                        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', padding: '12px' }}
                    >
                        Lihat Laporan Lengkap Analytics <ChevronRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="recent-card" data-aos="fade-up" style={{ marginBottom: '32px' }}>
                <div className="recent-header">
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Transaksi Terakhir</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Daftar aktivitas keuangan terbaru Anda</p>
                    </div>
                    <Link href={route('transaction.index')} className="btn btn-secondary" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
                        Lihat Semua Transaksi <ChevronRight size={14} />
                    </Link>
                </div>

                {recentTransactions.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Receipt size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>Belum ada data transaksi recorded.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tx-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Tipe</th>
                                    <th>Kategori</th>
                                    <th>Akun</th>
                                    <th>Catatan</th>
                                    <th style={{ textAlign: 'right' }}>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((tx) => {
                                    const typeLower = (tx.type || '').toLowerCase();
                                    const isIncome = typeLower === 'income';
                                    const isExpense = typeLower === 'expense';
                                    const badgeClass = isIncome ? 'badge-income' : (isExpense ? 'badge-expense' : 'badge-transfer');

                                    return (
                                        <tr key={tx.id}>
                                            <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                                {formatDate(tx.transaction_date)}
                                            </td>
                                            <td>
                                                <span className={`badge-type ${badgeClass}`}>
                                                    {typeLower === 'income' ? 'Pemasukan' : (typeLower === 'expense' ? 'Pengeluaran' : 'Transfer')}
                                                </span>
                                            </td>
                                            <td>
                                                {tx.category ? (
                                                    <span style={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '6px',
                                                        fontWeight: 500
                                                    }}>
                                                        {tx.category.color && (
                                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tx.category.color }}></span>
                                                        )}
                                                        {tx.category.name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {tx.account?.name || '-'}
                                                {(tx.to_account || tx.destination_account) ? ` → ${(tx.to_account || tx.destination_account).name}` : ''}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {tx.description || tx.notes || '-'}
                                            </td>
                                            <td style={{ 
                                                textAlign: 'right', 
                                                fontWeight: 700,
                                                color: isIncome ? '#7dd3a8' : (isExpense ? '#ef4444' : '#3b82f6'),
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {isIncome ? '+' : (isExpense ? '-' : '')} {formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
