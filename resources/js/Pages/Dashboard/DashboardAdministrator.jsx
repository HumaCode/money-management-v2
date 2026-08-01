import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { usePage, Head, Link } from '@inertiajs/react';
import { 
    DollarSign, ArrowUpRight, ArrowDownRight, Award, 
    Calendar, CreditCard, ArrowLeftRight, PieChart, 
    ChevronRight, Wallet, TrendingUp, Receipt, Sparkles, Bell, Clock
} from 'lucide-react';

export default function DashboardAdministrator({ 
    title, 
    stats, 
    recentTransactions = [], 
    chartData, 
    savingsHeatmap, 
    savingsGoals = [],
    categoryExpenses = [],
    upcomingBills = [],
    smartInsights = []
}) {
    const { auth } = usePage().props;
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [selectedGoalId, setSelectedGoalId] = React.useState(null);

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
                    gap: 16px;
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

            {/* Smart Financial Insights Banner */}
            {smartInsights.length > 0 && (
                <div 
                    data-aos="fade-down" 
                    data-aos-delay="50"
                    style={{ 
                        marginBottom: '24px', 
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)', 
                        border: '1px solid rgba(59, 130, 246, 0.2)', 
                        borderRadius: '16px', 
                        padding: '18px 22px' 
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Sparkles size={20} style={{ color: '#3b82f6' }} />
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Smart Financial Insights
                        </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        {smartInsights.map((insight, idx) => (
                            <div 
                                key={idx} 
                                style={{ 
                                    background: 'var(--bg-card)', 
                                    border: '1px solid var(--bg-card-border)', 
                                    borderRadius: '12px', 
                                    padding: '12px 14px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px'
                                }}
                            >
                                <span className={`badge-type ${insight.type === 'success' ? 'badge-income' : (insight.type === 'warning' ? 'badge-expense' : 'badge-transfer')}`} style={{ padding: '4px 8px', fontSize: '10px' }}>
                                    {insight.type === 'success' ? 'Surplus' : (insight.type === 'warning' ? 'Perhatian' : 'Info')}
                                </span>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                                        {insight.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                        {insight.message}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Analisis Selisih & Tren Pengeluaran Section */}
            <div className="recent-card" data-aos="fade-up" style={{ marginBottom: '28px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                            Analisis Selisih & Tren Pengeluaran
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                            Perbandingan ritme pengeluaran harian, bulanan, tahunan, serta status arus kas
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* 1. Harian (Hari Ini vs Kemarin) */}
                    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pengeluaran Hari Ini</span>
                            <span className={`badge-type ${statData.daily_expense_diff <= 0 ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '10.5px' }}>
                                {statData.daily_expense_diff <= 0 ? '↓ Lebih Hemat' : '↑ Lebih Tinggi'}
                            </span>
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                            {formatCurrency(statData.today_expenses)}
                        </h4>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {statData.daily_expense_diff > 0 
                                ? `+${formatCurrency(statData.daily_expense_diff)} dari kemarin`
                                : (statData.daily_expense_diff < 0 
                                    ? `-${formatCurrency(Math.abs(statData.daily_expense_diff))} dari kemarin`
                                    : 'Sama dengan kemarin')}
                        </div>
                    </div>

                    {/* 2. Bulanan (Bulan Ini vs Bulan Lalu) */}
                    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pengeluaran Bulan Ini</span>
                            <span className={`badge-type ${statData.monthly_expense_diff <= 0 ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '10.5px' }}>
                                {statData.expense_trend <= 0 ? `↓ ${Math.abs(statData.expense_trend)}% Hemat` : `↑ ${Math.abs(statData.expense_trend)}% Naik`}
                            </span>
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                            {formatCurrency(statData.expenses_this_month)}
                        </h4>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {statData.monthly_expense_diff > 0 
                                ? `+${formatCurrency(statData.monthly_expense_diff)} dari bulan lalu`
                                : (statData.monthly_expense_diff < 0 
                                    ? `-${formatCurrency(Math.abs(statData.monthly_expense_diff))} dari bulan lalu`
                                    : 'Sama dengan bulan lalu')}
                        </div>
                    </div>

                    {/* 3. Tahunan (Tahun Ini vs Tahun Lalu) */}
                    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pengeluaran Tahun Ini</span>
                            <span className={`badge-type ${statData.yearly_expense_diff <= 0 ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '10.5px' }}>
                                {statData.yearly_expense_trend <= 0 ? `↓ ${Math.abs(statData.yearly_expense_trend)}% Hemat` : `↑ ${Math.abs(statData.yearly_expense_trend)}% Naik`}
                            </span>
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                            {formatCurrency(statData.expenses_this_year)}
                        </h4>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {statData.yearly_expense_diff > 0 
                                ? `+${formatCurrency(statData.yearly_expense_diff)} dari tahun lalu`
                                : (statData.yearly_expense_diff < 0 
                                    ? `-${formatCurrency(Math.abs(statData.yearly_expense_diff))} dari tahun lalu`
                                    : 'Sama dengan tahun lalu')}
                        </div>
                    </div>

                    {/* 4. Status Arus Kas (Net Cashflow) */}
                    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--bg-card-border)', borderRadius: '14px', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status Arus Kas (Bulan Ini)</span>
                            <span className={`badge-type ${statData.net_cashflow_this_month >= 0 ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '10.5px' }}>
                                {statData.net_cashflow_this_month >= 0 ? 'Surplus' : 'Defisit'}
                            </span>
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: statData.net_cashflow_this_month >= 0 ? '#7dd3a8' : '#ef4444' }}>
                            {formatCurrency(statData.net_cashflow_this_month)}
                        </h4>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {statData.net_cashflow_this_month >= 0 ? 'Pemasukan lebih besar dari pengeluaran' : 'Pengeluaran melebihi pemasukan'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown & Upcoming Bills Grid */}
            <div className="dash-grid" style={{ marginBottom: '28px' }}>
                {/* Category Expenses Breakdown */}
                <div className="recent-card" data-aos="fade-up">
                    <div className="recent-header">
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PieChart size={20} style={{ color: 'var(--accent)' }} />
                                Alokasi Pengeluaran per Kategori
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Proporsi pengeluaran bulan ini</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                        {categoryExpenses.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                Belum ada transaksi pengeluaran bulan ini.
                            </div>
                        ) : (
                            categoryExpenses.slice(0, 5).map((cat, idx) => (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.category_color }} />
                                            {cat.category_name}
                                        </span>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {formatCurrency(cat.total_amount)} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({cat.percentage}%)</span>
                                        </span>
                                    </div>
                                    <div style={{ height: '7px', background: 'var(--bg-input)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${cat.percentage}%`, 
                                            background: cat.category_color,
                                            borderRadius: '10px',
                                            transition: 'width 0.4s ease'
                                        }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Bills & Recurring Transactions */}
                <div className="recent-card" data-aos="fade-up" data-aos-delay="100">
                    <div className="recent-header">
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={20} style={{ color: '#eab308' }} />
                                Pengingat Tagihan Mendatang
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Transaksi berulang yang akan jatuh tempo</p>
                        </div>
                        <Link href={route('recurring.index')} style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                            Lihat Semua
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                        {upcomingBills.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--bg-card-border)' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Tidak ada tagihan jatuh tempo dalam waktu dekat.</p>
                                <Link href={route('recurring.index')} style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '8px', display: 'inline-block', fontWeight: 600, textDecoration: 'none' }}>
                                    + Atur Transaksi Berulang
                                </Link>
                            </div>
                        ) : (
                            upcomingBills.map((bill) => (
                                <div key={bill.id} style={{ background: 'var(--bg-input)', border: '1px solid var(--bg-card-border)', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{bill.description || 'Tagihan Rutin'}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                            Jatuh Tempo: {new Date(bill.next_occurrence_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: bill.type === 'income' ? '#7dd3a8' : '#ef4444' }}>
                                            {formatCurrency(bill.amount)}
                                        </div>
                                        <span className={`badge-type ${bill.type === 'income' ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                                            {bill.frequency}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
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

                {/* Quick Info & Individual Goals Scrollable List */}
                <div className="recent-card" data-aos="fade-up" data-aos-delay="150" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="recent-header" style={{ marginBottom: '12px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Progres Tabungan</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Klik tabungan untuk lihat histori heatmap</p>
                        </div>
                        <Award size={20} style={{ color: '#eab308' }} />
                    </div>

                    {/* Overall Summary Bar */}
                    <div 
                        onClick={() => setSelectedGoalId(null)}
                        style={{ 
                            marginBottom: '16px', 
                            background: 'var(--bg-input)', 
                            padding: '12px 14px', 
                            borderRadius: '12px', 
                            border: selectedGoalId === null ? '1.5px solid var(--accent)' : '1px solid var(--bg-card-border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                            <span style={{ color: selectedGoalId === null ? 'var(--accent)' : 'var(--text-secondary)' }}>Total Terkumpul:</span>
                            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                {formatCurrency(statData.savings_goals_saved)} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>/ {formatCurrency(statData.savings_goals_target)}</span>
                            </span>
                        </div>
                        <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ 
                                height: '100%', 
                                width: `${Math.min(statData.savings_progress_pct, 100)}%`, 
                                background: 'linear-gradient(90deg, var(--accent), #3b82f6)',
                                borderRadius: '10px',
                                transition: 'width 0.6s ease'
                            }}></div>
                        </div>
                    </div>

                    {/* Scrollable List of Individual Savings Goals */}
                    <div style={{ 
                        maxHeight: '210px', 
                        overflowY: 'auto', 
                        paddingRight: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {savingsGoals.length === 0 ? (
                            <div style={{ 
                                padding: '24px 16px', 
                                textAlign: 'center', 
                                background: 'var(--bg-input)', 
                                borderRadius: '12px',
                                border: '1px solid var(--bg-card-border)'
                            }}>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Belum ada target tabungan impian.</p>
                                <Link 
                                    href={route('saving-goals.index')} 
                                    style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '8px', display: 'inline-block', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    + Buat Target Tabungan
                                </Link>
                            </div>
                        ) : (
                            savingsGoals.map((goal) => {
                                const current = parseFloat(goal.current_amount || 0);
                                const target = parseFloat(goal.target_amount || 0);
                                const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
                                const isSelected = selectedGoalId === goal.id;

                                return (
                                    <div 
                                        key={goal.id}
                                        onClick={() => setSelectedGoalId(goal.id)}
                                        style={{ 
                                            background: 'var(--bg-input)', 
                                            border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--bg-card-border)', 
                                            borderRadius: '12px', 
                                            padding: '12px 14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>{goal.name}</span>
                                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent)' }}>
                                                {formatCurrency(current)} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>/ {formatCurrency(target)}</span>
                                            </span>
                                        </div>

                                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${pct}%`, 
                                                background: goal.color || 'linear-gradient(90deg, var(--accent), #3b82f6)',
                                                borderRadius: '10px',
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            <span>Progres: {pct}%</span>
                                            {goal.target_date && (
                                                <span>Target: {new Date(goal.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* GitHub-style Savings Contribution Heatmap Grid */}
            <SavingsContributionHeatmap 
                savingsHeatmap={savingsHeatmap} 
                formatCurrency={formatCurrency} 
                selectedGoalId={selectedGoalId}
                savingsGoals={savingsGoals}
            />

            {/* Recent Transactions Section */}
            <div className="recent-card" data-aos="fade-up" style={{ marginBottom: '32px' }}>
                <div className="recent-header">
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Transaksi Terakhir</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Daftar aktivitas keuangan terbaru Anda</p>
                    </div>
                    <Link 
                        href={route('transaction.index')} 
                        style={{ 
                            width: 'auto',
                            maxWidth: 'fit-content',
                            fontSize: '12.5px', 
                            fontWeight: 600,
                            padding: '8px 16px', 
                            whiteSpace: 'nowrap', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            flexShrink: 0,
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            borderRadius: '10px',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
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

// GitHub-Style Savings Contribution Heatmap Component
function SavingsContributionHeatmap({ savingsHeatmap, formatCurrency, selectedGoalId, savingsGoals = [] }) {
    const cardRef = React.useRef(null);
    const [hoveredCell, setHoveredCell] = React.useState(null);
    const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });

    const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const rawContributions = savingsHeatmap?.contributions || [];

    // Filter contributions if a specific goal is selected
    const filteredContributions = React.useMemo(() => {
        if (!selectedGoalId) return rawContributions;
        return rawContributions.filter(c => String(c.savings_goal_id) === String(selectedGoalId));
    }, [rawContributions, selectedGoalId]);

    // Group filtered contributions by date
    const matrixData = React.useMemo(() => {
        const map = {};
        filteredContributions.forEach(item => {
            const dateStr = item.date;
            if (!map[dateStr]) {
                map[dateStr] = { count: 0, amount: 0 };
            }
            map[dateStr].count += parseInt(item.total_count || 0);
            map[dateStr].amount += parseFloat(item.total_amount || 0);
        });
        return map;
    }, [filteredContributions]);

    // Compute total count & amount
    const { totalCount, totalSaved } = React.useMemo(() => {
        let cnt = 0;
        let amt = 0;
        Object.values(matrixData).forEach(item => {
            cnt += item.count;
            amt += item.amount;
        });
        return { totalCount: cnt, totalSaved: amt };
    }, [matrixData]);

    const selectedGoal = React.useMemo(() => {
        return savingsGoals.find(g => String(g.id) === String(selectedGoalId));
    }, [savingsGoals, selectedGoalId]);

    // Generate 52 weeks x 7 days
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diffToMon = (day === 0 ? -6 : 1 - day);
    
    const lastMon = new Date(today);
    lastMon.setDate(today.getDate() + diffToMon);

    const startMon = new Date(lastMon);
    startMon.setDate(lastMon.getDate() - (51 * 7));

    const weeks = [];
    const monthLabels = [];
    let currMon = new Date(startMon);

    for (let w = 0; w < 52; w++) {
        const weekDays = [];
        const monthName = currMon.toLocaleDateString('id-ID', { month: 'short' });
        
        // Show month label if week 0 or first week of month
        if (w === 0 || currMon.getDate() <= 7) {
            monthLabels.push({ weekIndex: w, name: monthName });
        }

        for (let d = 0; d < 7; d++) {
            const cellDate = new Date(currMon);
            cellDate.setDate(currMon.getDate() + d);

            // Format YYYY-MM-DD in local time
            const year = cellDate.getFullYear();
            const m = String(cellDate.getMonth() + 1).padStart(2, '0');
            const dateNum = String(cellDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${m}-${dateNum}`;

            const item = matrixData[dateStr] || { count: 0, amount: 0 };
            const amt = item.amount || 0;
            const cnt = item.count || 0;

            let level = 0;
            if (amt > 0 || cnt > 0) {
                if (amt > 1000000) level = 4;
                else if (amt > 500000) level = 3;
                else if (amt > 100000) level = 2;
                else level = 1;
            }

            weekDays.push({
                dateStr,
                formattedDate: cellDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                dayName: daysOfWeek[d],
                amount: amt,
                count: cnt,
                level,
            });
        }
        weeks.push(weekDays);
        currMon.setDate(currMon.getDate() + 7);
    }

    const getLevelColor = (lvl) => {
        switch (lvl) {
            case 1: return '#0e4429';
            case 2: return '#006d32';
            case 3: return '#26a641';
            case 4: return '#39d353';
            default: return 'rgba(255, 255, 255, 0.05)';
        }
    };

    const handleMouseEnter = (e, cell) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let transformX = '-50%';
        let posX = rect.left + rect.width / 2 + window.scrollX;

        // Smart boundary detection to prevent overflow on right/left edges
        if (window.innerWidth - rect.right < 180) {
            transformX = '-100%';
            posX = rect.right + window.scrollX;
        } else if (rect.left < 180) {
            transformX = '0%';
            posX = rect.left + window.scrollX;
        }

        setTooltipPos({
            x: posX,
            y: rect.top - 20 + window.scrollY,
            transformX,
        });
        setHoveredCell(cell);
    };

    return (
        <div 
            className="recent-card" 
            data-aos="fade-up" 
            style={{ 
                marginBottom: '32px',
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-card-border)',
                borderRadius: 'var(--radius)',
                padding: '24px'
            }}
        >
            <style>{`
                .gh-heatmap-container {
                    width: 100%;
                    overflow-x: auto;
                    padding-bottom: 8px;
                }
                .gh-cell {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    border-radius: 3px;
                    transition: transform 0.15s ease, outline 0.15s ease;
                    cursor: pointer;
                }
                .gh-cell:hover {
                    outline: 1.5px solid var(--text-primary);
                    transform: scale(1.3);
                    z-index: 10;
                }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {selectedGoal 
                            ? `Kontribusi Tabungan: ${selectedGoal.name}` 
                            : (totalCount > 0 ? `${totalCount} kontribusi tabungan tahun ini` : 'Progres Aktivitas Tabungan')}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                        {selectedGoal 
                            ? `Menampilkan ${totalCount} setoran (Total ${formatCurrency(totalSaved)}) khusus target ${selectedGoal.name}`
                            : (totalSaved > 0 ? `Total ${formatCurrency(totalSaved)} terkumpul dari seluruh target tabungan` : 'Jejak aktivitas harian menabung Anda')}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {selectedGoal ? (
                        <span style={{ fontSize: '11px', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                            Filter: {selectedGoal.name}
                        </span>
                    ) : (
                        <span>Gabungan Semua Tabungan</span>
                    )}
                </div>
            </div>

            {/* Heatmap Box Full Width */}
            <div className="gh-heatmap-container">
                <div style={{ display: 'flex', gap: '10px', width: '100%', minWidth: '700px' }}>
                    {/* Y-Axis 7 Days Labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '22px', paddingRight: '4px', flexShrink: 0 }}>
                        {daysOfWeek.map((dayName, idx) => (
                            <div 
                                key={idx} 
                                style={{ 
                                    fontSize: '10.5px', 
                                    color: 'var(--text-secondary)', 
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1
                                }}
                            >
                                {dayName}
                            </div>
                        ))}
                    </div>

                    {/* Matrix with Month Headers Full Width */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Month Headers */}
                        <div style={{ display: 'flex', height: '22px', position: 'relative', width: '100%', marginBottom: '4px' }}>
                            {monthLabels.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    style={{ 
                                        position: 'absolute', 
                                        left: `${(m.weekIndex / 52) * 100}%`, 
                                        fontSize: '11px', 
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600
                                    }}
                                >
                                    {m.name}
                                </div>
                            ))}
                        </div>

                        {/* 52 Columns x 7 Rows Grid Full Width */}
                        <div style={{ display: 'flex', gap: '3px', width: '100%', flex: 1 }}>
                            {weeks.map((week, wIdx) => (
                                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                                    {week.map((cell, dIdx) => (
                                        <div
                                            key={dIdx}
                                            className="gh-cell"
                                            style={{ background: cell.level === 0 ? 'var(--bg-input)' : getLevelColor(cell.level) }}
                                            onMouseEnter={(e) => handleMouseEnter(e, cell)}
                                            onMouseLeave={() => setHoveredCell(null)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--bg-card-border)', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Status aktivitas kontribusi harian
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <span>Kurang</span>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--bg-input)' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#0e4429' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#006d32' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#26a641' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#39d353' }} />
                    <span>Banyak</span>
                </div>
            </div>

            {/* Custom Hover Tooltip via Portal */}
            {hoveredCell && createPortal(
                <div 
                    style={{
                        position: 'absolute',
                        left: `${tooltipPos.x}px`,
                        top: `${tooltipPos.y}px`,
                        transform: `translate(${tooltipPos.transformX || '-50%'}, -100%)`,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '12.5px',
                        color: 'var(--text-primary)',
                        pointerEvents: 'none',
                        zIndex: 999999,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <strong>
                        {hoveredCell.amount > 0 
                            ? `${formatCurrency(hoveredCell.amount)} (${hoveredCell.count} kontribusi)` 
                            : 'Tidak ada kontribusi'}
                    </strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '3px' }}>
                        {hoveredCell.dayName}, {hoveredCell.formattedDate}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
