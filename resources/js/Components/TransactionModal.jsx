import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import CustomDatePicker from './CustomDatePicker';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const getDefaultCurrencyId = (currencyList, appLocale = 'id') => {
    if (!Array.isArray(currencyList) || currencyList.length === 0) return '';

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

    if (target) {
        const matched = currencyList.find(c => {
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

export default function TransactionModal({
    isOpen,
    onClose,
    mode = 'create', // 'create' | 'edit' | 'show'
    transaction = null,
    accounts = [],
    categories = [],
    currencies = [],
    onSaved,
    showToast
}) {
    const isShow = mode === 'show';
    const isEdit = mode === 'edit';
    const pageProps = usePage().props;
    const locale = pageProps?.locale || 'id';

    const getInitialDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        type: 'expense',
        account_id: '',
        to_account_id: '',
        category_id: '',
        currency_id: '',
        amount: '',
        transaction_date: getInitialDate(),
        description: '',
        notes: '',
        reference_number: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (!isOpen) return;

        setErrors({});
        setIsSubmitting(false);

        const defaultAccountId = accounts.length > 0 ? accounts[0].id : '';
        const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
        const defaultCurrencyId = getDefaultCurrencyId(currencies, locale);

        if (transaction && (isEdit || isShow)) {
            setFormData({
                type: transaction.type || 'expense',
                account_id: transaction.account?.id || transaction.account_id || defaultAccountId,
                to_account_id: transaction.to_account?.id || transaction.to_account_id || '',
                category_id: transaction.category?.id || transaction.category_id || defaultCategoryId,
                currency_id: transaction.currency?.id || transaction.currency_id || defaultCurrencyId,
                amount: formatThousand(transaction.amount ?? ''),
                transaction_date: transaction.transaction_date || getInitialDate(),
                description: transaction.description || '',
                notes: transaction.notes || '',
                reference_number: transaction.reference_number || '',
            });
        } else {
            setFormData({
                type: 'expense',
                account_id: defaultAccountId,
                to_account_id: '',
                category_id: defaultCategoryId,
                currency_id: defaultCurrencyId,
                amount: '',
                transaction_date: getInitialDate(),
                description: '',
                notes: '',
                reference_number: '',
            });
        }
    }, [isOpen, transaction, mode]);

    const handleTypeChange = (newType) => {
        if (isShow) return;
        setFormData(prev => ({
            ...prev,
            type: newType,
            category_id: newType === 'transfer' ? '' : (prev.category_id || (categories.length > 0 ? categories[0].id : '')),
            to_account_id: newType === 'transfer' ? (prev.to_account_id || (accounts.find(a => a.id !== prev.account_id)?.id || '')) : ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            const formatted = formatThousand(value);
            setFormData(prev => ({ ...prev, amount: formatted }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleDateChange = (dateStr) => {
        setFormData(prev => ({ ...prev, transaction_date: dateStr }));
        if (errors.transaction_date) {
            setErrors(prev => ({ ...prev, transaction_date: null }));
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (isShow) return;

        setIsSubmitting(true);
        setErrors({});

        const numericAmount = Number(parseThousand(formData.amount)) || 0;

        // Balance validation check for Expense and Transfer transactions
        if (['expense', 'transfer'].includes(formData.type) && formData.account_id && numericAmount > 0) {
            const selectedAcc = accounts.find(a => String(a.id) === String(formData.account_id));
            if (selectedAcc) {
                let availableBalance = Number(selectedAcc.balance) || 0;

                // If editing existing transaction, restore original transaction amount to available balance
                if (isEdit && transaction && String(transaction.account?.id || transaction.account_id) === String(formData.account_id) && ['expense', 'transfer'].includes(transaction.type)) {
                    availableBalance += Number(transaction.amount) || 0;
                }

                if (numericAmount > availableBalance) {
                    const formattedBalance = new Intl.NumberFormat('id-ID').format(availableBalance);
                    const formattedReqAmount = new Intl.NumberFormat('id-ID').format(numericAmount);
                    const errorMsg = `Saldo tidak mencukupi! Saldo akun saat ini: Rp ${formattedBalance}, sedangkan nominal transaksi: Rp ${formattedReqAmount}.`;
                    
                    setErrors({ amount: [errorMsg] });
                    showToast(errorMsg, 'error');
                    setIsSubmitting(false);
                    return;
                }
            }
        }

        const payload = {
            ...formData,
            amount: parseThousand(formData.amount) || '0',
        };

        try {
            const url = isEdit
                ? route('transaction.update', { transaction: transaction.id })
                : route('transaction.store');
            
            const method = isEdit ? 'put' : 'post';
            const response = await axios[method](url, payload);

            if (response.data.success) {
                showToast(
                    response.data.message || (isEdit ? 'Transaction updated successfully!' : 'Transaction created successfully!'),
                    'success'
                );
                onSaved();
                onClose();
            } else {
                showToast(response.data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
                showToast('Please check your inputs', 'warning');
            } else {
                showToast(error.response?.data?.message || 'Server error occurred', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter categories based on transaction type
    const filteredCategories = categories.filter(c => !c.type || c.type === formData.type);

    const titleMap = { create: 'Add Transaction', edit: 'Edit Transaction', show: 'Transaction Details' };
    const modalTitle = titleMap[mode] || 'Transaction';

    // ── Dedicated Detail Card View for `isShow` ──────────────────────────
    if (isShow) {
        const isIncome = formData.type === 'income';
        const isExpense = formData.type === 'expense';
        const isTransfer = formData.type === 'transfer';

        const typeColor = isIncome ? '#34d399' : (isExpense ? '#f87171' : '#60a5fa');
        const typeBg = isIncome ? 'rgba(52, 211, 153, 0.12)' : (isExpense ? 'rgba(248, 113, 113, 0.12)' : 'rgba(96, 165, 250, 0.12)');
        const typeBorder = isIncome ? 'rgba(52, 211, 153, 0.25)' : (isExpense ? 'rgba(248, 113, 113, 0.25)' : 'rgba(96, 165, 250, 0.25)');
        const TypeIcon = isIncome ? TrendingUp : (isExpense ? TrendingDown : RefreshCw);

        const accountObj = accounts.find(a => String(a.id) === String(formData.account_id)) || transaction?.account;
        const toAccountObj = accounts.find(a => String(a.id) === String(formData.to_account_id)) || transaction?.to_account;
        const categoryObj = categories.find(c => String(c.id) === String(formData.category_id)) || transaction?.category;
        const currencyObj = currencies.find(c => String(c.id) === String(formData.currency_id)) || transaction?.currency;

        const formattedDate = transaction?.transaction_date_formatted 
            || transaction?.formatted_date 
            || formData.transaction_date;

        return (
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title="Transaction Details"
                size="md"
                footer={
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                        <button 
                            type="button"
                            className="bm-btn bm-btn-cancel" 
                            onClick={onClose}
                            style={{ minWidth: '100px' }}
                        >
                            Close
                        </button>
                    </div>
                }
            >
                <style>{`
                    .td-hero {
                        background: linear-gradient(135deg, ${typeBg}, rgba(15, 23, 42, 0.8));
                        border: 1px solid ${typeBorder};
                        border-radius: 16px;
                        padding: 24px 20px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                        margin-bottom: 20px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                    }
                    .td-type-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 5px 14px;
                        border-radius: 20px;
                        font-size: 11.5px;
                        font-weight: 700;
                        color: ${typeColor};
                        background: ${typeBg};
                        border: 1px solid ${typeBorder};
                        text-transform: uppercase;
                        letter-spacing: 0.6px;
                        margin-bottom: 12px;
                    }
                    .td-amount {
                        font-size: 30px;
                        font-weight: 800;
                        color: ${typeColor};
                        letter-spacing: -0.5px;
                        margin-bottom: 6px;
                        font-family: 'Inter', sans-serif;
                    }
                    .td-description {
                        font-size: 14px;
                        color: var(--text-secondary);
                        font-weight: 500;
                    }
                    .td-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    @media (max-width: 480px) {
                        .td-grid { grid-template-columns: 1fr; }
                    }
                    .td-item {
                        background: var(--bg-input);
                        border: 1px solid var(--bg-card-border);
                        border-radius: 12px;
                        padding: 13px 15px;
                        transition: border-color 0.2s ease;
                    }
                    .td-item:hover {
                        border-color: rgba(255, 255, 255, 0.15);
                    }
                    .td-item-full {
                        grid-column: 1 / -1;
                        background: var(--bg-input);
                        border: 1px solid var(--bg-card-border);
                        border-radius: 12px;
                        padding: 14px 16px;
                    }
                    .td-label {
                        font-size: 11px;
                        color: var(--text-secondary);
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 5px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .td-val {
                        font-size: 13.5px;
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                `}</style>

                <div className="td-hero">
                    <div className="td-type-badge">
                        <TypeIcon size={14} />
                        {formData.type}
                    </div>
                    <div className="td-amount">
                        {formData.type === 'income' ? '+ ' : (formData.type === 'expense' ? '- ' : '')}
                        Rp {formData.amount || '0'}
                    </div>
                    <div className="td-description">
                        {formData.description || 'No Description'}
                    </div>
                </div>

                <div className="td-grid">
                    <div className="td-item">
                        <div className="td-label">
                            📅 Transaction Date
                        </div>
                        <div className="td-val">
                            {formattedDate}
                        </div>
                    </div>

                    <div className="td-item">
                        <div className="td-label">
                            🏷️ Category
                        </div>
                        <div className="td-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {categoryObj ? (
                                <>
                                    <span style={{
                                        display: 'inline-block',
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: categoryObj.color || typeColor
                                    }} />
                                    {categoryObj.name}
                                </>
                            ) : (
                                isTransfer ? '— (Transfer)' : 'Uncategorized'
                            )}
                        </div>
                    </div>

                    <div className="td-item">
                        <div className="td-label">
                            🏦 Account
                        </div>
                        <div className="td-val">
                            {isTransfer ? (
                                <span>{accountObj?.name || 'Account'} &rarr; {toAccountObj?.name || 'Target'}</span>
                            ) : (
                                accountObj?.name || '—'
                            )}
                        </div>
                    </div>

                    <div className="td-item">
                        <div className="td-label">
                            💱 Currency
                        </div>
                        <div className="td-val">
                            {currencyObj ? `${currencyObj.name} (${currencyObj.symbol || currencyObj.code})` : 'Indonesian Rupiah (Rp)'}
                        </div>
                    </div>

                    {formData.reference_number && (
                        <div className="td-item">
                            <div className="td-label">
                                🔢 Reference Number
                            </div>
                            <div className="td-val" style={{ fontFamily: 'monospace' }}>
                                {formData.reference_number}
                            </div>
                        </div>
                    )}

                    {formData.notes && (
                        <div className="td-item-full">
                            <div className="td-label">
                                📝 Notes / Catatan
                            </div>
                            <div className="td-val" style={{ fontWeight: 400, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                {formData.notes}
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>
        );
    }

    const footer = (
        <>
            <button className="bm-btn bm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                Cancel
            </button>
            <button className="bm-btn bm-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                    <><span className="bm-spinner" /> Saving...</>
                ) : (isEdit ? 'Update Transaction' : 'Save Data')}
            </button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="lg"
            footer={footer}
        >
            <style>{`
                .tm-form { display: flex; flex-direction: column; gap: 16px; }
                .tm-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                @media (max-width: 520px) { .tm-row { grid-template-columns: 1fr; } }

                .tm-group { display: flex; flex-direction: column; gap: 5px; }
                .tm-group label {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-family: 'Inter', sans-serif;
                }
                .tm-group input,
                .tm-group select,
                .tm-group textarea {
                    background: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 10px;
                    padding: 9px 13px;
                    color: var(--text-primary);
                    font-size: 13.5px;
                    font-family: 'Inter', sans-serif;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .tm-group input:focus,
                .tm-group select:focus,
                .tm-group textarea:focus {
                    outline: none;
                    border-color: var(--accent);
                    background: var(--bg-input-focus);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }
                .tm-group input:disabled,
                .tm-group select:disabled,
                .tm-group textarea:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }
                .tm-field-error {
                    font-size: 11.5px;
                    color: var(--error);
                    font-weight: 500;
                    margin-top: 2px;
                }
                .tm-required { color: var(--error); margin-left: 2px; }

                /* Type selector buttons */
                .tm-type-grid {
                    display: flex;
                    gap: 8px;
                    width: 100%;
                }
                .tm-type-btn {
                    flex: 1;
                    min-width: 0;
                    padding: 9px 10px;
                    border-radius: 10px;
                    border: 1px solid var(--bg-card-border);
                    background: var(--bg-input);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .tm-type-btn:hover:not(:disabled) {
                    background: var(--bg-input-focus);
                    color: var(--text-primary);
                }
                .tm-type-btn.active-income {
                    border-color: #34d399;
                    background: rgba(52, 211, 153, 0.12);
                    color: #34d399;
                }
                .tm-type-btn.active-expense {
                    border-color: #f87171;
                    background: rgba(248, 113, 113, 0.12);
                    color: #f87171;
                }
                .tm-type-btn.active-transfer {
                    border-color: #60a5fa;
                    background: rgba(96, 165, 250, 0.12);
                    color: #60a5fa;
                }
                .tm-type-btn:disabled {
                    cursor: not-allowed;
                    opacity: 0.75;
                }
            `}</style>

            <form onSubmit={handleSubmit} className="tm-form">
                
                {/* Transaction Type Selector */}
                <div className="tm-group">
                    <label>Transaction Type</label>
                    <div className="tm-type-grid">
                        <button
                            type="button"
                            disabled={isShow}
                            onClick={() => handleTypeChange('income')}
                            className={`tm-type-btn ${formData.type === 'income' ? 'active-income' : ''}`}
                        >
                            <TrendingUp size={16} />
                            Income
                        </button>

                        <button
                            type="button"
                            disabled={isShow}
                            onClick={() => handleTypeChange('expense')}
                            className={`tm-type-btn ${formData.type === 'expense' ? 'active-expense' : ''}`}
                        >
                            <TrendingDown size={16} />
                            Expense
                        </button>

                        <button
                            type="button"
                            disabled={isShow}
                            onClick={() => handleTypeChange('transfer')}
                            className={`tm-type-btn ${formData.type === 'transfer' ? 'active-transfer' : ''}`}
                        >
                            <RefreshCw size={16} />
                            Transfer
                        </button>
                    </div>
                </div>

                {/* Amount & Date Row */}
                <div className="tm-row">
                    <div className="tm-group">
                        <label>
                            Amount <span className="tm-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="amount"
                            placeholder="0"
                            value={formData.amount}
                            onChange={handleChange}
                            disabled={isShow}
                        />
                        {errors.amount && <div className="tm-field-error">{errors.amount[0]}</div>}
                    </div>

                    <div className="tm-group">
                        <label>
                            Transaction Date <span className="tm-required">*</span>
                        </label>
                        <CustomDatePicker
                            value={formData.transaction_date}
                            onChange={handleDateChange}
                            disabled={isShow}
                            placeholder="Select Date"
                        />
                        {errors.transaction_date && <div className="tm-field-error">{errors.transaction_date[0]}</div>}
                    </div>
                </div>

                {/* Account & Destination Account (if transfer) Row */}
                <div className={formData.type === 'transfer' ? 'tm-row' : 'tm-group'}>
                    <div className="tm-group">
                        <label>
                            {formData.type === 'transfer' ? 'From Account' : 'Account'} <span className="tm-required">*</span>
                        </label>
                        <select
                            name="account_id"
                            value={formData.account_id}
                            onChange={handleChange}
                            disabled={isShow}
                        >
                            <option value="">Select Account</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} ({acc.balance ? `Rp ${Number(acc.balance).toLocaleString('id-ID')}` : ''})
                                </option>
                            ))}
                        </select>
                        {errors.account_id && <div className="tm-field-error">{errors.account_id[0]}</div>}
                    </div>

                    {formData.type === 'transfer' && (
                        <div className="tm-group">
                            <label>
                                To Account <span className="tm-required">*</span>
                            </label>
                            <select
                                name="to_account_id"
                                value={formData.to_account_id}
                                onChange={handleChange}
                                disabled={isShow}
                            >
                                <option value="">Select Target Account</option>
                                {accounts.filter(acc => acc.id !== formData.account_id).map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name}
                                    </option>
                                ))}
                            </select>
                            {errors.to_account_id && <div className="tm-field-error">{errors.to_account_id[0]}</div>}
                        </div>
                    )}
                </div>

                {/* Category & Currency Row */}
                <div className={formData.type !== 'transfer' ? 'tm-row' : 'tm-group'}>
                    {formData.type !== 'transfer' && (
                        <div className="tm-group">
                            <label>
                                Category <span className="tm-required">*</span>
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                disabled={isShow}
                            >
                                <option value="">Select Category</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && <div className="tm-field-error">{errors.category_id[0]}</div>}
                        </div>
                    )}

                    <div className="tm-group">
                        <label>
                            Currency <span className="tm-required">*</span>
                        </label>
                        <select
                            name="currency_id"
                            value={formData.currency_id}
                            onChange={handleChange}
                            disabled={isShow}
                        >
                            <option value="">Select Currency</option>
                            {currencies.map(curr => {
                                const nameStr = curr.name || curr.code || String(curr);
                                const symbol = curr.symbol || (
                                    nameStr.includes('Rupiah') ? 'Rp' :
                                    nameStr.includes('US Dollar') || nameStr.includes('Dollar') ? '$' :
                                    nameStr.includes('Euro') ? '€' :
                                    nameStr.includes('Singapore') ? 'S$' :
                                    nameStr.includes('Ringgit') ? 'RM' : ''
                                );
                                return (
                                    <option key={curr.id || curr} value={curr.id || curr}>
                                        {symbol ? `${nameStr} (${symbol})` : (curr.code ? `${curr.code} - ${nameStr}` : nameStr)}
                                    </option>
                                );
                            })}
                        </select>
                        {errors.currency_id && <div className="tm-field-error">{errors.currency_id[0]}</div>}
                    </div>
                </div>

                {/* Description & Reference Number */}
                <div className="tm-row">
                    <div className="tm-group">
                        <label>
                            Description <span className="tm-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="description"
                            placeholder="e.g. Monthly Salary, Groceries"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isShow}
                        />
                        {errors.description && <div className="tm-field-error">{errors.description[0]}</div>}
                    </div>

                    <div className="tm-group">
                        <label>Reference Number</label>
                        <input
                            type="text"
                            name="reference_number"
                            placeholder="e.g. REF-98124"
                            value={formData.reference_number}
                            onChange={handleChange}
                            disabled={isShow}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="tm-group">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        rows="2"
                        placeholder="Additional details..."
                        value={formData.notes}
                        onChange={handleChange}
                        disabled={isShow}
                    />
                </div>

            </form>
        </BaseModal>
    );
}
