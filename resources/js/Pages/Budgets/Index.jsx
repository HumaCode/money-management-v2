import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import BudgetModal from '../../Components/BudgetModal';
import ConfirmModal from '../../Components/ConfirmModal';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, RotateCcw, Plus, CirclePlus, Wallet } from 'lucide-react';

export default function Index({ title, subtitle, periods, currencies, categories }) {
    // ── Data state ──────────────────────────────────────────────
    const [budgets, setBudgets]     = useState([]);
    const [meta, setMeta]           = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // ── Filter state ─────────────────────────────────────────────
    const [filters, setFilters]     = useState({ search: '', status: 'all', period: 'all', perPage: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [modalMode, setModalMode]       = useState('create');
    const [selectedBudget, setSelectedBudget] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen]     = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState(null);
    const [isDeleting, setIsDeleting]         = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch ────────────────────────────────────────────────────
    const fetchBudgets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('budget.allPagination'), {
                params: {
                    search:       filters.search || null,
                    status:       filters.status === 'all' ? null : filters.status,
                    period:       filters.period === 'all' ? null : filters.period,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setBudgets(response.data.data.data || []);
                setMeta(response.data.data.meta || { current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
            } else {
                showToast(response.data.message || 'Failed to retrieve budgets', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error loading budget data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchBudgets(); }, [filters.status, filters.period, filters.perPage, filters.page, filters.search]);

    // Debounced search
    useEffect(() => {
        const h = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
        }, 400);
        return () => clearTimeout(h);
    }, [searchTerm]);

    // ── Handlers ─────────────────────────────────────────────────
    const handleReload = () => {
        setSearchTerm('');
        setFilters({ search: '', status: 'all', period: 'all', perPage: 10, page: 1 });
        showToast('Table data refreshed', 'info');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.last_page)
            setFilters(prev => ({ ...prev, page: newPage }));
    };

    const openCreate = () => { setSelectedBudget(null);  setModalMode('create');     setIsModalOpen(true); };
    const openEdit   = (b) => { setSelectedBudget(b);    setModalMode('edit');       setIsModalOpen(true); };
    const openShow   = (b) => { setSelectedBudget(b);    setModalMode('show');       setIsModalOpen(true); };
    const openAddExp = (b) => { setSelectedBudget(b);    setModalMode('addExpense'); setIsModalOpen(true); };

    const triggerDelete = (b) => { setBudgetToDelete(b); setIsDeleteOpen(true); };
    const closeDelete   = () => { if (isDeleting) return; setIsDeleteOpen(false); setBudgetToDelete(null); };

    const handleDeleteConfirm = async () => {
        if (!budgetToDelete) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(route('budget.destroy', { budget: budgetToDelete.id }));
            if (res.data.success) {
                showToast('Budget deleted successfully!', 'success');
                if (budgets.length === 1 && filters.page > 1) {
                    setFilters(prev => ({ ...prev, page: prev.page - 1 }));
                } else {
                    fetchBudgets();
                }
                closeDelete();
            } else {
                showToast(res.data.message || 'Failed to delete budget', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Server error during deletion', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Pagination numbers ────────────────────────────────────────
    const renderPageNumbers = () => {
        const { current_page: current, last_page: last } = meta;
        let pages = [];
        if (last <= 5) {
            pages = Array.from({ length: last }, (_, i) => i + 1);
        } else if (current <= 3) {
            pages = [1, 2, 3, '...', last];
        } else if (current >= last - 2) {
            pages = [1, '...', last - 2, last - 1, last];
        } else {
            pages = [1, '...', current, '...', last];
        }

        return pages.map((p, idx) =>
            p === '...'
                ? <button key={`d${idx}`} disabled>...</button>
                : (
                    <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={meta.current_page === p ? 'active' : ''}
                    >
                        {p}
                    </button>
                )
        );
    };

    // ── Progress helpers ──────────────────────────────────────────
    const progressFillClass = (b) => {
        if (b.status === 'over_budget') return 'error';
        if (b.status === 'near_limit')  return 'warning';
        return '';
    };
    const progressTextStyle = (b) => {
        if (b.status === 'over_budget') return { color: 'var(--error)',   fontWeight: 600 };
        if (b.status === 'near_limit')  return { color: 'var(--warning)', fontWeight: 600 };
        return {};
    };

    return (
        <AuthenticatedLayout>
            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />

            {/* ── Page Header ── */}
            <div className="page-header" style={{ marginBottom: '28px' }}>
                <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'var(--accent-dim)', border: '1px solid var(--bg-card-border)',
                        color: 'var(--accent)', flexShrink: 0
                    }}>
                        <Wallet size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>{subtitle}</p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className="btn-primary action"
                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    id="btnAddBudget"
                >
                    <Plus size={16} /> Add Budget
                </button>
            </div>

            {/* ── Table Card ── */}
            <div className="table-card">

                {/* Controls */}
                <div className="table-controls">
                    <div className="table-controls-left">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                id="budgetSearch"
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="custom-select">
                            <select
                                id="budgetStatusFilter"
                                value={filters.status}
                                onChange={(e) => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="custom-select">
                            <select
                                id="budgetPeriodFilter"
                                value={filters.period}
                                onChange={(e) => setFilters(p => ({ ...p, period: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Periods</option>
                                {periods.map(p => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn-icon" onClick={handleReload} title="Reload" id="budgetReset">
                            <RotateCcw size={15} />
                        </button>
                    </div>

                    <div className="table-controls-right">
                        <div className="custom-select">
                            <select
                                id="budgetPerPage"
                                value={filters.perPage}
                                onChange={(e) => setFilters(p => ({ ...p, perPage: Number(e.target.value), page: 1 }))}
                            >
                                <option value={10}>Show 10</option>
                                <option value={25}>Show 25</option>
                                <option value={50}>Show 50</option>
                                <option value={100}>Show 100</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Budget</th>
                                <th>Period</th>
                                <th>Total</th>
                                <th>Progress</th>
                                <th style={{ width: '115px' }}>Status</th>
                                <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={`sk-${i}`} className="skeleton-pulse">
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <div className="skeleton-block" style={{ width: '55%', height: 14 }} />
                                                <div className="skeleton-block" style={{ width: '35%', height: 10 }} />
                                            </div>
                                        </td>
                                        <td><div className="skeleton-block" style={{ width: 60, height: 20, borderRadius: 20 }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '50%' }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <div className="skeleton-block" style={{ width: '100%', height: 7, borderRadius: 99 }} />
                                                <div className="skeleton-block" style={{ width: '60%', height: 10 }} />
                                            </div>
                                        </td>
                                        <td><div className="skeleton-block" style={{ width: 60, height: 20, borderRadius: 20 }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                {[0, 1, 2, 3].map(j => <div key={j} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card-border)' }} />)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : budgets.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <EmptyState
                                            message="No budgets found matching your filters."
                                            icon="Wallet"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                budgets.map((b) => (
                                    <tr key={b.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{b.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                {b.date_range_formatted}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge info">{b.period}</span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {b.total_amount_formatted}
                                        </td>
                                        <td style={{ minWidth: '160px' }}>
                                            <div className="bg-progress-wrap">
                                                <div className="bg-progress-bar">
                                                    <div
                                                        className={`bg-progress-fill ${progressFillClass(b)}`}
                                                        style={{ width: `${b.progress_bar_width || 0}%` }}
                                                    />
                                                </div>
                                                <span className="bg-progress-text" style={progressTextStyle(b)}>
                                                    {b.spent_amount_formatted} of {b.total_amount_formatted}
                                                    &nbsp;({Math.round(b.progress_percentage_normalized || 0)}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${b.is_active ? 'success' : 'danger'}`}>
                                                {b.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                                                {/* Add Expense */}
                                                <button
                                                    className="act-btn act-btn-view action"
                                                    title="Add Expense"
                                                    onClick={() => openAddExp(b)}
                                                    id={`btnAddExp-${b.id}`}
                                                >
                                                    <CirclePlus size={14} />
                                                </button>
                                                {/* View */}
                                                <button
                                                    className="act-btn act-btn-view"
                                                    title="View Detail"
                                                    onClick={() => openShow(b)}
                                                    id={`btnView-${b.id}`}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    className="act-btn act-btn-edit"
                                                    title="Edit"
                                                    onClick={() => openEdit(b)}
                                                    id={`btnEdit-${b.id}`}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    className="act-btn act-btn-delete"
                                                    title="Delete"
                                                    onClick={() => triggerDelete(b)}
                                                    id={`btnDelete-${b.id}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="table-footer">
                    <div className="table-info">
                        Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} entries
                    </div>
                    <div className="pagination">
                        <button onClick={() => handlePageChange(meta.current_page - 1)} disabled={meta.current_page === 1 || isLoading}>‹</button>
                        {renderPageNumbers()}
                        <button onClick={() => handlePageChange(meta.current_page + 1)} disabled={meta.current_page === meta.last_page || isLoading}>›</button>
                    </div>
                </div>
            </div>

            {/* ── Budget Modal ── */}
            <BudgetModal
                isOpen={isModalOpen}
                mode={modalMode}
                data={selectedBudget}
                periods={periods}
                currencies={currencies}
                categories={categories}
                onClose={() => { setIsModalOpen(false); setSelectedBudget(null); }}
                onSave={fetchBudgets}
                onShowToast={showToast}
            />

            {/* ── Confirm Delete ── */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                variant="danger"
                title="Delete Budget?"
                message={
                    <>
                        Are you sure you want to delete budget <strong>{budgetToDelete?.name}</strong>?
                        This action cannot be undone.
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
