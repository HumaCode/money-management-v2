import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import CustomDatePicker from './CustomDatePicker';
import EmptyState from './EmptyState';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { Wallet, ShieldCheck, DollarSign, Building, ArrowLeftRight, TrendingUp, TrendingDown, RefreshCw, ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';

const getDefaultCurrencyId = (currencyList, appLocale = 'id') => {
    if (!currencyList) return '';

    const localeStr = String(appLocale).toLowerCase();

    const localeMap = {
        'id': { codes: ['IDR'], symbols: ['Rp'], keywords: ['rupiah', 'indonesia'] },
        'id_id': { codes: ['IDR'], symbols: ['Rp'], keywords: ['rupiah', 'indonesia'] },
        'en': { codes: ['USD'], symbols: ['$'], keywords: ['us dollar', 'dollar'] },
        'en_us': { codes: ['USD'], symbols: ['$'], keywords: ['us dollar', 'dollar'] },
        'us': { codes: ['USD'], symbols: ['$'], keywords: ['us dollar', 'dollar'] },
        'ja': { codes: ['JPY'], symbols: ['¥'], keywords: ['yen', 'japan'] },
        'ja_jp': { codes: ['JPY'], symbols: ['¥'], keywords: ['yen', 'japan'] },
        'gb': { codes: ['GBP'], symbols: ['£'], keywords: ['pound', 'sterling'] },
        'ms': { codes: ['MYR'], symbols: ['RM'], keywords: ['ringgit', 'malaysia'] },
        'ms_my': { codes: ['MYR'], symbols: ['RM'], keywords: ['ringgit', 'malaysia'] },
        'sg': { codes: ['SGD'], symbols: ['S$'], keywords: ['singapore'] },
    };

    const target = localeMap[localeStr] || (localeStr.startsWith('id') ? localeMap['id'] : null);

    const list = Array.isArray(currencyList) ? currencyList : (typeof currencyList === 'object' ? Object.entries(currencyList).map(([id, name]) => ({ id, name })) : []);

    if (target) {
        const matched = list.find(c => {
            const code = String(c.code || '').toUpperCase();
            const symbol = String(c.symbol || '');
            const name = String(c.name || '').toLowerCase();

            return target.codes.includes(code) ||
                   target.symbols.includes(symbol) ||
                   target.keywords.some(k => name.includes(k));
        });

        if (matched) {
            return matched.id || matched;
        }
    }

    return '';
};

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
    const pageProps = usePage().props;
    const locale = pageProps?.locale || 'id';

    const [accountTransactions, setAccountTransactions] = useState([]);
    const [isLoadingTx, setIsLoadingTx] = useState(false);
    const [txPage, setTxPage] = useState(1);
    const [txMeta, setTxMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchAccountTransactions = (page = 1, start = startDate, end = endDate) => {
        if (!data?.id) return;
        setIsLoadingTx(true);
        axios.get(route('transaction.allPagination'), {
            params: {
                account_id: data.id,
                start_date: start || null,
                end_date: end || null,
                page: page,
                row_per_page: 10
            }
        }).then(res => {
            if (res.data?.success) {
                setAccountTransactions(res.data.data.data || []);
                const meta = res.data.data.meta || {};
                setTxMeta({
                    current_page: meta.current_page || 1,
                    last_page: meta.last_page || 1,
                    total: meta.total || 0,
                    per_page: meta.per_page || 10
                });
                setTxPage(meta.current_page || 1);
            }
        }).catch(err => {
            console.error('Error fetching account transaction history:', err);
        }).finally(() => {
            setIsLoadingTx(false);
        });
    };

    useEffect(() => {
        if (isOpen && isShow && data?.id) {
            setStartDate('');
            setEndDate('');
            setTxPage(1);
            fetchAccountTransactions(1, '', '');
        } else {
            setAccountTransactions([]);
        }
    }, [isOpen, isShow, data?.id]);

    const handleStartDateChange = (e) => {
        const val = e.target.value;
        setStartDate(val);
        setTxPage(1);
        fetchAccountTransactions(1, val, endDate);
    };

    const handleEndDateChange = (e) => {
        const val = e.target.value;
        setEndDate(val);
        setTxPage(1);
        fetchAccountTransactions(1, startDate, val);
    };

    const handleResetDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setTxPage(1);
        fetchAccountTransactions(1, '', '');
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > txMeta.last_page || newPage === txPage) return;
        setTxPage(newPage);
        fetchAccountTransactions(newPage, startDate, endDate);
    };

    const generatePaginationPages = (current, last) => {
        if (last <= 7) {
            return Array.from({ length: last }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', last];
        }
        if (current >= last - 3) {
            return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
        }
        return [1, '...', current - 1, current, current + 1, '...', last];
    };

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
                const defaultCurrencyId = getDefaultCurrencyId(currencies, locale);
                setFormData({
                    name: '',
                    account_type_id: firstTypeKey,
                    institution_name: '',
                    account_number: '',
                    currency_id: defaultCurrencyId,
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

    const footer = (
        <>
            <button className="bm-btn bm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                {isShow ? 'Close' : 'Cancel'}
            </button>
            {!isShow && (
                <button className="bm-btn bm-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <><span className="bm-spinner" /> Saving...</>
                    ) : (isEdit ? 'Update Account' : 'Create Account')}
                </button>
            )}
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            subtitle={modalSubtitle}
            icon={Wallet}
            size="xl"
            footer={footer}
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

                    {/* Transaction History Section */}
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowLeftRight size={16} style={{ color: 'var(--accent)' }} />
                                Transaction History & Money Flow
                            </h4>

                            {/* Date Filter Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <div style={{ width: '150px' }}>
                                    <CustomDatePicker
                                        value={startDate}
                                        onChange={(val) => {
                                            setStartDate(val);
                                            setTxPage(1);
                                            fetchAccountTransactions(1, val, endDate);
                                        }}
                                        placeholder="Start Date"
                                        placement="top"
                                    />
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>-</span>
                                <div style={{ width: '150px' }}>
                                    <CustomDatePicker
                                        value={endDate}
                                        onChange={(val) => {
                                            setEndDate(val);
                                            setTxPage(1);
                                            fetchAccountTransactions(1, startDate, val);
                                        }}
                                        placeholder="End Date"
                                        placement="top"
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <button
                                        type="button"
                                        onClick={handleResetDateFilter}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--bg-card-border)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: 'var(--text-secondary)',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            height: '42px'
                                        }}
                                        title="Reset Date Filter"
                                    >
                                        <RotateCcw size={14} />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--bg-card-border)',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--bg-card-border)', background: 'rgba(0,0,0,0.1)' }}>
                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Type</th>
                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Description</th>
                                            <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Category / Flow</th>
                                            <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoadingTx ? (
                                            [0, 1, 2, 3].map(i => (
                                                <tr key={`sk-${i}`} style={{ borderBottom: '1px solid var(--bg-card-border)', animation: 'sk-pulse 1.4s ease-in-out infinite' }}>
                                                    <td style={{ padding: '12px 14px' }}><div style={{ background: 'var(--bg-card-border)', height: '12px', width: '80px', borderRadius: '4px' }} /></td>
                                                    <td style={{ padding: '12px 14px' }}><div style={{ background: 'var(--bg-card-border)', height: '18px', width: '56px', borderRadius: '12px' }} /></td>
                                                    <td style={{ padding: '12px 14px' }}><div style={{ background: 'var(--bg-card-border)', height: '12px', width: '140px', borderRadius: '4px' }} /></td>
                                                    <td style={{ padding: '12px 14px' }}><div style={{ background: 'var(--bg-card-border)', height: '12px', width: '90px', borderRadius: '4px' }} /></td>
                                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}><div style={{ background: 'var(--bg-card-border)', height: '12px', width: '70px', borderRadius: '4px', marginLeft: 'auto' }} /></td>
                                                </tr>
                                            ))
                                        ) : accountTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '20px 0' }}>
                                                    <EmptyState 
                                                        message="No transaction records found for this account."
                                                        icon="FolderOpen"
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            accountTransactions.map(tx => {
                                                const isIncome = tx.type === 'income';
                                                const isExpense = tx.type === 'expense';
                                                const isTransfer = tx.type === 'transfer';
                                                const typeColor = isIncome ? '#34d399' : (isExpense ? '#f87171' : '#60a5fa');
                                                const typeBg = isIncome ? 'rgba(52, 211, 153, 0.12)' : (isExpense ? 'rgba(248, 113, 113, 0.12)' : 'rgba(96, 165, 250, 0.12)');

                                                return (
                                                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--bg-card-border)' }}>
                                                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                            {tx.transaction_date_formatted || tx.transaction_date}
                                                        </td>
                                                        <td style={{ padding: '10px 14px' }}>
                                                            <span style={{
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                color: typeColor,
                                                                background: typeBg,
                                                                display: 'inline-block',
                                                                textTransform: 'capitalize'
                                                            }}>
                                                                {tx.type_label || tx.type}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                            {tx.description}
                                                        </td>
                                                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                                                            {isTransfer ? (
                                                                `${tx.account?.name || 'Account'} → ${tx.to_account?.name || 'Target'}`
                                                            ) : (
                                                                tx.category?.name || '—'
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: typeColor, whiteSpace: 'nowrap' }}>
                                                            {tx.amount_formatted}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                                    {/* Compact Pagination Bar (< 1 2 3 ... 9 10 >) */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        borderTop: '1px solid var(--bg-card-border)',
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        <span>
                                            Showing {accountTransactions.length} of {txMeta.total} records (Page {txMeta.current_page} of {txMeta.last_page})
                                        </span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {/* Previous Button */}
                                            <button
                                                type="button"
                                                disabled={txPage <= 1 || isLoadingTx}
                                                onClick={() => handlePageChange(txPage - 1)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--bg-card-border)',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    color: 'var(--text-primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: txPage <= 1 ? 'not-allowed' : 'pointer',
                                                    opacity: txPage <= 1 ? 0.4 : 1
                                                }}
                                            >
                                                <ChevronLeft size={14} />
                                            </button>

                                            {/* Page Number Buttons */}
                                            {generatePaginationPages(txMeta.current_page, txMeta.last_page).map((item, idx) => {
                                                if (item === '...') {
                                                    return (
                                                        <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                const isActive = item === txMeta.current_page;
                                                return (
                                                    <button
                                                        key={`page-${item}`}
                                                        type="button"
                                                        disabled={isLoadingTx}
                                                        onClick={() => handlePageChange(item)}
                                                        style={{
                                                            minWidth: '28px',
                                                            height: '28px',
                                                            padding: '0 6px',
                                                            borderRadius: '6px',
                                                            border: isActive ? 'none' : '1px solid var(--bg-card-border)',
                                                            background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                                                            color: isActive ? '#000' : 'var(--text-primary)',
                                                            fontWeight: isActive ? 700 : 500,
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {item}
                                                    </button>
                                                );
                                            })}

                                            {/* Next Button */}
                                            <button
                                                type="button"
                                                disabled={txPage >= txMeta.last_page || isLoadingTx}
                                                onClick={() => handlePageChange(txPage + 1)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--bg-card-border)',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    color: 'var(--text-primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: txPage >= txMeta.last_page ? 'not-allowed' : 'pointer',
                                                    opacity: txPage >= txMeta.last_page ? 0.4 : 1
                                                }}
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                        </div>
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
                                    Object.entries(currencies).map(([id, item]) => {
                                        const labelStr = typeof item === 'string' ? item : (item.name || id);
                                        const symbol = typeof item === 'object' && item.symbol ? item.symbol : (
                                            labelStr.includes('Rupiah') ? 'Rp' :
                                            labelStr.includes('US Dollar') || labelStr.includes('Dollar') ? '$' :
                                            labelStr.includes('Euro') ? '€' :
                                            labelStr.includes('Singapore') ? 'S$' :
                                            labelStr.includes('Ringgit') ? 'RM' : ''
                                        );
                                        return (
                                            <option key={id} value={id}>
                                                {symbol ? `${labelStr} (${symbol})` : labelStr}
                                            </option>
                                        );
                                    })
                                ) : (
                                    Array.isArray(currencies) && currencies.map(c => {
                                        const nameStr = c.name || c.code || String(c);
                                        const symbol = c.symbol || (
                                            nameStr.includes('Rupiah') ? 'Rp' :
                                            nameStr.includes('US Dollar') || nameStr.includes('Dollar') ? '$' :
                                            nameStr.includes('Euro') ? '€' :
                                            nameStr.includes('Singapore') ? 'S$' :
                                            nameStr.includes('Ringgit') ? 'RM' : ''
                                        );
                                        return (
                                            <option key={c.id || c} value={c.id || c}>
                                                {symbol ? `${nameStr} (${symbol})` : (c.code ? `${c.code} - ${nameStr}` : nameStr)}
                                            </option>
                                        );
                                    })
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
                </form>
            )}
        </BaseModal>
    );
}
