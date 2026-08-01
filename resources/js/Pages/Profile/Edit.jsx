import React, { useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import ConfirmModal from '../../Components/ConfirmModal';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import { useForm, Head } from '@inertiajs/react';
import axios from 'axios';
import { 
    User, Mail, Lock, ShieldCheck, Trash2, 
    KeyRound, CheckCircle2, AlertTriangle, Calendar,
    CreditCard, ArrowLeftRight, PieChart, Bookmark
} from 'lucide-react';

export default function Edit({ title, subtitle, user, status }) {
    const userData = user?.data || user || {};
    const { toast, showToast, dismissToast } = useToast(3500);

    // Profile Info Form State
    const [profileData, setProfileData] = useState({
        name: userData.name || '',
        email: userData.email || '',
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Danger Zone / Delete Account Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Handle Profile Update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileErrors({});
        setIsSavingProfile(true);

        try {
            const response = await axios.put(route('profile.update'), profileData);
            if (response.data.success) {
                showToast('Profil berhasil diperbarui', 'success');
            } else {
                showToast(response.data.message || 'Gagal memperbarui profil', 'error');
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setProfileErrors(error.response.data.errors || {});
                showToast('Periksa kembali inputan form', 'error');
            } else {
                showToast('Terjadi kesalahan saat memperbarui profil', 'error');
            }
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Handle Password Update
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordErrors({});
        setIsSavingPassword(true);

        try {
            const response = await axios.put(route('profile.password.update'), passwordData);
            if (response.data.success) {
                showToast('Password berhasil diperbarui', 'success');
                setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            } else {
                showToast(response.data.message || 'Gagal memperbarui password', 'error');
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setPasswordErrors(error.response.data.errors || {});
                showToast('Periksa kembali input password', 'error');
            } else {
                showToast('Terjadi kesalahan saat memperbarui password', 'error');
            }
        } finally {
            setIsSavingPassword(false);
        }
    };

    // Handle Delete Account
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError('Konfirmasi password wajib diisi.');
            return;
        }

        setIsDeletingAccount(true);
        setDeleteError('');

        try {
            await axios.delete(route('profile.destroy'), {
                data: { password: deletePassword }
            });
            window.location.href = '/';
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setDeleteError(error.response.data.errors.password ? error.response.data.errors.password[0] : 'Password tidak valid.');
            } else {
                setDeleteError('Gagal menghapus akun.');
            }
            setIsDeletingAccount(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={title || "User Profile"} />
            <style>{`
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .profile-card {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: var(--radius);
                    padding: 28px;
                }
                .profile-hero {
                    text-align: center;
                    padding: 32px 20px;
                    background: linear-gradient(180deg, rgba(125,211,168,0.06) 0%, transparent 100%);
                    border-radius: var(--radius);
                    border: 1px solid var(--bg-card-border);
                    margin-bottom: 24px;
                }
                .avatar-lg {
                    width: 88px;
                    height: 88px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--accent) 0%, #059669 100%);
                    color: var(--bg-deep);
                    font-size: 32px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    box-shadow: 0 8px 24px rgba(125,211,168,0.25);
                }
                .stats-badge-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-top: 20px;
                }
                .stat-badge-item {
                    background: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 12px;
                    padding: 14px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .stat-badge-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(125,211,168,0.1);
                    color: var(--accent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .form-section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    padding-bottom: 14px;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .form-section-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                }
                .form-section-desc {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 2px 0 0;
                }
                .danger-zone-card {
                    background: rgba(248,113,113,0.03);
                    border: 1px solid rgba(248,113,113,0.2);
                    border-radius: var(--radius);
                    padding: 24px 28px;
                    margin-top: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                @media (max-width: 1024px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />

            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: '24px' }}>
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
                        <User size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'User Profile'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Manage your account details and security settings'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                {/* Left Column: User Card & Stats */}
                <div>
                    <div className="profile-card" style={{ marginBottom: '24px' }}>
                        <div className="profile-hero">
                            <div className="avatar-lg">
                                {userData.initials || 'U'}
                            </div>
                            <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>
                                {userData.name || 'User'}
                            </h3>
                            <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                                {userData.email}
                            </p>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(125,211,168,0.12)',
                                border: '1px solid rgba(125,211,168,0.3)',
                                color: 'var(--accent)',
                                fontSize: '12px',
                                fontWeight: 600
                            }}>
                                <ShieldCheck size={14} /> Active Account
                            </span>
                        </div>

                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '12px' }}>
                            Ringkasan Aktivitas
                        </div>

                        <div className="stats-badge-list">
                            <div className="stat-badge-item">
                                <div className="stat-badge-icon">
                                    <ArrowLeftRight size={18} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{userData.transactions_count || 0}</div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Transaksi</div>
                                </div>
                            </div>

                            <div className="stat-badge-item">
                                <div className="stat-badge-icon">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{userData.accounts_count || 0}</div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Akun</div>
                                </div>
                            </div>

                            <div className="stat-badge-item">
                                <div className="stat-badge-icon">
                                    <PieChart size={18} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{userData.budgets_count || 0}</div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Anggaran</div>
                                </div>
                            </div>

                            <div className="stat-badge-item">
                                <div className="stat-badge-icon">
                                    <Bookmark size={18} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{userData.saving_goals_count || 0}</div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Target</div>
                                </div>
                            </div>
                        </div>

                        {userData.created_at && (
                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--bg-card-border)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                                <Calendar size={15} />
                                <span>Bergabung sejak: {userData.created_at}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div>
                    {/* Profile Information Form */}
                    <div className="profile-card" style={{ marginBottom: '24px' }}>
                        <div className="form-section-header">
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'rgba(125,211,168,0.1)', color: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="form-section-title">Informasi Profil</h3>
                                <p className="form-section-desc">Perbarui nama dan alamat email akun Anda.</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit}>
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label className="form-label">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className={`form-control ${profileErrors.name ? 'is-invalid' : ''}`}
                                    value={profileData.name}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                {profileErrors.name && (
                                    <div className="error-message">{profileErrors.name[0]}</div>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Alamat Email</label>
                                <input
                                    type="email"
                                    className={`form-control ${profileErrors.email ? 'is-invalid' : ''}`}
                                    value={profileData.email}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="nama@email.com"
                                    required
                                />
                                {profileErrors.email && (
                                    <div className="error-message">{profileErrors.email[0]}</div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSavingProfile}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <CheckCircle2 size={16} />
                                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Update Password Form */}
                    <div className="profile-card">
                        <div className="form-section-header">
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'rgba(139,92,246,0.1)', color: '#8b5cf6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <KeyRound size={20} />
                            </div>
                            <div>
                                <h3 className="form-section-title">Perbarui Password</h3>
                                <p className="form-section-desc">Pastikan akun Anda menggunakan kata sandi yang kuat dan aman.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label className="form-label">Password Saat Ini</label>
                                <input
                                    type="password"
                                    className={`form-control ${passwordErrors.current_password ? 'is-invalid' : ''}`}
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                />
                                {passwordErrors.current_password && (
                                    <div className="error-message">{passwordErrors.current_password[0]}</div>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label className="form-label">Password Baru</label>
                                <input
                                    type="password"
                                    className={`form-control ${passwordErrors.password ? 'is-invalid' : ''}`}
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Minimal 8 karakter"
                                    required
                                />
                                {passwordErrors.password && (
                                    <div className="error-message">{passwordErrors.password[0]}</div>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    className={`form-control ${passwordErrors.password_confirmation ? 'is-invalid' : ''}`}
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                    placeholder="Ulangi password baru"
                                    required
                                />
                                {passwordErrors.password_confirmation && (
                                    <div className="error-message">{passwordErrors.password_confirmation[0]}</div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSavingPassword}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Lock size={16} />
                                    {isSavingPassword ? 'Memperbarui...' : 'Ubah Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Danger Zone: Delete Account */}
                    <div className="danger-zone-card">
                        <div>
                            <h4 style={{ margin: '0 0 4px', color: '#f87171', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={18} /> Hapus Akun
                            </h4>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Setelah akun Anda dihapus, semua sumber daya dan data keuangan akan dihapus secara permanen.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => {
                                setDeletePassword('');
                                setDeleteError('');
                                setIsDeleteModalOpen(true);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                        >
                            <Trash2 size={16} />
                            Hapus Akun
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Account Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Konfirmasi Penghapusan Akun"
                message="Apakah Anda yakin ingin menghapus akun Anda secara permanen? Masukkan password Anda untuk konfirmasi."
                confirmText="Hapus Akun Saya"
                confirmVariant="danger"
                isLoading={isDeletingAccount}
            >
                <div style={{ marginTop: '16px' }}>
                    <label className="form-label">Password Konfirmasi</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Masukkan password Anda"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                    {deleteError && (
                        <div className="error-message" style={{ marginTop: '6px' }}>{deleteError}</div>
                    )}
                </div>
            </ConfirmModal>
        </AuthenticatedLayout>
    );
}
