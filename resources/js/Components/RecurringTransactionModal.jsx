import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import CustomDatePicker from './CustomDatePicker';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { Repeat, ShieldCheck, DollarSign, Calendar, RefreshCw } from 'lucide-react';

const formatThousand = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const cleanNumber = String(val).replace(/\D/g, '');
    if (!cleanNumber) return '';
    return new Intl.NumberFormat('id-ID').format(cleanNumber);
};

const parseThousand = (val) => {
    if (!val) return '';
    return String(val).replace(/\./g, '');
};

const getDefaultCurrencyId = (currencyList, appLocale = 'id') => {
    if (!currencyList || currencyList.length === 0) return '';
    if (appLocale === 'id') {
        const idr = currencyList.find(c => c.code?.toUpperCase() === 'IDR' || c.name?.toLowerCase().includes('rupiah'));
        if (idr) return idr.id;
    }
    const envCurrency = currencyList.find(c => c.code?.toLowerCase() === appLocale.toLowerCase());
    if (envCurrency) return envCurrency.id;
    return currencyList[0]?.id || '';
};

const getInitialDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

export default function RecurringTransactionModal({
    isOpen,
    onClose,
    onSuccess,
    mode = 'create', // 'create' | 'edit' | 'show'
    recurring = null,
    accounts = [],
    categories = [],
    currencies = [],
    showToast = () => {}
}) {
    const pageProps = usePage().props;
    const locale = pageProps?.locale || 'id';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        type: 'expense',
        account_id: '',
        category_id: '',
        currency_id: '',
        amount: '',
        frequency: 'monthly',
        day_of_month: '1',
        day_of_week: '1',
        start_date: getInitialDate(),
        end_date: '',
        is_active: 1,
        description: '',
        notes: ''
    });

    const isEdit = mode === 'edit';
    const isShow = mode === 'show';

    useEffect(() => {
        if (!isOpen) return;

        setErrors({});
        setIsSubmitting(false);

        const defaultAccountId = accounts.length > 0 ? accounts[0].id : '';
        const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
        const defaultCurrencyId = getDefaultCurrencyId(currencies, locale);

        if (recurring && (isEdit || isShow)) {
            setFormData({
                type: recurring.type || 'expense',
                account_id: recurring.account?.id || recurring.account_id || defaultAccountId,
                category_id: recurring.category?.id || recurring.category_id || defaultCategoryId,
                currency_id: recurring.currency?.id || recurring.currency_id || defaultCurrencyId,
                amount: formatThousand(recurring.amount ?? ''),
                frequency: recurring.frequency || 'monthly',
                day_of_month: recurring.day_of_month !== null && recurring.day_of_month !== undefined ? String(recurring.day_of_month) : '1',
                day_of_week: recurring.day_of_week !== null && recurring.day_of_week !== undefined ? String(recurring.day_of_week) : '1',
                start_date: recurring.start_date || getInitialDate(),
                end_date: recurring.end_date || '',
                is_active: recurring.is_active ? 1 : 0,
                description: recurring.description || '',
                notes: recurring.notes || ''
            });
        } else {
            setFormData({
                type: 'expense',
                account_id: defaultAccountId,
                category_id: defaultCategoryId,
                currency_id: defaultCurrencyId,
                amount: '',
                frequency: 'monthly',
                day_of_month: '1',
                day_of_week: '1',
                start_date: getInitialDate(),
                end_date: '',
                is_active: 1,
                description: '',
                notes: ''
            });
        }
    }, [isOpen, mode, recurring]);

    const handleTypeChange = (newType) => {
        if (isShow) return;
        setFormData(prev => ({
            ...prev,
            type: newType,
            category_id: prev.category_id || (categories.length > 0 ? categories[0].id : '')
        }));
    };

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        if (name === 'amount') {
            const formatted = formatThousand(value);
            setFormData(prev => ({ ...prev, amount: formatted }));
        } else if (inputType === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (isShow) return;

        setIsSubmitting(true);
        setErrors({});

        const numericAmount = Number(parseThousand(formData.amount)) || 0;

        const payload = {
            ...formData,
            amount: parseThousand(formData.amount) || '0',
            day_of_month: ['monthly', 'quarterly', 'yearly'].includes(formData.frequency) ? (formData.day_of_month || null) : null,
            day_of_week: ['weekly', 'bi_weekly'].includes(formData.frequency) ? (formData.day_of_week || null) : null,
            end_date: formData.end_date || null
        };

        try {
            let res;
            if (isEdit) {
                res = await axios.put(route('recurring.update', recurring.id), payload);
            } else {
                res = await axios.post(route('recurring.store'), payload);
            }

            if (res.data && res.data.success) {
                showToast(
                    isEdit
                        ? 'Recurring transaction updated successfully!'
                        : 'Recurring transaction created successfully!',
                    'success'
                );
                onSuccess?.();
                onClose();
            } else {
                showToast(res.data?.message || 'Transaction operation failed.', 'error');
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors || {});
                showToast('Please fix the validation errors below.', 'error');
            } else {
                showToast(err.response?.data?.message || 'Server error occurred.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalTitle = isShow
        ? 'Recurring Transaction Details'
        : isEdit
        ? 'Edit Recurring Transaction'
        : 'Create New Recurring Transaction';

    const getSymbolForCurrency = (currId) => {
        const found = currencies.find(c => String(c.id) === String(currId));
        return found?.symbol || 'Rp';
    };

    const modalFooter = isShow ? (
        <button type="button" onClick={onClose} className="btn-secondary">Close</button>
    ) : (
        <>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
                Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (isEdit ? 'Update Recurring' : 'Save Recurring')}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="xl"
            footer={modalFooter}
        >
            {isShow ? (
                /* ── Show Mode Layout (Ultra Modern Aesthetic) ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {/* Hero Amount Banner */}
                    <div style={{
                        padding: '24px 28px',
                        borderRadius: '16px',
                        background: recurring?.type === 'income' 
                            ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)' 
                            : 'linear-gradient(135deg, rgba(248, 113, 113, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)',
                        border: recurring?.type === 'income'
                            ? '1px solid rgba(52, 211, 153, 0.2)'
                            : '1px solid rgba(248, 113, 113, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Type Badge */}
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    color: recurring?.type === 'income' ? '#34d399' : '#f87171',
                                    background: recurring?.type === 'income' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                                    border: `1px solid ${recurring?.type === 'income' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`
                                }}>
                                    {recurring?.type_label || recurring?.type}
                                </span>

                                {/* Frequency Badge */}
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid var(--bg-card-border)',
                                    textTransform: 'capitalize'
                                }}>
                                    🔄 {recurring?.frequency_label || recurring?.frequency}
                                </span>

                                {/* Status Badge */}
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: recurring?.is_active ? '#10b981' : '#9ca3af',
                                    background: recurring?.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.12)',
                                    border: `1px solid ${recurring?.is_active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(156, 163, 175, 0.2)'}`
                                }}>
                                    {recurring?.is_active ? '● Active' : '○ Inactive'}
                                </span>
                            </div>

                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Recurring Transaction Amount
                            </span>
                        </div>

                        {/* Big Amount */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontSize: '28px',
                                fontWeight: 800,
                                fontFamily: "'Inter', sans-serif",
                                color: recurring?.type === 'income' ? '#34d399' : '#f87171',
                                letterSpacing: '-0.5px'
                            }}>
                                {recurring?.amount_formatted}
                            </div>
                        </div>
                    </div>

                    {/* Details 2-Column Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        {/* Account Card */}
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                                Account
                            </span>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                💳 {recurring?.account?.name || '—'}
                            </div>
                        </div>

                        {/* Category Card */}
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                                Category
                            </span>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                🏷️ {recurring?.category?.name || 'Uncategorized'}
                            </div>
                        </div>

                        {/* Start Date Card */}
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                                Start Date
                            </span>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                📅 {recurring?.start_date_formatted || recurring?.start_date}
                            </div>
                        </div>

                        {/* Next Occurrence Card */}
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'rgba(125, 211, 168, 0.06)',
                            border: '1px solid rgba(125, 211, 168, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--accent)' }}>
                                Next Occurrence
                            </span>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
                                ⏰ {recurring?.next_occurrence_formatted || recurring?.next_occurrence_date || '—'}
                            </div>
                        </div>

                        {/* End Date Card */}
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                                End Date
                            </span>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                🏁 {recurring?.end_date || 'No End Date (Runs indefinitely)'}
                            </div>
                        </div>

                        {/* Currency Card */}
                        <div style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                                Currency
                            </span>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                💱 {recurring?.currency ? `${recurring.currency.code} (${recurring.currency.symbol})` : 'IDR (Rp)'}
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--bg-card-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                            Description
                        </span>
                        <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            {recurring?.description || '—'}
                        </div>
                    </div>

                    {/* Notes Card */}
                    {recurring?.notes && recurring?.notes !== '—' && (
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px dashed var(--bg-card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                                Additional Notes
                            </span>
                            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                                "{recurring.notes}"
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* ── Create / Edit Form Layout ── */
                <form onSubmit={handleSubmit}>
                    {/* Transaction Type Segmented Toggle */}
                    <div style={{ marginBottom: '20px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
                            Transaction Type <span style={{ color: 'var(--error)' }}>*</span>
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            borderRadius: '10px',
                            padding: '4px',
                            gap: '4px'
                        }}>
                            <button
                                type="button"
                                onClick={() => handleTypeChange('income')}
                                style={{
                                    padding: '9px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    background: formData.type === 'income' ? 'rgba(52, 211, 153, 0.18)' : 'transparent',
                                    color: formData.type === 'income' ? '#34d399' : 'var(--text-secondary)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                💰 Income
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange('expense')}
                                style={{
                                    padding: '9px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    background: formData.type === 'expense' ? 'rgba(248, 113, 113, 0.18)' : 'transparent',
                                    color: formData.type === 'expense' ? '#f87171' : 'var(--text-secondary)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                💸 Expense
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Account */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Account <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <select
                                name="account_id"
                                value={formData.account_id}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="">Select Account</option>
                                {accounts
                                    .filter(acc => (acc.is_active === undefined || acc.is_active === null || Boolean(acc.is_active)))
                                    .map(acc => {
                                        const balStr = acc.balance !== undefined && acc.balance !== null
                                            ? ` (Rp ${Number(acc.balance).toLocaleString('id-ID', { minimumFractionDigits: 2 })})`
                                            : '';
                                        return (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name}{balStr}
                                            </option>
                                        );
                                    })
                                }
                            </select>
                            {errors.account_id && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.account_id[0]}</span>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Category <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories
                                    .filter(cat => cat.type === formData.type)
                                    .map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                                        </option>
                                    ))
                                }
                            </select>
                            {errors.category_id && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.category_id[0]}</span>}
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
                                className="form-control"
                                required
                            >
                                <option value="">Select Currency</option>
                                {currencies.map(curr => (
                                    <option key={curr.id} value={curr.id}>
                                        {curr.code} ({curr.symbol}) — {curr.name}
                                    </option>
                                ))}
                            </select>
                            {errors.currency_id && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.currency_id[0]}</span>}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Amount ({getSymbolForCurrency(formData.currency_id)}) <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="form-control"
                                required
                            />
                            {errors.amount && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.amount[0]}</span>}
                        </div>

                        {/* Frequency */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Frequency <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="bi_weekly">Bi-Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                            {errors.frequency && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.frequency[0]}</span>}
                        </div>

                        {/* Conditional Day of Month or Day of Week */}
                        {['monthly', 'quarterly', 'yearly'].includes(formData.frequency) && (
                            <div>
                                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                    Day of Month (1 - 31)
                                </label>
                                <input
                                    type="number"
                                    name="day_of_month"
                                    min="1"
                                    max="31"
                                    value={formData.day_of_month}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        )}

                        {['weekly', 'bi_weekly'].includes(formData.frequency) && (
                            <div>
                                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                    Day of Week
                                </label>
                                <select
                                    name="day_of_week"
                                    value={formData.day_of_week}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="0">Sunday</option>
                                    <option value="1">Monday</option>
                                    <option value="2">Tuesday</option>
                                    <option value="3">Wednesday</option>
                                    <option value="4">Thursday</option>
                                    <option value="5">Friday</option>
                                    <option value="6">Saturday</option>
                                </select>
                            </div>
                        )}

                        {/* Start Date */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Start Date <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <CustomDatePicker
                                value={formData.start_date}
                                onChange={(val) => setFormData(prev => ({ ...prev, start_date: val }))}
                                placeholder="Select Start Date"
                            />
                            {errors.start_date && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.start_date[0]}</span>}
                        </div>

                        {/* End Date (Optional) */}
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                End Date (Optional)
                            </label>
                            <CustomDatePicker
                                value={formData.end_date}
                                onChange={(val) => setFormData(prev => ({ ...prev, end_date: val }))}
                                placeholder="Select End Date"
                            />
                            {errors.end_date && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.end_date[0]}</span>}
                        </div>

                        {/* Status Active Switch */}
                        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={Boolean(formData.is_active)}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                            />
                            <label htmlFor="is_active" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                Active (automatically trigger transaction on scheduled dates)
                            </label>
                        </div>

                        {/* Description */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Description <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g. Monthly Internet Bill, Salary Payment"
                                className="form-control"
                                required
                            />
                            {errors.description && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.description[0]}</span>}
                        </div>

                        {/* Notes */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Additional details..."
                                className="form-control"
                                rows={2}
                            />
                        </div>
                    </div>
                </form>
            )}
        </BaseModal>
    );
}
