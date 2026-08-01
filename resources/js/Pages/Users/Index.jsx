import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import UserModal from '../../Components/UserModal';
import ConfirmModal from '../../Components/ConfirmModal';
import EmptyState from '../../Components/EmptyState';
import TableSkeleton from '../../Components/TableSkeleton';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, RotateCcw, Plus, Users, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function Index({ title, subtitle, roles }) {
    // ── Data state ──────────────────────────────────────────────
    const [users, setUsers]         = useState([]);
    const [meta, setMeta]           = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // ── Filter / search state ────────────────────────────────────
    const [filters, setFilters]   = useState({ search: '', status: 'all', role: 'all', perPage: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    // ── Modal state ──────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [modalMode, setModalMode]       = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);

    // ── Delete confirm state ─────────────────────────────────────
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting]     = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch Users ──────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('users.allPagination'), {
                params: {
                    search:       filters.search || null,
                    status:       filters.status === 'all' ? null : filters.status,
                    role:         filters.role   === 'all' ? null : filters.role,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setUsers(response.data.data.data || []);
                setMeta(response.data.data.meta || { current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
            } else {
                showToast(response.data.message || 'Failed to retrieve user data', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading user data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters, showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ── Search Debounce ──────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ── Handlers ──────────────────────────────────────────────────
    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({ search: '', status: 'all', role: 'all', perPage: 10, page: 1 });
    };

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (userItem) => {
        setModalMode('edit');
        setSelectedUser(userItem);
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (userItem) => {
        setModalMode('view');
        setSelectedUser(userItem);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (formData, userId) => {
        if (modalMode === 'create') {
            const response = await axios.post(route('users.store'), formData);
            if (response.data.success) {
                showToast('Pengguna baru berhasil dibuat!', 'success');
                fetchUsers();
            } else {
                showToast(response.data.message || 'Gagal menyimpan pengguna', 'error');
            }
        } else if (modalMode === 'edit') {
            const response = await axios.put(route('users.update', userId), formData);
            if (response.data.success) {
                showToast('Data pengguna berhasil diperbarui!', 'success');
                fetchUsers();
            } else {
                showToast(response.data.message || 'Gagal memperbarui pengguna', 'error');
            }
        }
    };

    const handleOpenDelete = (userItem) => {
        setUserToDelete(userItem);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(route('users.destroy', userToDelete.id));
            if (response.data.success) {
                showToast(`Pengguna "${userToDelete.name}" berhasil dihapus`, 'success');
                setIsDeleteOpen(false);
                setUserToDelete(null);
                fetchUsers();
            } else {
                showToast(response.data.message || 'Gagal menghapus pengguna', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan saat menghapus pengguna', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />

            <div className="page-header" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'rgba(125, 211, 168, 0.12)', color: '#7dd3a8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Users size={22} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f0f2f5', margin: 0 }}>{title}</h1>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{subtitle}</p>
                    </div>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    style={{
                        background: '#7dd3a8', color: '#0a0e1a', fontWeight: 600,
                        padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    <Plus size={18} />
                    <span>Add User</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div style={{
                background: '#111827', border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                    <div style={{ position: 'relative', width: '260px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="text"
                            placeholder="Search name, email, username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px',
                                padding: '0.55rem 0.85rem 0.55rem 2.2rem', color: '#f0f2f5', fontSize: '0.85rem'
                            }}
                        />
                    </div>

                    {/* Filter Status */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        style={{
                            background: '#1f2937', border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px', padding: '0.55rem 0.85rem', color: '#f0f2f5', fontSize: '0.85rem'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Filter Role */}
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                        style={{
                            background: '#1f2937', border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px', padding: '0.55rem 0.85rem', color: '#f0f2f5', fontSize: '0.85rem'
                        }}
                    >
                        <option value="all">All Roles</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.slug}>{r.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleResetFilters}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#9ca3af', borderRadius: '10px', width: '36px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                        title="Reset Filters"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>

                {/* Per Page */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Show</span>
                    <select
                        value={filters.perPage}
                        onChange={(e) => setFilters(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))}
                        style={{
                            background: '#1f2937', border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px', padding: '0.35rem 0.6rem', color: '#f0f2f5', fontSize: '0.8rem'
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div style={{
                background: '#111827', border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(255, 255, 255, 0.02)', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1rem 1.25rem' }}>USER</th>
                                <th style={{ padding: '1rem 1.25rem' }}>ROLE</th>
                                <th style={{ padding: '1rem 1.25rem' }}>EMAIL</th>
                                <th style={{ padding: '1rem 1.25rem' }}>STATUS</th>
                                <th style={{ padding: '1rem 1.25rem' }}>LAST LOGIN</th>
                                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableSkeleton rows={5} cols={6} showAvatar={true} showActions={true} />
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>
                                        <EmptyState title="No Users Found" description="Try clearing your search filters or add a new user." />
                                    </td>
                                </tr>
                            ) : (
                                users.map((userItem) => (
                                    <tr key={userItem.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#f0f2f5' }}>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: userItem.avatar ? `url(${userItem.avatar}) center/cover` : '#374151',
                                                    color: '#f3f4f6', fontWeight: 600, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
                                                }}>
                                                    {!userItem.avatar && userItem.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{userItem.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>@{userItem.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                                background: `${userItem.role_color || '#3b82f6'}20`,
                                                color: userItem.role_color || '#3b82f6',
                                                border: `1px solid ${userItem.role_color || '#3b82f6'}40`
                                            }}>
                                                {userItem.role_name}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem', color: '#9ca3af' }}>{userItem.email}</td>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            {userItem.is_active ? (
                                                <span style={{ color: '#7dd3a8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <CheckCircle size={14} /> Active
                                                </span>
                                            ) : (
                                                <span style={{ color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <XCircle size={14} /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem', color: '#6b7280', fontSize: '0.8rem' }}>{userItem.last_login_at}</td>
                                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                                <button
                                                    onClick={() => handleOpenViewModal(userItem)}
                                                    style={{ background: 'transparent', border: 'none', color: '#60a5fa', padding: '6px', cursor: 'pointer' }}
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEditModal(userItem)}
                                                    style={{ background: 'transparent', border: 'none', color: '#7dd3a8', padding: '6px', cursor: 'pointer' }}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDelete(userItem)}
                                                    style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '6px', cursor: 'pointer' }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.total > 0 && (
                    <div style={{
                        padding: '1rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        color: '#6b7280', fontSize: '0.8rem'
                    }}>
                        <div>Showing {meta.from || 0} to {meta.to || 0} of {meta.total} users</div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                                    style={{
                                        background: p === meta.current_page ? '#7dd3a8' : 'rgba(255, 255, 255, 0.04)',
                                        color: p === meta.current_page ? '#0a0e1a' : '#f0f2f5',
                                        border: 'none', borderRadius: '6px', width: '28px', height: '28px',
                                        fontWeight: p === meta.current_page ? 600 : 400, cursor: 'pointer'
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* User Modal */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                mode={modalMode}
                userData={selectedUser}
                roles={roles}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete User Account"
                message={`Are you sure you want to delete user "${userToDelete?.name}"? This action cannot be undone.`}
                confirmText={isDeleting ? 'Deleting...' : 'Delete User'}
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
