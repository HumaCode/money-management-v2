import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import BudgetModal from '../../Components/BudgetModal';
import ConfirmModal from '../../Components/ConfirmModal';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import { useCan } from '../../Hooks/useCan';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, RotateCcw, Plus, CalendarRange } from 'lucide-react';

export default function Index({ title, subtitle, periods = [], currencies = [], categories = [] }) {
    // ── Data state ──────────────────────────────────────────────
    const [budgets, setBudgets] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // ── Filter / search state ────────────────────────────────────
    const [filters, setFilters] = useState({ search: '', status: 'all', period: 'all', perPage: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedBudget, setSelectedBudget] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Toast & Permissions ─────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);
    const { can } = useCan();

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
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading budgets data', 'error');
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
        showToast('Table data refreshed', 'info');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.last_page) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleOpenCreate = () => { setSelectedBudget(null); setModalMode('create'); setIsModalOpen(true); };
    const handleOpenEdit   = (b) => { setSelectedBudget(b); setModalMode('edit'); setIsModalOpen(true); };
    const handleOpenShow   = (b) => { setSelectedBudget(b); setModalMode('show'); setIsModalOpen(true); };

    const handleBudgetSaved = () => {
        if (modalMode === 'create') {
            setSearchTerm('');
            setFilters(prev => ({ ...prev, search: '', status: 'all', period: 'all', page: 1 }));
        }
        fetchBudgets();
    };

    const triggerDelete = (b) => { setBudgetToDelete(b); setIsDeleteOpen(true); };
    const closeDelete   = () => { if (isDeleting) return; setIsDeleteOpen(false); setBudgetToDelete(null); };

    const handleDeleteConfirm = async () => {
        if (!budgetToDelete) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(route('budget.destroy', { budget: budgetToDelete.id }));
            if (response.data.success) {
                showToast('Budget deleted successfully!', 'success');
                if (budgets.length === 1 && filters.page > 1) {
                    setFilters(prev => ({ ...prev, page: prev.page - 1 }));
                } else {
                    fetchBudgets();
                }
                closeDelete();
            } else {
                showToast(response.data.message || 'Failed to delete budget', 'error');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Server error during deletion', 'error');
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
                : <button key={`p${p}`} onClick={() => handlePageChange(p)} className={p === current ? 'active' : ''}>{p}</button>
        );
    };

    return (
        <AuthenticatedLayout>
            <style>{`
                .act-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
                    flex-shrink: 0;
                }
                .act-btn:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.15);
                }
                .act-btn:active { transform: scale(0.92); }

                .act-btn-view {
                    background: rgba(96, 165, 250, 0.15);
                    color: #60a5fa;
                    box-shadow: 0 2px 8px rgba(96, 165, 250, 0.1);
                }
                .act-btn-view:hover { box-shadow: 0 4px 14px rgba(96, 165, 250, 0.25); }

                .act-btn-edit {
                    background: rgba(52, 211, 153, 0.15);
                    color: #34d399;
                    box-shadow: 0 2px 8px rgba(52, 211, 153, 0.1);
                }
                .act-btn-edit:hover { box-shadow: 0 4px 14px rgba(52, 211, 153, 0.25); }

                .act-btn-delete {
                    background: rgba(248, 113, 113, 0.12);
                    color: #f87171;
                    box-shadow: 0 2px 8px rgba(248, 113, 113, 0.08);
                }
                .act-btn-delete:hover { box-shadow: 0 4px 14px rgba(248, 113, 113, 0.22); }

                html.light .act-btn-view   { background: rgba(59, 130, 246, 0.08); color: #2563eb; }
                html.light .act-btn-edit   { background: rgba(16, 185, 129, 0.08); color: #059669; }
                html.light .act-btn-delete { background: rgba(239, 68,  68, 0.08); color: #dc2626; }

                .skeleton-pulse { animation: sk-pulse 1.4s ease-in-out infinite; }
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
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'var(--accent-dim)', border: '1px solid var(--bg-card-border)',
                        color: 'var(--accent)', flexShrink: 0
                    }}>
                        <CalendarRange size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'Manage Budgets'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Set spending limits and track your financial goals'}
                        </p>
                    </div>
                </div>
                {can('create budgets') && (
                    <button
                        onClick={handleOpenCreate}
                        className="btn-primary action"
                        style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={16} />
                        Add Data
                    </button>
                )}
            </div>

            {/* ── Table Card ── */}
            <div className="table-card">
                <div className="table-controls">
                    <div className="table-controls-left">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="custom-select">
                            <select
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
                                value={filters.period}
                                onChange={(e) => setFilters(p => ({ ...p, period: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Periods</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        <button className="btn-icon" onClick={handleReload} title="Reload">
                            <RotateCcw size={15} />
                        </button>
                    </div>

                    <div className="table-controls-right">
                        <div className="custom-select">
                            <select
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

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Budget Name</th>
                                <th>Period</th>
                                <th>Total Amount</th>
                                <th>Spent / Progress</th>
                                <th style={{ width: '115px' }}>Status</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={`sk-${i}`} className="skeleton-pulse">
                                        <td><div className="skeleton-block" style={{ width: '70%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '50%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '60%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '55%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: 60, height: 20, borderRadius: 20 }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                {[0,1,2].map(j => <div key={j} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card-border)' }} />)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : budgets.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <EmptyState message="No budget records found." icon="CalendarRange" />
                                    </td>
                                </tr>
                            ) : (
                                budgets.map((row) => (
                                    <tr key={row.id}>
                                        <td style={{ fontWeight: 500 }}>{row.name}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{row.period || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{row.amount_formatted || row.total_amount || '0'}</td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                                {row.spent_formatted || '0'}
                                            </div>
                                            {row.progress_percentage !== undefined && (
                                                <div style={{ width: '100px', height: '4px', background: 'var(--bg-card-border)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${Math.min(100, row.progress_percentage)}%`,
                                                        height: '100%',
                                                        background: row.progress_percentage > 90 ? '#f87171' : 'var(--accent)',
                                                        borderRadius: '2px'
                                                    }} />
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${row.is_active ? 'success' : 'danger'}`}>
                                                {row.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                                                {can('show budgets') && (
                                                    <button
                                                        className="act-btn act-btn-view"
                                                        onClick={() => handleOpenShow(row)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                                {can('update budgets') && (
                                                    <button
                                                        className="act-btn act-btn-edit"
                                                        onClick={() => handleOpenEdit(row)}
                                                        title="Edit Budget"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                )}
                                                {can('delete budgets') && (
                                                    <button
                                                        className="act-btn act-btn-delete"
                                                        onClick={() => triggerDelete(row)}
                                                        title="Delete Budget"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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

            {/* ── Budget Form / Detail Modal ── */}
            <BudgetModal
                isOpen={isModalOpen}
                mode={modalMode}
                data={selectedBudget}
                periods={periods}
                currencies={currencies}
                categories={categories}
                onClose={() => setIsModalOpen(false)}
                onSave={handleBudgetSaved}
                onShowToast={showToast}
            />

            {/* ── Delete Confirmation ── */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                variant="danger"
                title="Delete Budget?"
                message={
                    <>
                        Are you sure you want to delete budget{' '}
                        <b style={{ color: 'var(--text-primary)' }}>{budgetToDelete?.name}</b>?
                        {' '}This action cannot be undone.
                    </>
                }
                confirmLabel="Yes, Delete"
                cancelLabel="Cancel"
            />
        </AuthenticatedLayout>
    );
}
