import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import RecurringTransactionModal from '../../Components/RecurringTransactionModal';
import ConfirmModal from '../../Components/ConfirmModal';
import CustomDatePicker from '../../Components/CustomDatePicker';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { 
    Eye, Edit, Trash2, Search, RotateCcw, Plus, 
    TrendingUp, TrendingDown, RefreshCw, Repeat, Calendar, CheckCircle2, XCircle
} from 'lucide-react';

export default function Index({ title, subtitle, summary: initialSummary, accounts = [], categories = [], currencies = [] }) {
    // ── Data state ──────────────────────────────────────────────
    const [recurringList, setRecurringList] = useState([]);
    const [summaryStats, setSummaryStats] = useState(initialSummary || {
        active_count: 0, monthly_income: 0, monthly_expense: 0
    });
    const [meta, setMeta] = useState({
        current_page: 1, last_page: 1, from: 0, to: 0, total: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    // ── Filter / search state ────────────────────────────────────
    const [filters, setFilters] = useState({
        search: '', type: 'all', frequency: 'all', category_id: 'all', account_id: 'all', startDate: '', endDate: '', perPage: 10, page: 1
    });
    const [searchTerm, setSearchTerm] = useState('');

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen]               = useState(false);
    const [modalMode, setModalMode]                   = useState('create'); // 'create' | 'edit' | 'show'
    const [selectedRecurring, setSelectedRecurring]   = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen]             = useState(false);
    const [recurringToDelete, setRecurringToDelete]   = useState(null);
    const [isDeleting, setIsDeleting]                 = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch Data ───────────────────────────────────────────────
    const fetchRecurringTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('recurring.allPagination'), {
                params: {
                    search:       filters.search || null,
                    type:         filters.type === 'all' ? null : filters.type,
                    frequency:    filters.frequency === 'all' ? null : filters.frequency,
                    category_id:  filters.category_id === 'all' ? null : filters.category_id,
                    account_id:   filters.account_id === 'all' ? null : filters.account_id,
                    start_date:   filters.startDate || null,
                    end_date:     filters.endDate || null,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setRecurringList(response.data.data.data || []);
                setMeta(response.data.data.meta || {
                    current_page: 1, last_page: 1, from: 0, to: 0, total: 0
                });
                const summaryData = response.data.data?.summary || response.data?.summary;
                if (summaryData) {
                    setSummaryStats(summaryData);
                }
            } else {
                showToast(response.data.message || 'Failed to retrieve recurring transactions', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading recurring transaction data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchRecurringTransactions();
    }, [fetchRecurringTransactions]);

    // ── Debounce search input ────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ── Filter Handlers ──────────────────────────────────────────
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            search: '', type: 'all', frequency: 'all', category_id: 'all', account_id: 'all', startDate: '', endDate: '', perPage: 10, page: 1
        });
    };

    // ── Modal Actions ────────────────────────────────────────────
    const handleOpenCreate = () => {
        setSelectedRecurring(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (recurring) => {
        setSelectedRecurring(recurring);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenShow = (recurring) => {
        setSelectedRecurring(recurring);
        setModalMode('show');
        setIsModalOpen(true);
    };

    const handleOpenDelete = (recurring) => {
        setRecurringToDelete(recurring);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!recurringToDelete) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(route('recurring.destroy', recurringToDelete.id));
            if (res.data && res.data.success) {
                showToast('Recurring transaction deleted successfully!', 'success');
                setIsDeleteOpen(false);
                setRecurringToDelete(null);
                fetchRecurringTransactions();
            } else {
                showToast(res.data?.message || 'Failed to delete recurring transaction.', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Server error on deletion.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Pagination Builder ───────────────────────────────────────
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
                @keyframes sk-pulse { 0%,100%{opacity:.4} 50%{opacity:.85} }
                .skeleton-block {
                    background: var(--bg-card-border);
                    height: 14px;
                    border-radius: 4px;
                }
            `}</style>

            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />

            {/* ── Page Header ── */}
            <div className="page-header" style={{ marginBottom: '28px' }}>
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
                        <Repeat size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'Recurring Transactions'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Manage your automatic recurring income and expenses'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary action"
                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <Plus size={16} />
                    New Recurring
                </button>
            </div>

            {/* ── Summary Metric Cards ── */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Repeat size={20} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <h3>{summaryStats?.active_count ?? 0}</h3>
                        <p>Active Recurring</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp {Number(summaryStats?.monthly_income ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}</h3>
                        <p>Monthly Income</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp {Number(summaryStats?.monthly_expense ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })}</h3>
                        <p>Monthly Expenses</p>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div className="table-card">

                {/* Controls */}
                <div className="table-controls" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    <div className="table-controls-left" style={{ flexWrap: 'wrap', gap: '10px' }}>
                        {/* Search Input */}
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search recurring..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="custom-select" style={{ minWidth: '110px' }}>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        {/* Frequency Filter */}
                        <div className="custom-select" style={{ minWidth: '120px' }}>
                            <select
                                value={filters.frequency}
                                onChange={(e) => handleFilterChange('frequency', e.target.value)}
                            >
                                <option value="all">All Frequencies</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="bi_weekly">Bi-Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="custom-select" style={{ minWidth: '140px' }}>
                            <select
                                value={filters.category_id}
                                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Account Filter */}
                        <div className="custom-select" style={{ minWidth: '130px' }}>
                            <select
                                value={filters.account_id}
                                onChange={(e) => handleFilterChange('account_id', e.target.value)}
                            >
                                <option value="all">All Accounts</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '130px' }}>
                                <CustomDatePicker
                                    value={filters.startDate}
                                    onChange={(val) => handleFilterChange('startDate', val)}
                                    placeholder="Start Date"
                                />
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>-</span>
                            <div style={{ width: '130px' }}>
                                <CustomDatePicker
                                    value={filters.endDate}
                                    onChange={(val) => handleFilterChange('endDate', val)}
                                    placeholder="End Date"
                                />
                            </div>
                        </div>

                        {/* Reset Filter Button */}
                        {(filters.search || filters.type !== 'all' || filters.frequency !== 'all' || filters.category_id !== 'all' || filters.account_id !== 'all' || filters.startDate || filters.endDate) && (
                            <button
                                className="btn-icon"
                                onClick={handleResetFilters}
                                title="Reset Filters"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>

                    <div className="table-controls-right">
                        <div className="custom-select">
                            <select
                                value={filters.perPage}
                                onChange={(e) => handleFilterChange('perPage', Number(e.target.value))}
                            >
                                <option value="10">Show 10</option>
                                <option value="25">Show 25</option>
                                <option value="50">Show 50</option>
                                <option value="100">Show 100</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Start Date / Next</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Account</th>
                                <th>Description</th>
                                <th>Frequency</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [0, 1, 2, 3, 4].map((i) => (
                                    <tr key={i} style={{ animation: 'sk-pulse 1.4s ease-in-out infinite' }}>
                                        <td><div className="skeleton-block" style={{ width: '80%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '60px', height: '22px', borderRadius: '12px' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '100px' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '90px' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '140px' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '70px', height: '20px', borderRadius: '8px' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '70%', marginLeft: 'auto' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '50px', height: '20px', borderRadius: '12px' }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                {[0, 1, 2].map(j => <div key={j} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card-border)' }} />)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : recurringList.length === 0 ? (
                                <tr>
                                    <td colSpan="9">
                                        <EmptyState 
                                            message="No recurring transactions found matching your filters."
                                            icon="Repeat"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                recurringList.map((row) => {
                                    const isIncome = row.type === 'income';
                                    const typeColor = isIncome ? '#34d399' : '#f87171';
                                    const typeBg = isIncome ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)';
                                    const typeBorder = isIncome ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)';

                                    return (
                                        <tr key={row.id}>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {row.start_date_formatted || row.start_date}
                                                </div>
                                                {row.next_occurrence_formatted && (
                                                    <div style={{ fontSize: '11px', color: 'var(--accent)' }}>
                                                        Next: {row.next_occurrence_formatted}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <span className={`badge ${isIncome ? 'success' : 'danger'}`} style={{
                                                    textTransform: 'capitalize',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    color: typeColor,
                                                    background: typeBg,
                                                    border: `1px solid ${typeBorder}`,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {row.type_label || row.type}
                                                </span>
                                            </td>

                                            <td>
                                                {row.category ? row.category.name : 'Uncategorized'}
                                            </td>

                                            <td>
                                                {row.account?.name || '—'}
                                            </td>

                                            <td>
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {row.description}
                                                </div>
                                            </td>

                                            <td>
                                                <span style={{
                                                    padding: '3px 9px',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    background: 'rgba(255,255,255,0.06)',
                                                    border: '1px solid var(--bg-card-border)',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {row.frequency_label || row.frequency}
                                                </span>
                                            </td>

                                            <td style={{ 
                                                textAlign: 'right', 
                                                fontWeight: 600,
                                                color: typeColor
                                            }}>
                                                {row.amount_formatted}
                                            </td>

                                            <td>
                                                <span className={`badge ${row.is_active ? 'success' : 'secondary'}`}>
                                                    {row.status_label || (row.is_active ? 'Active' : 'Inactive')}
                                                </span>
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                                                    {/* View */}
                                                    <button
                                                        className="act-btn act-btn-view"
                                                        onClick={() => handleOpenShow(row)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    {/* Edit */}
                                                    <button
                                                        className="act-btn act-btn-edit"
                                                        onClick={() => handleOpenEdit(row)}
                                                        title="Edit Recurring"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        className="act-btn act-btn-delete"
                                                        onClick={() => handleOpenDelete(row)}
                                                        title="Delete Recurring"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Table Footer & Pagination ── */}
                <div className="table-footer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderTop: '1px solid var(--bg-card-border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    {/* Info on Left */}
                    <div className="table-info" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} entries
                    </div>

                    {/* Pagination on Right */}
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

            {/* ── Recurring Modal (Create / Edit / Show) ── */}
            <RecurringTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchRecurringTransactions}
                mode={modalMode}
                recurring={selectedRecurring}
                accounts={accounts}
                categories={categories}
                currencies={currencies}
                showToast={showToast}
            />

            {/* ── Delete Confirmation Modal ── */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Recurring Transaction?"
                message={`Are you sure you want to delete "${recurringToDelete?.description}"? This action cannot be undone.`}
                confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete'}
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
