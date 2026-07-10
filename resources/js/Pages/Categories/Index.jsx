import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import CategoryModal from '../../Components/CategoryModal';
import ConfirmModal from '../../Components/ConfirmModal';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, RotateCcw, Plus, LayoutDashboard, FolderTree } from 'lucide-react';

export default function Index({ title, subtitle, parentCategories }) {
    // ── Data state ──────────────────────────────────────────────
    const [categories, setCategories] = useState([]);
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
    const [selectedCategory, setSelectedCategory] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting]       = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch ────────────────────────────────────────────────────
    const fetchCategories = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await axios.get(route('category.allPagination'), {
                params: {
                    search:       filters.search || null,
                    status:       filters.status === 'all' ? null : filters.status,
                    type:         filters.type   === 'all' ? null : filters.type,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setCategories(response.data.data.data || []);
                setMeta(response.data.data.meta || {
                    current_page: 1, last_page: 1, from: 0, to: 0, total: 0
                });
            } else {
                showToast(response.data.message || 'Failed to retrieve categories', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading category data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchCategories(); }, [filters.status, filters.type, filters.perPage, filters.page]);

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

    const handleOpenCreate = () => { setSelectedCategory(null); setModalMode('create'); setIsModalOpen(true); };
    const handleOpenEdit   = (cat) => { setSelectedCategory(cat); setModalMode('edit');   setIsModalOpen(true); };
    const handleOpenShow   = (cat) => { setSelectedCategory(cat); setModalMode('show');   setIsModalOpen(true); };

    const triggerDelete = (cat) => { setCategoryToDelete(cat); setIsDeleteOpen(true); };
    const closeDelete   = () => { if (isDeleting) return; setIsDeleteOpen(false); setCategoryToDelete(null); };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(route('category.destroy', { category: categoryToDelete.id }));
            if (response.data.success) {
                showToast('Category deleted successfully!', 'success');
                fetchCategories();
                closeDelete();
            } else {
                showToast(response.data.message || 'Failed to delete category', 'error');
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

    // ── AOS ───────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
    }, []);

    // ── Render ────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout>
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
                        <FolderTree size={20} />
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
            <div className="table-card" data-aos="fade-up">

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
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
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
                                <th style={{ width: '70px' }}>Icon</th>
                                <th>Name</th>
                                <th style={{ width: '120px' }}>Type</th>
                                <th>Parent</th>
                                <th style={{ width: '115px' }}>Status</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={`sk-${i}`} className="skeleton-pulse">
                                        <td><div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card-border)' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '70%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: 55, height: 20, borderRadius: 20 }} /></td>
                                        <td><div className="skeleton-block" style={{ width: '55%' }} /></td>
                                        <td><div className="skeleton-block" style={{ width: 60, height: 20, borderRadius: 20 }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                {[0,1,2].map(j => <div key={j} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-card-border)' }} />)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div style={{ padding: '48px 0', textAlign: 'center' }}>
                                            <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                                No categories found matching your filters.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <div
                                                className="category-icon"
                                                style={{
                                                    background: row.color ? row.color + '26' : 'rgba(125,211,168,0.15)',
                                                    color: row.color || 'var(--accent)',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {row.icon || '—'}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{row.name}</td>
                                        <td>
                                            <span className={`badge ${row.type}`} style={{ textTransform: 'capitalize' }}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td style={{ color: row.parent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            {row.parent?.name || '—'}
                                        </td>
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
                                                    title="Edit Category"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    className="act-btn act-btn-delete"
                                                    onClick={() => triggerDelete(row)}
                                                    title="Delete Category"
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

            {/* ── Category Form / Detail Modal ── */}
            <CategoryModal
                isOpen={isModalOpen}
                mode={modalMode}
                data={selectedCategory}
                parentCategories={parentCategories}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchCategories}
                onShowToast={showToast}
            />

            {/* ── Delete Confirmation (reusable ConfirmModal) ── */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={closeDelete}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                variant="danger"
                title="Delete Category?"
                message={
                    <>
                        Are you sure you want to delete category{' '}
                        <b style={{ color: 'var(--text-primary)' }}>{categoryToDelete?.name}</b>?
                        {' '}This action cannot be undone.
                    </>
                }
                confirmLabel="Yes, Delete"
                cancelLabel="Cancel"
            />
        </AuthenticatedLayout>
    );
}
