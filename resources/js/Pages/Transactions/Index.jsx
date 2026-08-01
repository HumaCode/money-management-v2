import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import TransactionModal from '../../Components/TransactionModal';
import ConfirmModal from '../../Components/ConfirmModal';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { 
    Eye, Edit, Trash2, Search, RotateCcw, Plus, 
    TrendingUp, TrendingDown, RefreshCw, ArrowLeftRight, Wallet 
} from 'lucide-react';

export default function Index({ title, subtitle, initialType = 'all', accounts = [], categories = [], currencies = [] }) {
    // ── Data state ──────────────────────────────────────────────
    const [transactions, setTransactions] = useState([]);
    const [meta, setMeta] = useState({
        current_page: 1, last_page: 1, from: 0, to: 0, total: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    // ── Filter / search state ────────────────────────────────────
    const [filters, setFilters] = useState({
        search: '', type: initialType || 'all', category_id: 'all', account_id: 'all', perPage: 10, page: 1
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (initialType) {
            setFilters(prev => ({
                ...prev,
                type: initialType,
                page: 1
            }));
        }
    }, [initialType]);

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen]               = useState(false);
    const [modalMode, setModalMode]                   = useState('create'); // 'create' | 'edit' | 'show'
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen]             = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [isDeleting, setIsDeleting]                 = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch Transactions ───────────────────────────────────────
    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('transaction.allPagination'), {
                params: {
                    search:       filters.search || null,
                    type:         filters.type === 'all' ? null : filters.type,
                    category_id:  filters.category_id === 'all' ? null : filters.category_id,
                    account_id:   filters.account_id === 'all' ? null : filters.account_id,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setTransactions(response.data.data.data || []);
                setMeta(response.data.data.meta || {
                    current_page: 1, last_page: 1, from: 0, to: 0, total: 0
                });
            } else {
                showToast(response.data.message || 'Failed to retrieve transactions', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading transaction data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTransactions();
    }, [filters.type, filters.category_id, filters.account_id, filters.perPage, filters.page, filters.search]);

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
        setFilters({ search: '', type: 'all', category_id: 'all', account_id: 'all', perPage: 10, page: 1 });
        showToast('Table data refreshed', 'info');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.last_page) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleOpenCreate = () => { 
        setSelectedTransaction(null); 
        setModalMode('create'); 
        setIsModalOpen(true); 
    };

    const handleOpenEdit = (tx) => { 
        setSelectedTransaction(tx); 
        setModalMode('edit'); 
        setIsModalOpen(true); 
    };

    const handleOpenShow = (tx) => { 
        setSelectedTransaction(tx); 
        setModalMode('show'); 
        setIsModalOpen(true); 
    };

    const triggerDelete = (tx) => { 
        setTransactionToDelete(tx); 
        setIsDeleteOpen(true); 
    };

    const closeDelete = () => {
        if (isDeleting) return;
        setIsDeleteOpen(false);
        setTransactionToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!transactionToDelete) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(route('transaction.destroy', { transaction: transactionToDelete.id }));
            if (response.data.success) {
                showToast(response.data.message || 'Transaction deleted successfully!', 'success');
                if (transactions.length === 1 && filters.page > 1) {
                    setFilters(prev => ({ ...prev, page: prev.page - 1 }));
                } else {
                    fetchTransactions();
                }
                closeDelete();
            } else {
                showToast(response.data.message || 'Failed to delete transaction', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error deleting transaction', 'error');
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

    // Summary calculations from loaded transactions
    const summary = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += Number(t.amount || 0);
            if (t.type === 'expense') totalExpense += Number(t.amount || 0);
        });

        return {
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
            count: meta.total || transactions.length
        };
    }, [transactions, meta]);

    // AOS
    useEffect(() => {
        if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    }, []);

    const breadcrumbs = [
        { label: 'Transactions', href: null },
        { label: 'All Transactions', href: null },
    ];

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <style>{`
                /* ── Action button styles ── */
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

                /* View — soft sky blue */
                .act-btn-view {
                    background: rgba(96, 165, 250, 0.15);
                    color: #60a5fa;
                    box-shadow: 0 2px 8px rgba(96, 165, 250, 0.1);
                }
                .act-btn-view:hover { box-shadow: 0 4px 14px rgba(96, 165, 250, 0.25); }

                /* Edit — soft emerald */
                .act-btn-edit {
                    background: rgba(52, 211, 153, 0.15);
                    color: #34d399;
                    box-shadow: 0 2px 8px rgba(52, 211, 153, 0.1);
                }
                .act-btn-edit:hover { box-shadow: 0 4px 14px rgba(52, 211, 153, 0.25); }

                /* Delete — soft rose */
                .act-btn-delete {
                    background: rgba(248, 113, 113, 0.12);
                    color: #f87171;
                    box-shadow: 0 2px 8px rgba(248, 113, 113, 0.08);
                }
                .act-btn-delete:hover { box-shadow: 0 4px 14px rgba(248, 113, 113, 0.22); }

                /* Light-mode overrides */
                html.light .act-btn-view   { background: rgba(59, 130, 246, 0.08); color: #2563eb; }
                html.light .act-btn-edit   { background: rgba(16, 185, 129, 0.08); color: #059669; }
                html.light .act-btn-delete { background: rgba(239, 68,  68, 0.08); color: #dc2626; }

                /* ── Skeleton ── */
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
                        <ArrowLeftRight size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'Transactions'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Manage and track all income and expense transactions'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary action"
                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <Plus size={16} />
                    Add Transaction
                </button>
            </div>

            {/* ── Overview Metric Cards ── */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
                    <div className="stat-card-header">
                        <div className="stat-card-icon success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp {summary.totalIncome.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</h3>
                        <p>Total Income</p>
                    </div>
                </div>

                <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
                    <div className="stat-card-header">
                        <div className="stat-card-icon error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp {summary.totalExpense.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</h3>
                        <p>Total Expenses</p>
                    </div>
                </div>

                <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
                    <div className="stat-card-header">
                        <div className="stat-card-icon primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeftRight size={20} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp {summary.netBalance.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</h3>
                        <p>Net Cashflow</p>
                    </div>
                </div>

                <div className="stat-card" data-aos="fade-up" data-aos-delay="400">
                    <div className="stat-card-header">
                        <div className="stat-card-icon warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <h3>{summary.count}</h3>
                        <p>Total Records</p>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div className="table-card" data-aos="fade-up">

                {/* Controls */}
                <div className="table-controls">
                    <div className="table-controls-left">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search description, notes, ref..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="custom-select">
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters(p => ({ ...p, type: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                                <option value="transfer">Transfer</option>
                            </select>
                        </div>

                        <div className="custom-select">
                            <select
                                value={filters.category_id}
                                onChange={(e) => setFilters(p => ({ ...p, category_id: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="custom-select">
                            <select
                                value={filters.account_id}
                                onChange={(e) => setFilters(p => ({ ...p, account_id: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Accounts</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn-icon" onClick={handleReload} title="Reload Data">
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

                {/* Table */}
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '130px' }}>Date</th>
                                <th style={{ width: '110px' }}>Type</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Account</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={`sk-${i}`} className="skeleton-pulse">
                                        <td><div className="skeleton-block" style={{ width: '80%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: 60, height: 20, borderRadius: 20 }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '75%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '60%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '65%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '70%', marginLeft: 'auto' }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                {[0,1,2].map(j => <div key={j} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card-border)' }} />)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <EmptyState 
                                            message="No data found matching your filters."
                                            icon="FolderOpen"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((row) => {
                                    const isIncome = row.type === 'income';
                                    const isExpense = row.type === 'expense';
                                    const isTransfer = row.type === 'transfer';

                                    const typeClass = isIncome ? 'success' : (isExpense ? 'danger' : 'info');
                                    const typeColor = isIncome ? '#34d399' : (isExpense ? '#f87171' : '#60a5fa');
                                    const typeBg = isIncome ? 'rgba(52, 211, 153, 0.12)' : (isExpense ? 'rgba(248, 113, 113, 0.12)' : 'rgba(96, 165, 250, 0.12)');
                                    const typeBorder = isIncome ? 'rgba(52, 211, 153, 0.25)' : (isExpense ? 'rgba(248, 113, 113, 0.25)' : 'rgba(96, 165, 250, 0.25)');

                                    return (
                                        <tr key={row.id}>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                {row.transaction_date_formatted || row.transaction_date}
                                            </td>

                                            <td>
                                                <span className={`badge ${typeClass}`} style={{
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
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {row.description}
                                                </div>
                                                {row.reference_number && row.reference_number !== '—' && (
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        Ref: {row.reference_number}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                {row.category ? (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11.5px',
                                                        fontWeight: 600,
                                                        color: row.category.color || row.color || 'var(--text-primary)',
                                                        background: row.category.color ? `${row.category.color}18` : 'var(--bg-input)',
                                                        border: `1px solid ${row.category.color ? `${row.category.color}35` : 'var(--bg-card-border)'}`,
                                                    }}>
                                                        <span style={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            background: row.category.color || row.color || 'var(--accent)',
                                                            boxShadow: `0 0 6px ${row.category.color || row.color}`
                                                        }} />
                                                        {row.category.name}
                                                    </span>
                                                ) : isTransfer ? (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11.5px',
                                                        fontWeight: 600,
                                                        color: '#60a5fa',
                                                        background: 'rgba(96, 165, 250, 0.12)',
                                                        border: '1px solid rgba(96, 165, 250, 0.25)',
                                                    }}>
                                                        Transfer
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11.5px',
                                                        fontWeight: 500,
                                                        color: 'var(--text-secondary)',
                                                        background: 'var(--bg-input)',
                                                        border: '1px solid var(--bg-card-border)',
                                                    }}>
                                                        Uncategorized
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {isTransfer ? (
                                                    <span>
                                                        {row.account?.name || 'Account'} &rarr; {row.to_account?.name || 'Target'}
                                                    </span>
                                                ) : (
                                                    row.account?.name || '—'
                                                )}
                                            </td>

                                            <td style={{ 
                                                textAlign: 'right', 
                                                fontWeight: 600,
                                                color: isIncome ? 'var(--accent, #34d399)' : (isExpense ? '#f87171' : '#60a5fa')
                                            }}>
                                                {row.amount_formatted}
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
                                                        title="Edit Transaction"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        className="act-btn act-btn-delete"
                                                        onClick={() => triggerDelete(row)}
                                                        title="Delete Transaction"
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

                {/* Table Footer */}
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

            {/* ── Transaction Form / Detail Modal ── */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                transaction={selectedTransaction}
                accounts={accounts}
                categories={categories}
                currencies={currencies}
                onSaved={fetchTransactions}
                showToast={showToast}
            />

            {/* ── Delete Confirmation ── */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                variant="danger"
                title="Delete Transaction?"
                message={
                    <>
                        Are you sure you want to delete transaction{' '}
                        <b style={{ color: 'var(--text-primary)' }}>{transactionToDelete?.description}</b>?
                        {' '}This action cannot be undone.
                    </>
                }
                confirmLabel="Yes, Delete"
                cancelLabel="Cancel"
            />
        </AuthenticatedLayout>
    );
}
