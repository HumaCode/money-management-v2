import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import AccountModal from '../../Components/AccountModal';
import ConfirmModal from '../../Components/ConfirmModal';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, RotateCcw, Plus, Landmark } from 'lucide-react';

export default function Index({ title, subtitle, accountTypes, currencies }) {
    // ── Data state ──────────────────────────────────────────────
    const [accounts, setAccounts] = useState([]);
    const [meta, setMeta] = useState({
        current_page: 1, last_page: 1, from: 0, to: 0, total: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    // ── Filter / search state ────────────────────────────────────
    const [filters, setFilters] = useState({
        search: '', status: 'all', type: 'all', perPage: 10, page: 1
    });
    const [searchTerm, setSearchTerm] = useState('');

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [modalMode, setModalMode]         = useState('create');
    const [selectedAccount, setSelectedAccount] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [isDeleting, setIsDeleting]       = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch ────────────────────────────────────────────────────
    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('account.allPagination'), {
                params: {
                    search:       filters.search || null,
                    status:       filters.status === 'all' ? null : filters.status,
                    type:         filters.type   === 'all' ? null : filters.type,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setAccounts(response.data.data.data || []);
                setMeta(response.data.data.meta || {
                    current_page: 1, last_page: 1, from: 0, to: 0, total: 0
                });
            } else {
                showToast(response.data.message || 'Failed to retrieve accounts', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading account data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchAccounts();
    }, [filters.status, filters.type, filters.perPage, filters.page, filters.search]);

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
        setFilters({ search: '', status: 'all', type: 'all', perPage: 10, page: 1 });
        showToast('Table data refreshed', 'info');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.last_page)
            setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleOpenCreate = () => { setSelectedAccount(null); setModalMode('create'); setIsModalOpen(true); };
    const handleOpenEdit   = (acc) => { setSelectedAccount(acc); setModalMode('edit');   setIsModalOpen(true); };
    const handleOpenShow   = (acc) => { setSelectedAccount(acc); setModalMode('show');   setIsModalOpen(true); };

    const handleAccountSaved = () => {
        if (modalMode === 'create') {
            setSearchTerm('');
            setFilters(prev => ({
                ...prev,
                search: '',
                status: 'all',
                type: 'all',
                page: 1
            }));
        }
        fetchAccounts();
    };

    const triggerDelete = (acc) => { setAccountToDelete(acc); setIsDeleteOpen(true); };
    const closeDelete   = () => { if (isDeleting) return; setIsDeleteOpen(false); setAccountToDelete(null); };

    const handleDeleteConfirm = async () => {
        if (!accountToDelete) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(route('account.destroy', { account: accountToDelete.id }));
            if (response.data.success) {
                showToast('Account deleted successfully!', 'success');
                if (accounts.length === 1 && filters.page > 1) {
                    setFilters(prev => ({ ...prev, page: prev.page - 1 }));
                } else {
                    fetchAccounts();
                }
                closeDelete();
            } else {
                showToast(response.data.message || 'Failed to delete account', 'error');
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

    return (
        <AuthenticatedLayout>
            {/* Dynamic Island Toast */}
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
                        <Landmark size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>{subtitle}</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary action"
                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <Plus size={16} />
                    Add Data
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
                                value={filters.type}
                                onChange={(e) => setFilters(p => ({ ...p, type: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Types</option>
                                {Object.entries(accountTypes).map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
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

                {/* Table */}
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Type</th>
                                <th>Institution</th>
                                <th>Currency</th>
                                <th>Balance</th>
                                <th style={{ width: '115px' }}>Status</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={`sk-${i}`} className="skeleton-pulse">
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-card-border)' }} />
                                                <div style={{ flex: 1 }}>
                                                    <div className="skeleton-block" style={{ width: '60%', height: 14 }} />
                                                    <div className="skeleton-block" style={{ width: '40%', height: 10, marginTop: 6 }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td><div className="skeleton-block" style={{ width: '50%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '70%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '30%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '40%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: 60, height: 20, borderRadius: 20 }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                {[0,1,2].map(j => <div key={j} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card-border)' }} />)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <EmptyState 
                                            message="No accounts found matching your filters."
                                            icon="Landmark"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div
                                                    className="account-icon"
                                                    style={{
                                                        background: row.color ? row.color : 'rgba(125,211,168,0.15)',
                                                        color: '#ffffff',
                                                    }}
                                                >
                                                    {row.icon || '💰'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>
                                                        {row.name}
                                                        {row.is_default && (
                                                            <span className="badge success" style={{ marginLeft: '8px', fontSize: '9.5px', padding: '1px 5px' }}>Default</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.masked_account_number || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{row.account_type?.name || '—'}</td>
                                        <td>{row.institution_name || '—'}</td>
                                        <td>{row.currency?.code || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{row.balance_formatted || '—'}</td>
                                        <td>
                                            <span className={`badge ${row.is_active ? 'success' : 'danger'}`}>
                                                {row.is_active ? 'Active' : 'Inactive'}
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
                                                    title="Edit Account"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    className="act-btn act-btn-delete"
                                                    onClick={() => triggerDelete(row)}
                                                    title="Delete Account"
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

            {/* ── Account Form / Detail Modal ── */}
            <AccountModal
                isOpen={isModalOpen}
                mode={modalMode}
                data={selectedAccount}
                accountTypes={accountTypes}
                currencies={currencies}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAccountSaved}
                onShowToast={showToast}
            />

            {/* ── Delete Confirmation ── */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                variant="danger"
                title="Delete Account?"
                message={
                    <>
                        Are you sure you want to delete account <strong>{accountToDelete?.name}</strong>?
                        This action cannot be undone.
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
