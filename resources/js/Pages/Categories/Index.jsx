import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import CategoryModal from '../../Components/CategoryModal';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, RotateCcw, Plus, Trash, AlertTriangle } from 'lucide-react';

export default function Index({ title, subtitle, parentCategories }) {
    // Data list state
    const [categories, setCategories] = useState([]);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        type: 'all',
        perPage: 10,
        page: 1
    });

    // Debounced search term state
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'show'
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Delete confirmation state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [animateDeleteShow, setAnimateDeleteShow] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    // Show custom toast helper
    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
    }, []);

    // Dismiss toast after 3 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Fetch category data from the API endpoint
    const fetchCategories = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await axios.get(route('category.allPagination'), {
                params: {
                    search: filters.search || null,
                    status: filters.status === 'all' ? null : filters.status,
                    type: filters.type === 'all' ? null : filters.type,
                    row_per_page: filters.perPage,
                    page: filters.page
                }
            });

            if (response.data.success) {
                setCategories(response.data.data.data || []);
                setMeta(response.data.data.meta || {
                    current_page: 1,
                    last_page: 1,
                    from: 0,
                    to: 0,
                    total: 0
                });
            } else {
                showToast(response.data.message || 'Failed to retrieve categories', 'error');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('Error loading category data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters, isLoading, showToast]);

    // Fetch data on filter change
    useEffect(() => {
        fetchCategories();
    }, [filters.status, filters.type, filters.perPage, filters.page]);

    // Trigger fetch on debounced search changes
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
        }, 400);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Handle standard reload
    const handleReload = () => {
        setSearchTerm('');
        setFilters({
            search: '',
            status: 'all',
            type: 'all',
            perPage: 10,
            page: 1
        });
        showToast('Table data refreshed', 'success');
    };

    // Pagination helper buttons
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.last_page) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    // Open Category Modal helpers
    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (category) => {
        setSelectedCategory(category);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenShow = (category) => {
        setSelectedCategory(category);
        setModalMode('show');
        setIsModalOpen(true);
    };

    // Delete flow triggers
    const triggerDelete = (category) => {
        setCategoryToDelete(category);
        setIsDeleteOpen(true);
        // Trigger backdrop animation
        setTimeout(() => setAnimateDeleteShow(true), 10);
    };

    const closeDelete = () => {
        if (isDeleting) return;
        setAnimateDeleteShow(false);
        setTimeout(() => {
            setIsDeleteOpen(false);
            setCategoryToDelete(null);
        }, 300);
    };

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

    // Pagination pages array construction
    const renderPageNumbers = () => {
        const pages = [];
        const current = meta.current_page;
        const last = meta.last_page;

        if (last <= 5) {
            for (let i = 1; i <= last; i++) pages.push(i);
        } else {
            if (current <= 3) {
                pages.push(1, 2, 3, '...', last);
            } else if (current >= last - 2) {
                pages.push(1, '...', last - 2, last - 1, last);
            } else {
                pages.push(1, '...', current, '...', last);
            }
        }

        return pages.map((p, idx) => {
            if (p === '...') {
                return <button key={`dots-${idx}`} disabled>...</button>;
            }
            return (
                <button
                    key={`page-${p}`}
                    onClick={() => handlePageChange(p)}
                    className={p === current ? 'active' : ''}
                >
                    {p}
                </button>
            );
        });
    };

    // AOS initialization
    useEffect(() => {
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 800, once: true });
        }
    }, []);

    return (
        <AuthenticatedLayout>
            <style>{`
                /* Custom styling overrides and local transitions */
                .custom-toast {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    padding: 14px 20px;
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-toast.success {
                    border-left: 4px solid var(--success);
                }
                .custom-toast.error {
                    border-left: 4px solid var(--error);
                }
                .toast-icon {
                    font-size: 16px;
                    font-weight: bold;
                }
                .custom-toast.success .toast-icon {
                    color: var(--success);
                }
                .custom-toast.error .toast-icon {
                    color: var(--error);
                }
                .toast-message {
                    color: var(--text-primary);
                    font-size: 13.5px;
                    font-weight: 500;
                }
                @keyframes toast-slide-in {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                /* Delete Confirmation Modal styling */
                .delete-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(8, 10, 18, 0.6);
                    backdrop-filter: blur(0px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999;
                    opacity: 0;
                    transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
                }
                .delete-modal-overlay.show {
                    opacity: 1;
                    backdrop-filter: blur(8px);
                }
                .delete-modal-card {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 20px;
                    padding: 32px 24px;
                    width: 90%;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
                    transform: scale(0.9) translateY(15px);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .delete-modal-overlay.show .delete-modal-card {
                    transform: scale(1) translateY(0);
                }
                .delete-icon-wrapper {
                    width: 64px;
                    height: 64px;
                    background: rgba(248, 113, 113, 0.12);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: var(--error);
                }
                .delete-modal-card h4 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 10px;
                }
                .delete-modal-card p {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin: 0 0 24px;
                    line-height: 1.5;
                }
                .delete-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .btn-delete-cancel {
                    background: transparent;
                    border: 1px solid var(--bg-card-border);
                    color: var(--text-primary);
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.2s;
                }
                .btn-delete-cancel:hover:not(:disabled) {
                    background: var(--bg-input-focus);
                }
                .btn-delete-confirm {
                    background: var(--error);
                    color: #ffffff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(248, 113, 113, 0.2);
                    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .btn-delete-confirm:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(248, 113, 113, 0.35);
                }
                .btn-delete-confirm:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                /* Skeleton rows pulse */
                .skeleton-pulse {
                    animation: skeleton-load 1.4s ease-in-out infinite;
                }
                @keyframes skeleton-load {
                    0% { opacity: 0.45; }
                    50% { opacity: 0.85; }
                    100% { opacity: 0.45; }
                }
                .skeleton-block {
                    background: var(--bg-card-border);
                    height: 14px;
                    border-radius: 4px;
                }
            `}</style>

            {/* Custom Toast Alert */}
            {toast.show && (
                <div className={`custom-toast ${toast.type}`}>
                    <span className="toast-icon">
                        {toast.type === 'success' ? '✓' : '✗'}
                    </span>
                    <span className="toast-message">{toast.message}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div className="page-title">
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>

                <button 
                    onClick={handleOpenCreate} 
                    className="btn-primary action" 
                    style={{ textDecoration: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <Plus size={18} style={{ marginRight: '6px' }} />
                    Add Data
                </button>
            </div>

            {/* Table Card container */}
            <div className="table-card" data-aos="fade-up">
                
                {/* Table Controls (Search, Filters, Reload, Entries size) */}
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
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="custom-select">
                            <select 
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <button 
                            className="btn-icon" 
                            onClick={handleReload} 
                            title="Reload Table"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    <div className="table-controls-right">
                        <div className="custom-select">
                            <select 
                                value={filters.perPage}
                                onChange={(e) => setFilters(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
                            >
                                <option value={10}>Show 10</option>
                                <option value={25}>Show 25</option>
                                <option value={50}>Show 50</option>
                                <option value={100}>Show 100</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table wrapper */}
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Icon</th>
                                <th>Name</th>
                                <th style={{ width: '120px' }}>Type</th>
                                <th>Parent</th>
                                <th style={{ width: '120px' }}>Status</th>
                                <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                // Render loading skeletons
                                [...Array(5)].map((_, idx) => (
                                    <tr key={`skeleton-${idx}`} className="skeleton-pulse">
                                        <td>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: 'var(--bg-card-border)'
                                            }}></div>
                                        </td>
                                        <td><div className="skeleton-block" style={{ width: '70%' }}></div></td>
                                        <td><div className="skeleton-block" style={{ width: '50px', height: '20px', borderRadius: '20px' }}></div></td>
                                        <td><div className="skeleton-block" style={{ width: '60%' }}></div></td>
                                        <td><div className="skeleton-block" style={{ width: '60px', height: '20px', borderRadius: '20px' }}></div></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-card-border)' }}></div>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-card-border)' }}></div>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-card-border)' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                // Render empty state
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state" style={{ padding: '48px 0', textAlign: 'center' }}>
                                            <div className="empty-icon" style={{ fontSize: '32px', marginBottom: '12px' }}>
                                                ⚠️
                                            </div>
                                            <div className="empty-text" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                                No categories found matching your filters.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Render actual table rows
                                categories.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <div 
                                                className="category-icon" 
                                                style={{ 
                                                    background: row.color ? row.color + '26' : 'rgba(125,211,168,0.15)',
                                                    color: row.color || 'var(--accent)',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {row.icon || '—'}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '500' }}>{row.name}</td>
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
                                            <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => handleOpenShow(row)}
                                                    className="btn-action view action" 
                                                    title="View Details"
                                                    style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer' }}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenEdit(row)}
                                                    className="btn-action edit action" 
                                                    title="Edit Category"
                                                    style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer' }}
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button 
                                                    onClick={() => triggerDelete(row)}
                                                    className="btn-action delete" 
                                                    title="Delete Category"
                                                    style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer' }}
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

                {/* Table Footer (Pagination & Entries info) */}
                <div className="table-footer">
                    <div className="table-info">
                        Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} entries
                    </div>

                    <div className="pagination">
                        <button 
                            onClick={() => handlePageChange(meta.current_page - 1)}
                            disabled={meta.current_page === 1 || isLoading}
                        >
                            ‹
                        </button>
                        
                        {renderPageNumbers()}

                        <button 
                            onClick={() => handlePageChange(meta.current_page + 1)}
                            disabled={meta.current_page === meta.last_page || isLoading}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Form & Detail modal */}
            <CategoryModal 
                isOpen={isModalOpen}
                mode={modalMode}
                data={selectedCategory}
                parentCategories={parentCategories}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchCategories}
                onShowToast={showToast}
            />

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div 
                    className={`delete-modal-overlay ${animateDeleteShow ? 'show' : ''}`}
                    onClick={closeDelete}
                >
                    <div 
                        className="delete-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="delete-icon-wrapper">
                            <AlertTriangle size={32} />
                        </div>
                        <h4>Delete Category?</h4>
                        <p>
                            Are you sure you want to delete category <b>{categoryToDelete?.name}</b>? 
                            This action cannot be undone.
                        </p>
                        <div className="delete-actions">
                            <button 
                                className="btn-delete-cancel" 
                                onClick={closeDelete}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-delete-confirm" 
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="btn-modal-spinner" style={{ borderTopColor: '#ffffff' }}></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash size={14} />
                                        Yes, Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
