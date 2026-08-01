import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { 
    Settings, Globe, Moon, Calendar, DollarSign, 
    Bell, CheckCircle2, Sliders, Layout, Hash
} from 'lucide-react';

export default function Index({ title, subtitle, preference, currencies = [] }) {
    const prefData = preference?.data || preference || {};

    const [form, setForm] = useState({
        theme:                   prefData.theme || 'dark',
        language:                prefData.language || 'id',
        date_format:             prefData.date_format || 'DD/MM/YYYY',
        number_format:           prefData.number_format || '1.000.000,00',
        fiscal_year_start_month: prefData.fiscal_year_start_month || 1,
        default_currency_id:     prefData.default_currency_id || (currencies[0]?.id || ''),
        notification_email:      prefData.notification_email ?? true,
        notification_push:       prefData.notification_push ?? true,
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const { toast, showToast, dismissToast } = useToast(3500);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSaving(true);

        try {
            const payload = {
                ...form,
                default_currency_id: form.default_currency_id || null,
            };
            const response = await axios.put(route('preferences.update'), payload);
            if (response.data.success) {
                showToast('Pengaturan preferensi berhasil disimpan', 'success');
            } else {
                showToast(response.data.message || 'Gagal menyimpan preferensi', 'error');
            }
        } catch (error) {
            console.error('Preferences save error:', error);
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
                showToast('Periksa kembali input preferensi Anda', 'error');
            } else {
                showToast(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan preferensi', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={title || "Preferences"} />
            <style>{`
                .pref-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .pref-card {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: var(--radius);
                    padding: 28px;
                }
                .pref-card.full-width {
                    grid-column: 1 / -1;
                }
                .pref-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .pref-icon-box {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pref-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                }
                .pref-desc {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 2px 0 0;
                }
                .toggle-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 0;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .toggle-row:last-child {
                    border-bottom: none;
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 26px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                    transition: .3s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: var(--text-secondary);
                    transition: .3s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: var(--accent);
                    border-color: var(--accent);
                }
                input:checked + .slider:before {
                    transform: translateX(22px);
                    background-color: var(--bg-deep);
                }
                @media (max-width: 1024px) {
                    .pref-grid {
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
                        <Settings size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'Preferences'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Customize your app layout, locale, and notifications'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="pref-grid">
                    {/* General Preferences */}
                    <div className="pref-card">
                        <div className="pref-header">
                            <div className="pref-icon-box" style={{ background: 'rgba(125,211,168,0.1)', color: 'var(--accent)' }}>
                                <Globe size={20} />
                            </div>
                            <div>
                                <h3 className="pref-title">Tampilan & Regional</h3>
                                <p className="pref-desc">Atur bahasa, tema, dan format tampilan data.</p>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '18px' }}>
                            <label className="form-label">Bahasa Aplikasi</label>
                            <select
                                className={`form-control ${errors.language ? 'is-invalid' : ''}`}
                                value={form.language}
                                onChange={(e) => setForm(prev => ({ ...prev, language: e.target.value }))}
                            >
                                <option value="id">Bahasa Indonesia (ID)</option>
                                <option value="en">English (EN)</option>
                            </select>
                            {errors.language && <div className="error-message">{errors.language[0]}</div>}
                        </div>

                        <div className="form-group" style={{ marginBottom: '18px' }}>
                            <label className="form-label">Tema Tampilan</label>
                            <select
                                className={`form-control ${errors.theme ? 'is-invalid' : ''}`}
                                value={form.theme}
                                onChange={(e) => setForm(prev => ({ ...prev, theme: e.target.value }))}
                            >
                                <option value="dark">Dark Mode (Default)</option>
                                <option value="light">Light Mode</option>
                                <option value="system">Sesuai Sistem</option>
                            </select>
                            {errors.theme && <div className="error-message">{errors.theme[0]}</div>}
                        </div>

                        <div className="form-group" style={{ marginBottom: '18px' }}>
                            <label className="form-label">Format Tanggal</label>
                            <select
                                className={`form-control ${errors.date_format ? 'is-invalid' : ''}`}
                                value={form.date_format}
                                onChange={(e) => setForm(prev => ({ ...prev, date_format: e.target.value }))}
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 01/08/2026)</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD (Contoh: 2026-08-01)</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY (Contoh: 08/01/2026)</option>
                            </select>
                            {errors.date_format && <div className="error-message">{errors.date_format[0]}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Format Angka & Ribuan</label>
                            <select
                                className={`form-control ${errors.number_format ? 'is-invalid' : ''}`}
                                value={form.number_format}
                                onChange={(e) => setForm(prev => ({ ...prev, number_format: e.target.value }))}
                            >
                                <option value="1.000.000,00">1.000.000,00 (Titik pemisah ribuan)</option>
                                <option value="1,000,000.00">1,000,000.00 (Koma pemisah ribuan)</option>
                            </select>
                            {errors.number_format && <div className="error-message">{errors.number_format[0]}</div>}
                        </div>
                    </div>

                    {/* Financial Preferences */}
                    <div className="pref-card">
                        <div className="pref-header">
                            <div className="pref-icon-box" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <h3 className="pref-title">Keuangan & Mata Uang</h3>
                                <p className="pref-desc">Konfigurasi mata uang bawaan dan awal tahun fiskal.</p>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '18px' }}>
                            <label className="form-label">Mata Uang Utama (Default Currency)</label>
                            <select
                                className={`form-control ${errors.default_currency_id ? 'is-invalid' : ''}`}
                                value={form.default_currency_id}
                                onChange={(e) => setForm(prev => ({ ...prev, default_currency_id: e.target.value }))}
                            >
                                {currencies.length === 0 ? (
                                    <option value="">Rupiah (IDR)</option>
                                ) : (
                                    currencies.map(curr => (
                                        <option key={curr.id} value={curr.id}>
                                            {curr.code} - {curr.name} ({curr.symbol})
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.default_currency_id && <div className="error-message">{errors.default_currency_id[0]}</div>}
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Bulan Awal Tahun Fiskal</label>
                            <select
                                className={`form-control ${errors.fiscal_year_start_month ? 'is-invalid' : ''}`}
                                value={form.fiscal_year_start_month}
                                onChange={(e) => setForm(prev => ({ ...prev, fiscal_year_start_month: Number(e.target.value) }))}
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            {errors.fiscal_year_start_month && <div className="error-message">{errors.fiscal_year_start_month[0]}</div>}
                        </div>

                        {/* Notification Sub-section inside Financial/System Card */}
                        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--bg-card-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <Bell size={18} style={{ color: '#8b5cf6' }} />
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifikasi & Peringatan</span>
                            </div>

                            <div className="toggle-row">
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Notifikasi Email</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Terima laporan mingguan & peringatan anggaran via email.</div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={form.notification_email}
                                        onChange={(e) => setForm(prev => ({ ...prev, notification_email: e.target.checked }))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row">
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Notifikasi Push / In-App</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tampilkan pengingat transaksi berulang di aplikasi.</div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={form.notification_push}
                                        onChange={(e) => setForm(prev => ({ ...prev, notification_push: e.target.checked }))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Action Bar */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: 'var(--radius)',
                    padding: '20px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        💡 Perubahan preferensi akan langsung diterapkan pada seluruh antarmuka aplikasi.
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                    >
                        <CheckCircle2 size={18} />
                        {isSaving ? 'Menyimpan...' : 'Simpan Preferensi'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
