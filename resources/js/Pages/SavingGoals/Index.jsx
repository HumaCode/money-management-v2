import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import SavingGoalModal from '../../Components/SavingGoalModal';
import ConfirmModal from '../../Components/ConfirmModal';
import SavingGoalContributionsListModal from '../../Components/SavingGoalContributionsListModal';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, RotateCcw, Plus, CirclePlus, Target } from 'lucide-react';

export default function Index({ title, subtitle, currencies, accounts, statuses }) {
    // ── Data state ──────────────────────────────────────────────
    const [savingGoals, setSavingGoals] = useState([]);
    const [meta, setMeta]               = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
    const [isLoading, setIsLoading]     = useState(false);

    // ── Filter state ─────────────────────────────────────────────
    const [filters, setFilters]         = useState({ search: '', status: 'all', perPage: 10, page: 1 });
    const [searchTerm, setSearchTerm]   = useState('');

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [modalMode, setModalMode]         = useState('create');
    const [selectedGoal, setSelectedGoal]   = useState(null);

    const [isContributionsModalOpen, setIsContributionsModalOpen] = useState(false);
    const [selectedGoalForContributions, setSelectedGoalForContributions] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
    const [goalToDelete, setGoalToDelete]   = useState(null);
    const [isDeleting, setIsDeleting]       = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch ────────────────────────────────────────────────────
    const fetchSavingGoals = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('saving.goals.allPagination'), {
                params: {
                    search:       filters.search || null,
                    status:       filters.status === 'all' ? null : filters.status,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setSavingGoals(response.data.data.data || []);
                setMeta(response.data.data.meta || { current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
            } else {
                showToast(response.data.message || 'Failed to retrieve saving goals', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch data from server', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters, showToast]);

    useEffect(() => {
        fetchSavingGoals();
    }, [filters.page, filters.perPage, filters.status, fetchSavingGoals]);

    // Apply search on click/enter
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    };

    // ── Handlers ─────────────────────────────────────────────────
    const handleReload = () => {
        setSearchTerm('');
        setFilters({ search: '', status: 'all', perPage: 10, page: 1 });
        showToast('Table data refreshed', 'info');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.last_page)
            setFilters(prev => ({ ...prev, page: newPage }));
    };

    const openCreate = () => { setSelectedGoal(null); setModalMode('create'); setIsModalOpen(true); };
    const openEdit   = (g) => { setSelectedGoal(g);    setModalMode('edit');   setIsModalOpen(true); };
    const openShow   = (g) => { setSelectedGoal(g);    setModalMode('show');   setIsModalOpen(true); };
    const openAddSaving = (g) => { setSelectedGoal(g); setModalMode('addSaving'); setIsModalOpen(true); };

    const handleShowContributions = (g) => {
        setIsModalOpen(false);
        setSelectedGoalForContributions(g);
        setIsContributionsModalOpen(true);
    };

    const handleBackToDetail = (g) => {
        setIsContributionsModalOpen(false);
        setSelectedGoal(g);
        setModalMode('show');
        setIsModalOpen(true);
    };

    const triggerDelete = (g) => { setGoalToDelete(g); setIsDeleteOpen(true); };
    const closeDelete   = () => { if (isDeleting) return; setIsDeleteOpen(false); setGoalToDelete(null); };

    const handleDeleteConfirm = async () => {
        if (!goalToDelete) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(route('saving.goals.destroy', { saving: goalToDelete.id }));
            if (res.data.success) {
                showToast('Saving goal deleted successfully!', 'success');
                if (savingGoals.length === 1 && filters.page > 1) {
                    setFilters(prev => ({ ...prev, page: prev.page - 1 }));
                } else {
                    fetchSavingGoals();
                }
                closeDelete();
            } else {
                showToast(res.data.message || 'Failed to delete saving goal', 'error');
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
                        <Target size={20} />
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
                    id="btnAddSavingGoal"
                >
                    <Plus size={16} /> Add Saving Goal
                </button>
            </div>

            {/* ── Table Card ── */}
            <div className="table-card" style={{ marginBottom: '24px' }}>
                
                {/* Controls */}
                <div className="table-controls">
                    <div className="table-controls-left">
                        <form onSubmit={handleSearchSubmit} className="search-box">
                            <Search size={16} />
                            <input
                                id="savingSearch"
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </form>

                        <div className="custom-select">
                            <select
                                id="savingStatusFilter"
                                value={filters.status}
                                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Status</option>
                                {statuses.map(st => (
                                    <option key={st} value={st}>
                                        {st.charAt(0).toUpperCase() + st.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className="btn-icon" onClick={handleReload} title="Reload" id="savingReset">
                            <RotateCcw size={15} />
                        </button>
                    </div>

                    <div className="table-controls-right">
                        <div className="custom-select">
                            <select
                                id="savingPerPage"
                                value={filters.perPage}
                                onChange={e => setFilters(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
                            >
                                <option value={10}>Show 10</option>
                                <option value={25}>Show 25</option>
                                <option value={50}>Show 50</option>
                                <option value={100}>Show 100</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Main Data Table ── */}
                <div className="table-wrapper">
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                            <span className="bm-spinner" style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--accent)' }} />
                            <span style={{ marginTop: '14px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Loading goals...</span>
                        </div>
                    ) : savingGoals.length === 0 ? (
                        <EmptyState
                            icon={<Target size={36} />}
                            title="No saving goals found"
                            description={
                                filters.search || filters.status !== 'all'
                                    ? "Try adjusting your filters or search keywords to find what you're looking for."
                                    : "Start setting up your target saving goals and track your progress easily!"
                            }
                            action={
                                filters.search || filters.status !== 'all' ? (
                                    <button className="btn btn-secondary" onClick={handleReload}>Clear Filters</button>
                                ) : (
                                    <button className="btn btn-primary" onClick={openCreate}>Create Goal</button>
                                )
                            }
                        />
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Goal</th>
                                    <th>Source Account</th>
                                    <th>Target Amount</th>
                                    <th>Saved Progress</th>
                                    <th>Target Date</th>
                                    <th>Status</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savingGoals.map((goal) => (
                                    <tr key={goal.id}>
                                        {/* Goal Info */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="account-icon" style={{
                                                    background: goal.color ? `${goal.color}18` : 'var(--accent-dim)',
                                                    color: goal.color || 'var(--accent)',
                                                    fontSize: '18px', width: '38px', height: '38px', borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    {goal.icon || '🎯'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{goal.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                                        {goal.description || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Source Account */}
                                        <td>
                                            <span className="badge info">
                                                {goal.account?.name || '—'}
                                            </span>
                                        </td>

                                        {/* Target Amount */}
                                        <td style={{ fontWeight: 500 }}>
                                            {goal.target_amount_formatted}
                                        </td>

                                        {/* Saved Progress */}
                                        <td>
                                            <div className="sg-progress-wrap" style={{ maxWidth: '160px' }}>
                                                <div className="sg-progress-bar">
                                                    <div className="sg-progress-fill" style={{ width: `${goal.progress_bar_width || 0}%`, background: goal.color }} />
                                                </div>
                                                <span className="sg-progress-text" style={{ fontSize: '11px' }}>
                                                    {goal.current_amount_formatted} ({goal.progress_percentage}%)
                                                </span>
                                            </div>
                                        </td>

                                        {/* Target Date */}
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                            {goal.target_date_formatted}
                                        </td>

                                        {/* Status Badge */}
                                        <td>
                                            <span className={`badge ${
                                                goal.status === 'completed' ? 'success' :
                                                goal.status === 'paused' ? 'warning' :
                                                goal.status === 'cancelled' ? 'danger' : 'info'
                                            }`}>
                                                {goal.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
                                                {/* Add Saving */}
                                                <button
                                                    className="act-btn act-btn-view action"
                                                    title="Add Saving"
                                                    onClick={() => openAddSaving(goal)}
                                                    id={`btnAddSaving-${goal.id}`}
                                                >
                                                    <CirclePlus size={14} />
                                                </button>
                                                {/* View */}
                                                <button
                                                    className="act-btn act-btn-view"
                                                    title="View Detail"
                                                    onClick={() => openShow(goal)}
                                                    id={`btnView-${goal.id}`}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    className="act-btn act-btn-edit"
                                                    title="Edit"
                                                    onClick={() => openEdit(goal)}
                                                    id={`btnEdit-${goal.id}`}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    className="act-btn act-btn-delete"
                                                    title="Delete"
                                                    onClick={() => triggerDelete(goal)}
                                                    id={`btnDelete-${goal.id}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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

            {/* ── Saving Goal Modal ── */}
            <SavingGoalModal
                isOpen={isModalOpen}
                mode={modalMode}
                data={selectedGoal}
                currencies={currencies}
                accounts={accounts}
                onClose={() => { setIsModalOpen(false); setSelectedGoal(null); }}
                onSave={fetchSavingGoals}
                onShowToast={showToast}
                onShowContributions={handleShowContributions}
            />

            {/* ── Saving Goal Contributions List Modal ── */}
            <SavingGoalContributionsListModal
                isOpen={isContributionsModalOpen}
                saving={selectedGoalForContributions}
                onClose={() => { setIsContributionsModalOpen(false); setSelectedGoalForContributions(null); }}
                onBackToDetail={handleBackToDetail}
                onShowToast={showToast}
            />

            {/* ── Confirm Delete ── */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                variant="danger"
                title="Delete Saving Goal?"
                message={
                    <>
                        Are you sure you want to delete saving goal <strong>{goalToDelete?.name}</strong>?
                        This action cannot be undone.
                    </>
                }
            />
        </AuthenticatedLayout>
    );
}
