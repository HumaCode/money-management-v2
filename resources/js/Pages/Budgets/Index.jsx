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
    const [budgets, setBudgets]   = useState([]);
    const [meta, setMeta]         = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // ── Filter state ─────────────────────────────────────────────
    const [filters, setFilters]   = useState({ search: '', status: 'all', period: 'all', perPage: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode]     = useState('create');
    const [selectedBudget, setSelectedBudget] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState(null);
    const [isDeleting, setIsDeleting]       = useState(false);

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

    useEffect(() => {
        fetchBudgets();
    }, [filters.status, filters.period, filters.perPage, filters.page, filters.search]);

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
    };

    const openCreate = () => { setSelectedBudget(null); setModalMode('create'); setIsModalOpen(true); };
    const openEdit   = (b) => { setSelectedBudget(b);    setModalMode('edit');   setIsModalOpen(true); };
    const openShow   = (b) => { setSelectedBudget(b);    setModalMode('show');   setIsModalOpen(true); };
    const openAddExp = (b) => { setSelectedBudget(b);    setModalMode('addExpense'); setIsModalOpen(true); };

    const openDelete = (b) => { setBudgetToDelete(b); setIsDeleteOpen(true); };

    const handleDelete = async () => {
        if (!budgetToDelete) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(route('budget.destroy', { budget: budgetToDelete.id }));
            if (res.data.success) {
                showToast('Budget deleted successfully!', 'success');
                setIsDeleteOpen(false);
                setBudgetToDelete(null);
                fetchBudgets();
            } else {
                showToast(res.data.message || 'Delete failed', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Server error', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Pagination ───────────────────────────────────────────────
    const goToPage = (page) => {
        if (page < 1 || page > meta.last_page) return;
        setFilters(prev => ({ ...prev, page }));
    };

    const renderPagination = () => {
        if (meta.last_page <= 1) return null;
        const pages = [];
        const start = Math.max(1, meta.current_page - 2);
        const end   = Math.min(meta.last_page, meta.current_page + 2);

        if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < meta.last_page) { if (end < meta.last_page - 1) pages.push('...'); pages.push(meta.last_page); }

        return (
            <div className="table-pagination">
                <button className="page-btn" onClick={() => goToPage(meta.current_page - 1)} disabled={meta.current_page <= 1}>‹</button>
                {pages.map((p, i) =>
                    p === '...' ? <span key={`e${i}`} className="page-ellipsis">…</span>
                        : <button key={p} className={`page-btn ${p === meta.current_page ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                )}
                <button className="page-btn" onClick={() => goToPage(meta.current_page + 1)} disabled={meta.current_page >= meta.last_page}>›</button>
            </div>
        );
    };

    // ── Progress helpers ──────────────────────────────────────────
    const progressClass = (b) => {
        if (b.status === 'over_budget') return 'error';
        if (b.status === 'near_limit')  return 'warning';
        return '';
    };
    const progressTextClass = (b) => {
        if (b.status === 'over_budget') return 'text-error';
        if (b.status === 'near_limit')  return 'text-warning';
        return '';
    };

    // ── Skeleton rows ─────────────────────────────────────────────
    const SkeletonRows = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                    <td><div className="skeleton skeleton-text" /></td>
                    <td><div className="skeleton skeleton-badge" /></td>
                    <td><div className="skeleton skeleton-text short" /></td>
                    <td><div className="skeleton skeleton-text" /></td>
                    <td><div className="skeleton skeleton-badge" /></td>
                    <td><div className="skeleton skeleton-actions" /></td>
                </tr>
            ))}
        </>
    );

    return (
        <AuthenticatedLayout>
            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">{subtitle}</p>
                </div>
                <button className="btn-add" id="btnAddBudget" onClick={openCreate}>
                    <Plus size={16} /> Add Budget
                </button>
            </div>

            {/* ── Filter Bar ── */}
            <div className="filter-bar" id="budgetFilterBar">
                {/* Search */}
                <div className="filter-search-wrap">
                    <Search size={15} className="filter-search-icon" />
                    <input
                        id="budgetSearch"
                        className="filter-search-input"
                        type="text"
                        placeholder="Search budgets..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Status */}
                <select id="budgetStatusFilter" className="filter-select"
                    value={filters.status}
                    onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                {/* Period */}
                <select id="budgetPeriodFilter" className="filter-select"
                    value={filters.period}
                    onChange={e => setFilters(p => ({ ...p, period: e.target.value, page: 1 }))}
                >
                    <option value="all">All Periods</option>
                    {periods.map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                </select>

                {/* Per page */}
                <select id="budgetPerPage" className="filter-select"
                    value={filters.perPage}
                    onChange={e => setFilters(p => ({ ...p, perPage: Number(e.target.value), page: 1 }))}
                >
                    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>

                {/* Reset */}
                <button id="budgetReset" className="filter-reset-btn" onClick={handleReload} title="Reset filters">
                    <RotateCcw size={15} />
                </button>
            </div>

            {/* ── Table ── */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="data-table" id="budgetTable">
                        <thead>
                            <tr>
                                <th>Budget</th>
                                <th>Period</th>
                                <th>Total</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th style={{ width: '130px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <SkeletonRows />
                            ) : budgets.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <EmptyState
                                            icon={Wallet}
                                            title="No budgets found"
                                            description="Start by adding your first budget to track your spending."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                budgets.map(b => (
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
                                        <td style={{ fontWeight: 500 }}>
                                            {b.total_amount_formatted}
                                        </td>
                                        <td style={{ minWidth: '160px' }}>
                                            <div className="bg-progress-wrap">
                                                <div className="bg-progress-bar">
                                                    <div
                                                        className={`bg-progress-fill ${progressClass(b)}`}
                                                        style={{ width: `${b.progress_bar_width}%` }}
                                                    />
                                                </div>
                                                <span className={`bg-progress-text ${progressTextClass(b)}`}>
                                                    {b.spent_amount_formatted} of {b.total_amount_formatted}
                                                    &nbsp;({Math.round(b.progress_percentage_normalized)}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${b.is_active ? 'success' : 'danger'}`}>
                                                {b.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {/* Add Expense */}
                                                <button
                                                    className="btn-action view action"
                                                    title="Add Expense"
                                                    onClick={() => openAddExp(b)}
                                                    id={`btnAddExp-${b.id}`}
                                                >
                                                    <CirclePlus size={15} />
                                                </button>
                                                {/* View */}
                                                <button
                                                    className="btn-action view"
                                                    title="View Detail"
                                                    onClick={() => openShow(b)}
                                                    id={`btnView-${b.id}`}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    className="btn-action edit"
                                                    title="Edit"
                                                    onClick={() => openEdit(b)}
                                                    id={`btnEdit-${b.id}`}
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    className="btn-action delete"
                                                    title="Delete"
                                                    onClick={() => openDelete(b)}
                                                    id={`btnDelete-${b.id}`}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Footer ── */}
                <div className="table-footer">
                    <span className="table-info">
                        {meta.total > 0
                            ? `Showing ${meta.from}–${meta.to} of ${meta.total} entries`
                            : 'No entries'}
                    </span>
                    {renderPagination()}
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
                title="Delete Budget"
                message={`Are you sure you want to delete budget "${budgetToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => { setIsDeleteOpen(false); setBudgetToDelete(null); }}
                isLoading={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
