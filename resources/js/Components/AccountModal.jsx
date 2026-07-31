import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import axios from 'axios';
import { Wallet, ShieldCheck, DollarSign, Building } from 'lucide-react';

const POPULAR_EMOJIS = [
    // Finance & Cards
    '💳', '🏦', '💰', '💵', '🪙', '💸', '📈', '💎', '🧾', '🔐',
    // Wallets & Payments
    '👛', '👝', '📱', '📲', '🏧', '⚖️', '🛒', '🛍️', '💼', '🏷️',
    // Savings & Goals
    '🐷', '🎯', '🏠', '🚗', '✈️', '🎓', '🎁', '⭐', '🔥', '✨'
];

export default function AccountModal({
    isOpen,
    mode = 'create', // 'create' | 'edit' | 'show'
    data = null,
    accountTypes = {},
    currencies = [],
    onClose,
    onSave,
    onShowToast,
}) {
    const isShow = mode === 'show';
    const isEdit = mode === 'edit';

    const [formData, setFormData] = useState({
        name: '',
        account_type_id: '',
        institution_name: '',
        account_number: '',
        currency_id: '',
        initial_balance: '',
        color: '#7dd3a8',
        icon: '💳',
        is_active: 1,
        description: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    // Close emoji picker on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format number to thousand separator string e.g. 10000000 -> "10.000.000"
    const formatThousand = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const cleanNumber = val.toString().replace(/\D/g, '');
        if (!cleanNumber) return '';
        return new Intl.NumberFormat('id-ID').format(cleanNumber);
    };

    // Parse formatted thousand string back to raw number string e.g. "10.000.000" -> "10000000"
    const parseThousand = (val) => {
        if (!val) return '';
        return val.toString().replace(/\./g, '');
    };

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (data && (isEdit || isShow)) {
                setFormData({
                    name: data.name || '',
                    account_type_id: data.account_type_id || (data.account_type?.id ?? ''),
                    institution_name: data.institution_name || '',
                    account_number: data.account_number || '',
                    currency_id: data.currency_id || (data.currency?.id ?? ''),
                    initial_balance: formatThousand(data.initial_balance ?? (data.balance ?? 0)),
                    color: data.color || '#7dd3a8',
                    icon: data.icon || '💳',
                    is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
                    description: data.description || '',
                });
            } else {
                // Reset form to defaults
                const firstTypeKey = Object.keys(accountTypes)[0] || '';
                const firstCurrencyId = Array.isArray(currencies) && currencies.length > 0 ? currencies[0].id : '';
                setFormData({
                    name: '',
                    account_type_id: firstTypeKey,
                    institution_name: '',
                    account_number: '',
                    currency_id: firstCurrencyId,
                    initial_balance: '0',
                    color: '#7dd3a8',
                    icon: '💳',
                    is_active: 1,
                    description: '',
                });
            }
        }
    }, [isOpen, data, mode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'initial_balance') {
            const formatted = formatThousand(value);
            setFormData(prev => ({
                ...prev,
                initial_balance: formatted
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isShow) return;

        setIsSubmitting(true);
        setErrors({});

        // Prepare payload with unformatted numeric balance
        const payload = {
            ...formData,
            initial_balance: parseThousand(formData.initial_balance) || '0',
            balance: parseThousand(formData.initial_balance) || '0',
        };

        try {
            let res;
            if (isEdit && data?.id) {
                res = await axios.put(route('account.update', { account: data.id }), payload);
            } else {
                res = await axios.post(route('account.store'), payload);
            }

            if (res.data.success) {
                onShowToast(
                    isEdit ? 'Account updated successfully!' : 'Account created successfully!',
                    'success'
                );
                onSave();
                onClose();
            } else {
                onShowToast(res.data.message || 'Failed to save account', 'error');
            }
        } catch (error) {
            if (error.response?.status === 422 && error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                onShowToast('Please check the form for validation errors.', 'warning');
            } else {
                onShowToast(error.response?.data?.message || 'Server error occurred.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalTitle = isShow ? 'Account Details' : isEdit ? 'Edit Account' : 'Add New Account';
    const modalSubtitle = isShow ? 'Viewing full account information' : isEdit ? 'Update account parameters' : 'Create a new financial account';

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            subtitle={modalSubtitle}
            icon={Wallet}
            size="xl"
        >
            {isShow ? (
                /* ── Premium Detail View Layout ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Hero Account Card Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Glow Background Accent */}
                        <div style={{
                            position: 'absolute',
                            right: '-20px',
                            top: '-20px',
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            background: data?.color ? data.color + '25' : 'var(--accent-dim)',
                            filter: 'blur(30px)',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: data?.color ? data.color + '26' : 'rgba(125,211,168,0.15)',
                                color: data?.color || 'var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                flexShrink: 0
                            }}>
                                {data?.icon || '💳'}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {data?.name || 'Account'}
                                    </h3>
                                    <span className={`badge ${data?.is_active ? 'success' : 'danger'}`}>
                                        {data?.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    {data?.institution_name || 'Personal Account'} {data?.masked_account_number ? `• ${data.masked_account_number}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Balance Badge */}
                        <div style={{ textTransform: 'right', zIndex: 1 }}>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Current Balance
                            </span>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
                                {data?.balance_formatted || (data?.balance ? `Rp ${formatThousand(data.balance)}` : 'Rp 0')}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '14px'
                    }}>
                        {/* Type */}
                        <div style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            borderRadius: '12px',
                            padding: '14px 16px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                Account Type
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {data?.account_type?.name || data?.account_type_id || '-'}
                            </span>
                        </div>

                        {/* Currency */}
                        <div style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            borderRadius: '12px',
                            padding: '14px 16px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                Currency
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {data?.currency?.code ? `${data.currency.code} (${data.currency.name})` : '-'}
                            </span>
                        </div>

                        {/* Institution */}
                        <div style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            borderRadius: '12px',
                            padding: '14px 16px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                                Institution Name
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {data?.institution_name || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Timeline Info */}
                    <div style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12.5px',
                        color: 'var(--text-secondary)'
                    }}>
                        <div>
                            <span>Created At: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{data?.created_at || '-'}</strong>
                        </div>
                        <div>
                            <span>Last Updated: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{data?.updated_at || '-'}</strong>
                        </div>
                    </div>

                    {/* Footer Close Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--bg-card-border)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-primary"
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            ) : (
                /* ── Create / Edit Form Layout ── */
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Account Name */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Account Name <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. BCA Tabungan Utama"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    border: errors.name ? '1px solid var(--error)' : '1px solid var(--bg-card-border)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            {errors.name && <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name[0]}</span>}
                        </div>

                        {/* Account Type */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Account Type <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <select
                                name="account_type_id"
                                value={formData.account_type_id}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    border: errors.account_type_id ? '1px solid var(--error)' : '1px solid var(--bg-card-border)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            >
                                <option value="">Select Type</option>
                                {Object.entries(accountTypes).map(([id, label]) => (
                                    <option key={id} value={id}>{label}</option>
                                ))}
                            </select>
                            {errors.account_type_id && <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.account_type_id[0]}</span>}
                        </div>

                        {/* Institution Name */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Institution Name
                            </label>
                            <input
                                type="text"
                                name="institution_name"
                                value={formData.institution_name}
                                onChange={handleChange}
                                placeholder="e.g. Bank Central Asia"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--bg-card-border)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Account Number */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Account Number
                            </label>
                            <input
                                type="text"
                                name="account_number"
                                value={formData.account_number}
                                onChange={handleChange}
                                placeholder="e.g. 1234567890"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--bg-card-border)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Currency <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <select
                                name="currency_id"
                                value={formData.currency_id}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    border: errors.currency_id ? '1px solid var(--error)' : '1px solid var(--bg-card-border)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            >
                                <option value="">Select Currency</option>
                                {currencies && typeof currencies === 'object' && !Array.isArray(currencies) ? (
                                    Object.entries(currencies).map(([id, name]) => (
                                        <option key={id} value={id}>{name}</option>
                                    ))
                                ) : (
                                    Array.isArray(currencies) && currencies.map(c => (
                                        <option key={c.id || c} value={c.id || c}>{c.code ? `${c.code} - ${c.name}` : (c.name || c)}</option>
                                    ))
                                )}
                            </select>
                            {errors.currency_id && <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.currency_id[0]}</span>}
                        </div>

                        {/* Balance / Initial Balance */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                {isEdit ? 'Current Balance' : 'Initial Balance'} <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="initial_balance"
                                value={formData.initial_balance}
                                onChange={handleChange}
                                placeholder="0"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    border: errors.initial_balance ? '1px solid var(--error)' : '1px solid var(--bg-card-border)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                            {errors.initial_balance && <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.initial_balance[0]}</span>}
                        </div>

                        {/* Icon & Color Picker */}
                        <div style={{ position: 'relative' }} ref={emojiPickerRef}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Icon
                            </label>
                            <div
                                onClick={() => !isSubmitting && setShowEmojiPicker(!showEmojiPicker)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--bg-card-border)',
                                    cursor: 'pointer',
                                    height: '42px',
                                    userSelect: 'none'
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{formData.icon || '💳'}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    Click to select icon
                                </span>
                            </div>

                            {/* Dropdown Emoji Picker — Opens upwards */}
                            {showEmojiPicker && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: 0,
                                        width: '320px',
                                        zIndex: 999,
                                        marginBottom: '6px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--bg-card-border)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        <span>SELECT ICON</span>
                                        <button type="button" onClick={() => setShowEmojiPicker(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                                        {POPULAR_EMOJIS.map(emoji => (
                                            <div
                                                key={emoji}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, icon: emoji }));
                                                    setShowEmojiPicker(false);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '20px',
                                                    padding: '6px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    background: formData.icon === emoji ? 'var(--accent-dim)' : 'transparent',
                                                    border: formData.icon === emoji ? '1px solid var(--accent)' : '1px solid transparent',
                                                    transition: 'transform 0.1s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                {emoji}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Badge Color
                            </label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="color"
                                    name="color"
                                    value={formData.color || '#7dd3a8'}
                                    onChange={handleChange}
                                    style={{
                                        width: '42px',
                                        height: '38px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        background: 'transparent'
                                    }}
                                />
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--bg-card-border)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Active Status Custom Radio Pills */}
                        <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
                                Account Status <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div
                                    onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, is_active: 1 }))}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        background: formData.is_active === 1 ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-input)',
                                        border: formData.is_active === 1 ? '1.5px solid #34d399' : '1px solid var(--bg-card-border)',
                                        color: formData.is_active === 1 ? '#34d399' : 'var(--text-secondary)',
                                        fontWeight: formData.is_active === 1 ? 600 : 500,
                                        fontSize: '13.5px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none'
                                    }}
                                >
                                    <span style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: formData.is_active === 1 ? '#34d399' : 'var(--text-secondary)',
                                        boxShadow: formData.is_active === 1 ? '0 0 8px #34d399' : 'none'
                                    }} />
                                    Active
                                </div>

                                <div
                                    onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, is_active: 0 }))}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        background: formData.is_active === 0 ? 'rgba(248, 113, 113, 0.15)' : 'var(--bg-input)',
                                        border: formData.is_active === 0 ? '1.5px solid #f87171' : '1px solid var(--bg-card-border)',
                                        color: formData.is_active === 0 ? '#f87171' : 'var(--text-secondary)',
                                        fontWeight: formData.is_active === 0 ? 600 : 500,
                                        fontSize: '13.5px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none'
                                    }}
                                >
                                    <span style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: formData.is_active === 0 ? '#f87171' : 'var(--text-secondary)',
                                        boxShadow: formData.is_active === 0 ? '0 0 8px #f87171' : 'none'
                                    }} />
                                    Inactive
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--bg-card-border)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '8px',
                                border: '1px solid var(--bg-card-border)',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? 'Saving...' : isEdit ? 'Update Account' : 'Create Account'}
                        </button>
                    </div>
                </form>
            )}
        </BaseModal>
    );
}
