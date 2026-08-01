import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { 
    TrendingUp, TrendingDown, DollarSign, Wallet, 
    BarChart3, PieChart, Activity, Calendar, RotateCcw,
    Printer, FileSpreadsheet
} from 'lucide-react';

export default function Index({ 
    title, 
    subtitle, 
    overview: initialOverview, 
    incomeVsExpensesChart: initialIncomeVsExpenses, 
    topCategories: initialTopCategories, 
    expenseDistribution: initialExpenseDistribution, 
    dailySpending: initialDailySpending, 
    cashFlow: initialCashFlow, 
    transactions: initialTransactions, 
    filterOptions = {}, 
    currentFilters = {} 
}) {
    // ── State Management ─────────────────────────────────────────
    const [overview, setOverview] = useState(initialOverview || {
        total_income: 0, total_expense: 0, net_savings: 0, savings_rate: 0,
        total_count: 0, income_count: 0, expense_count: 0, income_change: 0, expense_change: 0
    });

    const [incomeVsExpensesChartData, setIncomeVsExpensesChartData] = useState(initialIncomeVsExpenses || { labels: [], datasets: [] });
    const [topCategories, setTopCategories] = useState(initialTopCategories || []);
    const [expenseDistributionData, setExpenseDistributionData] = useState(initialExpenseDistribution || { labels: [], datasets: [] });
    const [dailySpendingData, setDailySpendingData] = useState(initialDailySpending || { labels: [], datasets: [] });
    const [cashFlowData, setCashFlowData] = useState(initialCashFlow || { labels: [], datasets: [] });

    const [transactionsList, setTransactionsList] = useState(initialTransactions?.data || []);
    const [meta, setMeta] = useState(initialTransactions?.meta || { current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });

    const [filters, setFilters] = useState({
        period: currentFilters.period || 'this_month',
        account_id: currentFilters.account_id || 'all',
        category_id: currentFilters.category_id || 'all',
        perPage: currentFilters.perPage || 10,
        page: 1,
    });

    const [isLoading, setIsLoading] = useState(false);
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Canvas Refs for Chart.js ──
    const incomeExpensesCanvasRef = useRef(null);
    const categoryCanvasRef       = useRef(null);
    const dailySpendingCanvasRef   = useRef(null);
    const cashFlowCanvasRef        = useRef(null);

    // Chart Instances
    const incomeExpensesChartInst = useRef(null);
    const categoryChartInst       = useRef(null);
    const dailySpendingChartInst  = useRef(null);
    const cashFlowChartInst       = useRef(null);

    // ── Fetch Analytics Data ─────────────────────────────────────
    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('analytics.data'), {
                params: {
                    period:       filters.period,
                    account_id:   filters.account_id === 'all' ? null : filters.account_id,
                    category_id:  filters.category_id === 'all' ? null : filters.category_id,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });

            if (response.data.success && response.data.data) {
                const res = response.data.data;
                if (res.overview) setOverview(res.overview);
                if (res.incomeVsExpensesChart) setIncomeVsExpensesChartData(res.incomeVsExpensesChart);
                if (res.topCategories) setTopCategories(res.topCategories);
                if (res.expenseDistribution) setExpenseDistributionData(res.expenseDistribution);
                if (res.dailySpending) setDailySpendingData(res.dailySpending);
                if (res.cashFlow) setCashFlowData(res.cashFlow);

                if (res.transactions) {
                    setTransactionsList(res.transactions.data || []);
                    setMeta(res.transactions.meta || { current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to update analytics data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    };

    // ── Chart.js Instances Initialization & Updates ──────────────
    useEffect(() => {
        if (typeof window === 'undefined' || !window.Chart) return;
        const Chart = window.Chart;

        Chart.defaults.color = '#6b7280';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
        Chart.defaults.font.family = 'Inter';

        // 1. Income vs Expenses Bar Chart
        if (incomeExpensesCanvasRef.current) {
            if (incomeExpensesChartInst.current) incomeExpensesChartInst.current.destroy();
            incomeExpensesChartInst.current = new Chart(incomeExpensesCanvasRef.current.getContext('2d'), {
                type: 'bar',
                data: incomeVsExpensesChartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } }
                }
            });
        }

        // 2. Expense Distribution Doughnut Chart
        if (categoryCanvasRef.current) {
            if (categoryChartInst.current) categoryChartInst.current.destroy();
            categoryChartInst.current = new Chart(categoryCanvasRef.current.getContext('2d'), {
                type: 'doughnut',
                data: expenseDistributionData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } }
                }
            });
        }

        // 3. Daily Spending Line Chart
        if (dailySpendingCanvasRef.current) {
            if (dailySpendingChartInst.current) dailySpendingChartInst.current.destroy();
            dailySpendingChartInst.current = new Chart(dailySpendingCanvasRef.current.getContext('2d'), {
                type: 'line',
                data: dailySpendingData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }

        // 4. Cash Flow Area Line Chart
        if (cashFlowCanvasRef.current) {
            if (cashFlowChartInst.current) cashFlowChartInst.current.destroy();
            cashFlowChartInst.current = new Chart(cashFlowCanvasRef.current.getContext('2d'), {
                type: 'line',
                data: cashFlowData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } }
                }
            });
        }

        return () => {
            if (incomeExpensesChartInst.current) incomeExpensesChartInst.current.destroy();
            if (categoryChartInst.current) categoryChartInst.current.destroy();
            if (dailySpendingChartInst.current) dailySpendingChartInst.current.destroy();
            if (cashFlowChartInst.current) cashFlowChartInst.current.destroy();
        };
    }, [incomeVsExpensesChartData, expenseDistributionData, dailySpendingData, cashFlowData]);

    // ── Compact Pagination Range ────────────────────────────────
    const paginationRange = useMemo(() => {
        const totalPages = meta.last_page || 1;
        const currentPage = meta.current_page || 1;
        const range = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        } else {
            range.push(1);
            if (currentPage > 3) range.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) range.push(i);
            if (currentPage < totalPages - 2) range.push('...');
            range.push(totalPages);
        }
        return range;
    }, [meta.last_page, meta.current_page]);

    return (
        <AuthenticatedLayout>
            <style>{`
                /* ── Analytics Module Custom Styles matching analytics.html ── */
                .analytics-container {
                    padding: 0;
                }
                .filters-bar {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                }
                .filter-group {
                    flex: 1;
                    min-width: 180px;
                }
                .filter-group select {
                    width: 100%;
                    padding: 11px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 13.5px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .filter-group select:focus {
                    border-color: var(--accent);
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 28px;
                }
                .stat-card {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: var(--radius);
                    padding: 22px 24px;
                    transition: all 0.25s ease;
                }
                .stat-card:hover {
                    transform: translateY(-3px);
                    border-color: var(--accent);
                }
                .stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                }
                .stat-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }
                .stat-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-icon.success { background: rgba(16,185,129,0.12); color: #10b981; }
                .stat-icon.error   { background: rgba(248,113,113,0.12); color: #f87171; }
                .stat-icon.info    { background: rgba(59,130,246,0.12); color: #3b82f6; }
                .stat-icon.purple  { background: rgba(139,92,246,0.12); color: #8b5cf6; }

                .stat-value {
                    font-size: 26px;
                    font-weight: 700;
                    margin-bottom: 4px;
                    line-height: 1.25;
                }
                .stat-value.success { color: #34d399; }
                .stat-value.error   { color: #f87171; }

                .stat-change {
                    font-size: 12.5px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .stat-change.positive { color: #10b981; }
                .stat-change.negative { color: #f87171; }

                .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .chart-card {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: var(--radius);
                    padding: 24px;
                }
                .chart-card.full-width {
                    grid-column: 1 / -1;
                }
                .chart-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .chart-title {
                    font-size: 17px;
                    font-weight: 600;
                }
                .chart-subtitle {
                    font-size: 12.5px;
                    color: var(--text-secondary);
                }
                .chart-period {
                    padding: 5px 12px;
                    background: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 8px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .chart-container {
                    position: relative;
                    height: 300px;
                }
                .chart-container.small { height: 210px; }
                .chart-container.large { height: 360px; }

                /* Category Progress list */
                .category-list { list-style: none; padding: 0; margin: 0; }
                .category-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .category-item:last-child { border-bottom: none; }
                .category-info { display: flex; alignItems: center; gap: 12px; flex: 1; }
                .category-icon { font-size: 22px; }
                .category-name { font-weight: 500; font-size: 13.5px; }
                .category-amount { font-weight: 600; color: var(--accent); font-size: 13.5px; margin-left: 12px; }
                .category-bar {
                    height: 5px;
                    background: var(--bg-input);
                    border-radius: 10px;
                    margin-top: 6px;
                    overflow: hidden;
                    width: 100%;
                    max-width: 220px;
                }
                .category-bar-fill {
                    height: 100%;
                    background: var(--accent);
                    border-radius: 10px;
                    transition: width 0.4s ease;
                }

                @media (max-width: 1200px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .charts-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />

            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--accent-dim)',
                        border: '1px solid var(--bg-card-border)',
                        color: 'var(--accent)',
                        flexShrink: 0
                    }}>
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'Analytics'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Financial insights and performance metrics'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="filter-group">
                    <select
                        value={filters.period}
                        onChange={(e) => handleFilterChange('period', e.target.value)}
                    >
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                        <option value="all_time">All Time</option>
                    </select>
                </div>

                <div className="filter-group">
                    <select
                        value={filters.account_id}
                        onChange={(e) => handleFilterChange('account_id', e.target.value)}
                    >
                        <option value="all">All Accounts</option>
                        {(filterOptions.accounts || []).map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <select
                        value={filters.category_id}
                        onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {(filterOptions.categories || []).map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Export Buttons */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <a
                        href={route('analytics.exportPdf', {
                            period: filters.period,
                            account_id: filters.account_id === 'all' ? null : filters.account_id,
                            category_id: filters.category_id === 'all' ? null : filters.category_id,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'rgba(248, 113, 113, 0.12)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            borderRadius: '10px',
                            color: '#f87171',
                            fontSize: '13px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Printer size={16} />
                        Cetak PDF
                    </a>

                    <a
                        href={route('analytics.exportExcel', {
                            period: filters.period,
                            account_id: filters.account_id === 'all' ? null : filters.account_id,
                            category_id: filters.category_id === 'all' ? null : filters.category_id,
                        })}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '10px',
                            color: '#34d399',
                            fontSize: '13px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <FileSpreadsheet size={16} />
                        Export Excel
                    </a>
                </div>
            </div>

            {/* Overview Stats Cards */}
            <div className="stats-grid">
                {/* Total Income */}
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Total Income</span>
                        <div className="stat-icon success">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="stat-value success">
                        Rp {Number(overview.total_income || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`stat-change ${overview.income_change >= 0 ? 'positive' : 'negative'}`}>
                        {overview.income_change >= 0 ? '▲ +' : '▼ '}
                        {overview.income_change}% from last period
                    </div>
                </div>

                {/* Total Expenses */}
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Total Expenses</span>
                        <div className="stat-icon error">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <div className="stat-value error">
                        Rp {Number(overview.total_expense || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`stat-change ${overview.expense_change <= 0 ? 'positive' : 'negative'}`}>
                        {overview.expense_change >= 0 ? '▲ +' : '▼ '}
                        {overview.expense_change}% from last period
                    </div>
                </div>

                {/* Net Savings */}
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Net Savings</span>
                        <div className="stat-icon info">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="stat-value">
                        Rp {Number(overview.net_savings || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="stat-change positive">
                        {overview.savings_rate}% savings rate
                    </div>
                </div>

                {/* Total Transactions */}
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Transactions</span>
                        <div className="stat-icon purple">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="stat-value">
                        {overview.total_count || 0}
                    </div>
                    <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>
                        {overview.income_count || 0} income, {overview.expense_count || 0} expenses
                    </div>
                </div>
            </div>

            {/* Charts Grid 1: Bar Chart & Top Categories */}
            <div className="charts-grid">
                {/* Income vs Expenses */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Income vs Expenses</div>
                            <div className="chart-subtitle">Monthly comparison</div>
                        </div>
                        <span className="chart-period">Last 6 Months</span>
                    </div>
                    <div className="chart-container">
                        <canvas ref={incomeExpensesCanvasRef}></canvas>
                    </div>
                </div>

                {/* Top Categories */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Top Categories</div>
                            <div className="chart-subtitle">By spending</div>
                        </div>
                    </div>
                    <ul className="category-list">
                        {topCategories.length === 0 ? (
                            <li style={{ padding: '20px 0', textTransform: 'none', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                No category spending recorded.
                            </li>
                        ) : (
                            topCategories.map((cat, idx) => (
                                <li key={idx} className="category-item">
                                    <div className="category-info">
                                        <span className="category-icon">{cat.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div className="category-name">{cat.name}</div>
                                            <div className="category-bar">
                                                <div className="category-bar-fill" style={{ width: `${cat.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="category-amount">
                                        Rp {Number(cat.amount).toLocaleString('id-ID')}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            {/* Charts Grid 2: Doughnut & Daily Line Chart */}
            <div className="charts-grid">
                {/* Expense Distribution */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Expense Distribution</div>
                            <div className="chart-subtitle">By category</div>
                        </div>
                    </div>
                    <div className="chart-container small">
                        <canvas ref={categoryCanvasRef}></canvas>
                    </div>
                </div>

                {/* Daily Spending */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Daily Spending</div>
                            <div className="chart-subtitle">Trend analysis</div>
                        </div>
                    </div>
                    <div className="chart-container small">
                        <canvas ref={dailySpendingCanvasRef}></canvas>
                    </div>
                </div>
            </div>

            {/* Cash Flow Analysis Full Width Chart */}
            <div className="chart-card full-width" style={{ marginBottom: '32px' }}>
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Cash Flow Analysis</div>
                        <div className="chart-subtitle">Income, expenses, and net balance over time</div>
                    </div>
                    <span className="chart-period">Full Year View</span>
                </div>
                <div className="chart-container large">
                    <canvas ref={cashFlowCanvasRef}></canvas>
                </div>
            </div>

            {/* Transactions Data Table (Paginated Resource) */}
            <div className="table-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div className="table-controls" style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
                        Detailed Transactions
                    </div>
                    <div className="custom-select">
                        <select
                            value={filters.perPage}
                            onChange={(e) => handleFilterChange('perPage', Number(e.target.value))}
                            style={{ background: 'var(--bg-input)', border: '1px solid var(--bg-card-border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-primary)', fontSize: '13px' }}
                        >
                            <option value="10">Show 10</option>
                            <option value="25">Show 25</option>
                            <option value="50">Show 50</option>
                        </select>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Account</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [0, 1, 2, 3].map((i) => (
                                    <tr key={i} style={{ opacity: 0.6 }}>
                                        <td colSpan="6" style={{ padding: '16px', textTransform: 'none' }}>
                                            Loading data...
                                        </td>
                                    </tr>
                                ))
                            ) : transactionsList.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <EmptyState message="No transactions found for the selected analytics period." />
                                    </td>
                                </tr>
                            ) : (
                                transactionsList.map((row) => {
                                    const isIncome = row.type === 'income';
                                    return (
                                        <tr key={row.id}>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {row.transaction_date_formatted || row.transaction_date}
                                            </td>
                                            <td>
                                                <span className={`badge ${isIncome ? 'success' : 'danger'}`} style={{
                                                    textTransform: 'capitalize',
                                                    padding: '3px 9px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: isIncome ? '#34d399' : '#f87171',
                                                    background: isIncome ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                                                    border: `1px solid ${isIncome ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`
                                                }}>
                                                    {row.type_label || row.type}
                                                </span>
                                            </td>
                                            <td>
                                                {row.category ? `${row.category.icon ? row.category.icon + ' ' : ''}${row.category.name}` : 'Uncategorized'}
                                            </td>
                                            <td>{row.account?.name || '—'}</td>
                                            <td>{row.description || '—'}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, color: isIncome ? '#34d399' : '#f87171' }}>
                                                {row.amount_formatted}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Compact Pagination Bar */}
                <div className="table-footer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderTop: '1px solid var(--bg-card-border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div className="table-info" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} entries
                    </div>

                    <div className="pagination" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                        <button
                            disabled={meta.current_page <= 1 || isLoading}
                            onClick={() => handleFilterChange('page', meta.current_page - 1)}
                        >
                            &lt;
                        </button>

                        {paginationRange.map((p, idx) => (
                            <button
                                key={idx}
                                className={p === meta.current_page ? 'active' : ''}
                                disabled={p === '...' || isLoading}
                                onClick={() => typeof p === 'number' && handleFilterChange('page', p)}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            disabled={meta.current_page >= meta.last_page || isLoading}
                            onClick={() => handleFilterChange('page', meta.current_page + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
