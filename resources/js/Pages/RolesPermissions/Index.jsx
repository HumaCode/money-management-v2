import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import RoleModal from '../../Components/RoleModal';
import ConfirmModal from '../../Components/ConfirmModal';
import MatrixSkeleton from '../../Components/MatrixSkeleton';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { ShieldCheck, Plus, Edit, Trash2, CheckCircle2, Shield, Check, Lock, ChevronRight, Layers } from 'lucide-react';

export default function Index({ title, subtitle, roles: initialRoles }) {
    const [roles, setRoles]               = useState(initialRoles || []);
    const [selectedRole, setSelectedRole] = useState(initialRoles?.[0] || null);

    // Matrix permission state
    const [matrixData, setMatrixData]         = useState(null);
    const [assignedPerms, setAssignedPerms]   = useState(new Set());
    const [isMatrixLoading, setIsMatrixLoading] = useState(false);
    const [isSyncing, setIsSyncing]           = useState(false);

    // Role Modal state
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [roleModalMode, setRoleModalMode]     = useState('create');
    const [roleToEdit, setRoleToEdit]           = useState(null);

    // Delete Role Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete]           = useState(null);
    const [isDeleting, setIsDeleting]               = useState(false);

    // Toast
    const { toast, showToast, dismissToast } = useToast(3500);

    // ── Fetch Permission Matrix for Selected Role ─────────────────
    const fetchMatrix = async (roleId) => {
        if (!roleId) return;
        setIsMatrixLoading(true);
        try {
            const response = await axios.get(route('roles-permissions.matrix', roleId));
            if (response.data.success) {
                setMatrixData(response.data.data.matrix || {});
                
                // Collect assigned permission IDs into Set
                const assigned = new Set();
                Object.values(response.data.data.matrix || {}).forEach(menus => {
                    menus.forEach(m => {
                        m.permissions.forEach(p => {
                            if (p.is_assigned) assigned.add(p.id);
                        });
                    });
                });
                setAssignedPerms(assigned);
            } else {
                showToast(response.data.message || 'Failed to load permission matrix', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error loading permission matrix', 'error');
        } finally {
            setIsMatrixLoading(false);
        }
    };

    useEffect(() => {
        if (selectedRole) {
            fetchMatrix(selectedRole.id);
        }
    }, [selectedRole?.id]);

    // ── Toggle Single Permission Checkbox ──────────────────────────
    const handleTogglePermission = (permId) => {
        setAssignedPerms(prev => {
            const next = new Set(prev);
            if (next.has(permId)) {
                next.delete(permId);
            } else {
                next.add(permId);
            }
            return next;
        });
    };

    // ── Toggle All Permissions for a specific Menu ────────────────
    const handleToggleMenuAll = (menuPermissions) => {
        const permIds = menuPermissions.map(p => p.id);
        const allChecked = permIds.every(id => assignedPerms.has(id));

        setAssignedPerms(prev => {
            const next = new Set(prev);
            permIds.forEach(id => {
                if (allChecked) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
            });
            return next;
        });
    };

    // ── Save Permissions Matrix ───────────────────────────────────
    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setIsSyncing(true);
        try {
            const response = await axios.post(route('roles-permissions.sync', selectedRole.id), {
                permission_ids: Array.from(assignedPerms)
            });
            if (response.data.success) {
                showToast(`Permission matrix for role "${selectedRole.name}" updated successfully!`, 'success');
                // Refresh local role count
                setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions_count: assignedPerms.size } : r));
            } else {
                showToast(response.data.message || 'Failed to update permissions', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error updating permissions', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    // ── Role Management Handlers ──────────────────────────────────
    const handleOpenCreateRole = () => {
        setRoleModalMode('create');
        setRoleToEdit(null);
        setIsRoleModalOpen(true);
    };

    const handleOpenEditRole = (roleItem, e) => {
        e.stopPropagation();
        setRoleModalMode('edit');
        setRoleToEdit(roleItem);
        setIsRoleModalOpen(true);
    };

    const handleSaveRole = async (formData, roleId) => {
        if (roleModalMode === 'create') {
            const response = await axios.post(route('roles-permissions.storeRole'), formData);
            if (response.data.success) {
                showToast('New role created successfully!', 'success');
                const newRole = response.data.data;
                setRoles(prev => [...prev, newRole]);
                setSelectedRole(newRole);
            }
        } else {
            const response = await axios.put(route('roles-permissions.updateRole', roleId), formData);
            if (response.data.success) {
                showToast('Role info updated successfully!', 'success');
                const updatedRole = response.data.data;
                setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updatedRole } : r));
                if (selectedRole?.id === roleId) {
                    setSelectedRole(prev => ({ ...prev, ...updatedRole }));
                }
            }
        }
    };

    const handleOpenDeleteRole = (roleItem, e) => {
        e.stopPropagation();
        setRoleToDelete(roleItem);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDeleteRole = async () => {
        if (!roleToDelete) return;
        setIsDeleting(true);
        try {
            const response = await axios.delete(route('roles-permissions.destroyRole', roleToDelete.id));
            if (response.data.success) {
                showToast(`Role "${roleToDelete.name}" deleted successfully`, 'success');
                const filtered = roles.filter(r => r.id !== roleToDelete.id);
                setRoles(filtered);
                if (selectedRole?.id === roleToDelete.id) {
                    setSelectedRole(filtered[0] || null);
                }
                setIsDeleteModalOpen(false);
                setRoleToDelete(null);
            } else {
                showToast(response.data.message || 'Failed to delete role', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error deleting role', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />

            {/* Page Header */}
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
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f0f2f5', margin: 0 }}>{title}</h1>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{subtitle}</p>
                    </div>
                </div>

                <button
                    onClick={handleOpenCreateRole}
                    style={{
                        background: '#7dd3a8', color: '#0a0e1a', fontWeight: 600,
                        padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    <Plus size={18} />
                    <span>Create Role</span>
                </button>
            </div>

            {/* Split 2-Column Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* Left Column: Role Selector Sidebar */}
                <div style={{
                    background: '#111827', border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px', padding: '1.25rem'
                }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                        ROLES ({roles.length})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {roles.map((r) => {
                            const isSelected = selectedRole?.id === r.id;
                            return (
                                <div
                                    key={r.id}
                                    onClick={() => setSelectedRole(r)}
                                    style={{
                                        padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
                                        background: isSelected ? 'rgba(125, 211, 168, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                        border: isSelected ? '1px solid rgba(125, 211, 168, 0.3)' : '1px solid rgba(255, 255, 255, 0.04)',
                                        transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '12px', height: '12px', borderRadius: '50%',
                                            background: r.color || '#3b82f6', flexShrink: 0
                                        }} />
                                        <div>
                                            <div style={{ fontWeight: 600, color: isSelected ? '#7dd3a8' : '#f0f2f5', fontSize: '0.9rem' }}>
                                                {r.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                                                {r.permissions_count ?? 0} permissions • {r.users_count ?? 0} users
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons for custom role */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <button
                                            onClick={(e) => handleOpenEditRole(r, e)}
                                            style={{ background: 'transparent', border: 'none', color: '#6b7280', padding: '4px', cursor: 'pointer' }}
                                            title="Edit Role Info"
                                        >
                                            <Edit size={14} />
                                        </button>

                                        {r.type_role !== 'system' && (
                                            <button
                                                onClick={(e) => handleOpenDeleteRole(r, e)}
                                                style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '4px', cursor: 'pointer' }}
                                                title="Delete Role"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Permission Matrix Table */}
                <div style={{
                    background: '#111827', border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px', padding: '1.25rem', minHeight: '500px'
                }}>
                    {/* Matrix Top Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '1.25rem',
                        flexWrap: 'wrap', gap: '0.75rem'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                    background: `${selectedRole?.color || '#3b82f6'}20`, color: selectedRole?.color || '#3b82f6',
                                    border: `1px solid ${selectedRole?.color || '#3b82f6'}40`
                                }}>
                                    {selectedRole?.name} ({selectedRole?.slug})
                                </span>
                                {selectedRole?.type_role === 'system' && (
                                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                        <Lock size={12} /> System Role
                                    </span>
                                )}
                            </div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f2f5', margin: '6px 0 0 0' }}>
                                Access Control Matrix
                            </h2>
                        </div>

                        <button
                            onClick={handleSavePermissions}
                            disabled={isSyncing || isMatrixLoading}
                            style={{
                                background: '#7dd3a8', color: '#0a0e1a', fontWeight: 600,
                                padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                fontSize: '0.85rem', opacity: isSyncing ? 0.7 : 1
                            }}
                        >
                            <Check size={16} />
                            <span>{isSyncing ? 'Saving...' : 'Save Matrix Permissions'}</span>
                        </button>
                    </div>

                    {/* Matrix Content */}
                    {isMatrixLoading ? (
                        <MatrixSkeleton categoriesCount={3} itemsPerCategory={3} />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {Object.entries(matrixData || {}).map(([category, menus]) => (
                                <div key={category} style={{
                                    background: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.04)',
                                    borderRadius: '14px', overflow: 'hidden'
                                }}>
                                    {/* Category Header */}
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem',
                                        fontSize: '0.75rem', fontWeight: 700, color: '#7dd3a8',
                                        letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                    }}>
                                        <Layers size={14} />
                                        <span>CATEGORY: {category}</span>
                                    </div>

                                    {/* Menus List inside Category */}
                                    <div style={{ padding: '0.5rem 1rem' }}>
                                        {menus.map((menu) => {
                                            const isDashboard = menu.url === 'dashboard';
                                            const menuPermIds = menu.permissions.map(p => p.id);
                                            const allMenuChecked = isDashboard || (menuPermIds.length > 0 && menuPermIds.every(id => assignedPerms.has(id)));

                                            return (
                                                <div key={menu.id} style={{
                                                    padding: '0.85rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    flexWrap: 'wrap', gap: '1rem', opacity: isDashboard ? 0.85 : 1
                                                }}>
                                                    {/* Menu Label & Select All Toggle */}
                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                         <button
                                                             type="button"
                                                             disabled={isDashboard}
                                                             onClick={() => !isDashboard && handleToggleMenuAll(menu.permissions)}
                                                             style={{
                                                                 width: '22px', height: '22px', borderRadius: '6px',
                                                                 background: allMenuChecked ? '#7dd3a8' : 'rgba(255, 255, 255, 0.05)',
                                                                 border: allMenuChecked ? '1px solid #7dd3a8' : '1px solid rgba(255, 255, 255, 0.15)',
                                                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                 color: '#0a0e1a', cursor: isDashboard ? 'not-allowed' : 'pointer',
                                                                 transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                                 padding: 0, flexShrink: 0
                                                             }}
                                                             title={isDashboard ? 'Global Access Granted' : 'Select All Permissions for this Menu'}
                                                         >
                                                             {allMenuChecked && <Check size={14} strokeWidth={3} />}
                                                         </button>
                                                         <div>
                                                             <div style={{ fontWeight: 600, color: '#f0f2f5', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                 {menu.name}
                                                                 {isDashboard && (
                                                                     <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(125,211,168,0.2)', color: '#7dd3a8', fontWeight: 500 }}>
                                                                         Global
                                                                     </span>
                                                                 )}
                                                             </div>
                                                             <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                                 {menu.url}
                                                             </div>
                                                         </div>
                                                     </div>

                                                     {/* Individual Action Checkboxes (menu, create, read, show, update, delete) */}
                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                                         {menu.permissions.map((perm) => {
                                                             const isChecked = isDashboard || assignedPerms.has(perm.id);
                                                             const actionLabel = perm.name.split('.').pop(); // e.g. "create" from "category.create"

                                                             return (
                                                                 <button
                                                                     key={perm.id}
                                                                     type="button"
                                                                     disabled={isDashboard}
                                                                     onClick={() => !isDashboard && handleTogglePermission(perm.id)}
                                                                     style={{
                                                                         display: 'flex', alignItems: 'center', gap: '0.45rem',
                                                                         background: isChecked ? 'rgba(125, 211, 168, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                                                         border: isChecked ? '1px solid rgba(125, 211, 168, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                                                                         padding: '0.35rem 0.75rem', borderRadius: '8px',
                                                                         cursor: isDashboard ? 'not-allowed' : 'pointer',
                                                                         fontSize: '0.78rem', color: isChecked ? '#7dd3a8' : '#9ca3af',
                                                                         boxShadow: isChecked ? '0 2px 10px rgba(125, 211, 168, 0.12)' : 'none',
                                                                         transition: 'all 0.18s ease',
                                                                         userSelect: 'none',
                                                                         opacity: isDashboard ? 0.75 : 1
                                                                     }}
                                                                     title={isDashboard ? 'Dashboard access is global for all roles' : ''}
                                                                 >
                                                                     <div style={{
                                                                         width: '14px', height: '14px', borderRadius: '4px',
                                                                         background: isChecked ? '#7dd3a8' : 'transparent',
                                                                         border: isChecked ? 'none' : '1.5px solid #6b7280',
                                                                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                         color: '#0a0e1a', flexShrink: 0
                                                                     }}>
                                                                         {isChecked && <Check size={10} strokeWidth={3} />}
                                                                     </div>
                                                                     <span style={{ textTransform: 'capitalize', fontWeight: isChecked ? 600 : 400 }}>
                                                                         {actionLabel}
                                                                     </span>
                                                                 </button>
                                                             );
                                                         })}
                                                     </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Role Modal */}
            <RoleModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSave={handleSaveRole}
                mode={roleModalMode}
                roleData={roleToEdit}
            />

            {/* Delete Role Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDeleteRole}
                title="Delete Custom Role"
                message={`Are you sure you want to delete role "${roleToDelete?.name}"? Users assigned to this role will lose their custom permissions.`}
                confirmText={isDeleting ? 'Deleting...' : 'Delete Role'}
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
