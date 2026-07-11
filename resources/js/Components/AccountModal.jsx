import React, { useState, useEffect, useRef, useCallback } from 'react';
import BaseModal from './BaseModal';
import axios from 'axios';

const POPULAR_EMOJIS = [
    // Finance/Business
    '💰', '💵', '💳', '🪙', '💸', '📈', '📉', '📊', '🏦', '💎',
    // Houses/Vehicles
    '🏠', '🏢', '🏦', '🚗', '🏍️', '🚲', '✈️', '⛵', '🗺️', '🔑',
    // Brands/Misc
    '💼', '🌟', '🔥', '✨', '⚡', '🔒', '🔔', '🎨', '🎮', '❤️'
];

// ── Number formatting helpers ──────────────────────────────────────
const formatThousands = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    // Remove existing dots, then reformat
    const raw = String(value).replace(/\./g, '').replace(/[^0-9]/g, '');
    if (raw === '') return '';
    return parseInt(raw, 10).toLocaleString('id-ID').replace(/,/g, '.').replace(/\./g, '.');
};

const parseFormatted = (value) => {
    // Remove thousand separator dots, return a plain number
    const stripped = String(value).replace(/\./g, '').replace(/[^0-9]/g, '');
    return stripped === '' ? 0 : Number(stripped);
};

// ── Color helpers ──────────────────────────────────────────────────
const hexToRgb = (hex) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
    const rgb = parseInt(c, 16);
    return [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];
};

const rgbToHex = (r, g, b) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

const parseRgba = (rgbaStr) => {
    if (!rgbaStr || !rgbaStr.startsWith('rgba')) return { hex: '#3b82f6', alpha: 0.15 };
    const m = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return { hex: '#3b82f6', alpha: 0.15 };
    return {
        hex: rgbToHex(parseInt(m[1]), parseInt(m[2]), parseInt(m[3])),
        alpha: m[4] !== undefined ? parseFloat(m[4]) : 1.0
    };
};

// ── Searchable Select Component ────────────────────────────────────
function SearchableSelect({ id, options, value, onChange, placeholder, disabled }) {
    const [open, setOpen]           = useState(false);
    const [search, setSearch]       = useState('');
    const wrapRef                   = useRef(null);
    const inputRef                  = useRef(null);

    const selectedLabel = options.find(o => String(o.id) === String(value))?.name || '';

    const filtered = options.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (optId) => {
        onChange(optId);
        setOpen(false);
        setSearch('');
    };

    return (
        <div
            ref={wrapRef}
            className={`ac-ss-wrapper ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
            id={id}
        >
            {/* Trigger */}
            <div
                className="ac-ss-trigger"
                onClick={() => { if (!disabled) setOpen(o => !o); }}
            >
                <span className={`ac-ss-value ${!selectedLabel ? 'placeholder' : ''}`}>
                    {selectedLabel || placeholder}
                </span>
                <svg className={`ac-ss-arrow ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="ac-ss-dropdown">
                    <div className="ac-ss-search-wrap">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            ref={inputRef}
                            className="ac-ss-search"
                            placeholder="Search type..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Escape') { setOpen(false); setSearch(''); }
                                if (e.key === 'Enter' && filtered.length > 0) handleSelect(filtered[0].id);
                            }}
                        />
                    </div>
                    <div className="ac-ss-options">
                        <div
                            className={`ac-ss-option ${!value ? 'selected' : ''}`}
                            onClick={() => handleSelect('')}
                        >
                            {placeholder}
                        </div>
                        {filtered.length === 0 ? (
                            <div className="ac-ss-no-results">No results found</div>
                        ) : (
                            filtered.map(o => (
                                <div
                                    key={o.id}
                                    className={`ac-ss-option ${String(value) === String(o.id) ? 'selected' : ''}`}
                                    onClick={() => handleSelect(o.id)}
                                >
                                    {o.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Formatted number input ─────────────────────────────────────────
function AmountInput({ id, name, value, onChange, placeholder, disabled, required }) {
    const [displayValue, setDisplayValue] = useState('');

    // Sync display when formData changes from outside (e.g. populate on edit)
    useEffect(() => {
        if (value === 0 || value === '' || value === null) {
            setDisplayValue('');
        } else {
            setDisplayValue(formatThousands(value));
        }
    }, [value]);

    const handleInput = (e) => {
        const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
        const formatted = raw === '' ? '' : parseInt(raw, 10).toLocaleString('id-ID').replace(/,/g, '');
        // re-format with dots as thousands separator
        const withDots = raw === '' ? '' : parseInt(raw, 10).toLocaleString('de-DE');
        setDisplayValue(withDots);
        // send raw numeric value upstream
        onChange(name, raw === '' ? 0 : Number(raw));
    };

    return (
        <input
            id={id}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInput}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete="off"
        />
    );
}

// ── Main Modal ─────────────────────────────────────────────────────
export default function AccountModal({ isOpen, mode, data, accountTypes, currencies, onClose, onSave, onShowToast }) {
    const [formData, setFormData] = useState({
        name: '',
        account_type_id: '',
        currency_id: '',
        institution_name: '',
        account_number: '',
        balance: 0,
        credit_limit: 0,
        is_default: 0,
        notes: '',
        is_active: 1,
        icon: '💰',
        color: 'rgba(59, 130, 246, 0.15)'
    });

    const [colorHex, setColorHex] = useState('#3b82f6');
    const [colorAlpha, setColorAlpha] = useState(0.15);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    // Convert accountTypes object to array for SearchableSelect
    const accountTypeOptions = Object.entries(accountTypes || {}).map(([id, name]) => ({ id, name }));
    const currencyOptions    = Object.entries(currencies   || {}).map(([id, name]) => ({ id, name }));

    // Close emoji picker on click outside
    useEffect(() => {
        const h = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target))
                setShowEmojiPicker(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // Reset / populate form
    useEffect(() => {
        if (!isOpen) return;
        setErrors({});
        setIsSubmitting(false);

        if (mode === 'create') {
            setFormData({
                name: '', account_type_id: '', currency_id: '',
                institution_name: '', account_number: '',
                balance: 0, credit_limit: 0, is_default: 0,
                notes: '', is_active: 1, icon: '💰',
                color: 'rgba(59, 130, 246, 0.15)'
            });
            setColorHex('#3b82f6');
            setColorAlpha(0.15);
        } else if (data) {
            setFormData({
                name:              data.name || '',
                account_type_id:   data.account_type?.id || '',
                currency_id:       data.currency?.id || '',
                institution_name:  data.institution_name || '',
                account_number:    data.account_number || '',
                balance:           data.balance !== undefined ? Number(data.balance) : 0,
                credit_limit:      data.credit_limit !== undefined ? Number(data.credit_limit) : 0,
                is_default:        data.is_default ? 1 : 0,
                notes:             data.notes || '',
                is_active:         data.is_active !== undefined ? Number(data.is_active) : 1,
                icon:              data.icon || '💰',
                color:             data.color || 'rgba(59, 130, 246, 0.15)'
            });
            const { hex, alpha } = parseRgba(data.color);
            setColorHex(hex);
            setColorAlpha(alpha);
        }
    }, [isOpen, mode, data]);

    const isReadOnly = mode === 'show';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
    };

    // Amount field handler (from AmountInput)
    const handleAmountChange = (name, numericValue) => {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    // Color handlers
    const handleHexChange = (e) => {
        const hex = e.target.value;
        setColorHex(hex);
        const [r, g, b] = hexToRgb(hex);
        setFormData(prev => ({ ...prev, color: `rgba(${r}, ${g}, ${b}, ${colorAlpha})` }));
    };
    const handleAlphaChange = (e) => {
        const alpha = parseFloat(e.target.value);
        setColorAlpha(alpha);
        const [r, g, b] = hexToRgb(colorHex);
        setFormData(prev => ({ ...prev, color: `rgba(${r}, ${g}, ${b}, ${alpha})` }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (isReadOnly) return;
        setIsSubmitting(true);
        setErrors({});

        // balance and credit_limit are already plain numbers in formData
        const payload = { ...formData };

        try {
            let res;
            if (mode === 'create') {
                res = await axios.post(route('account.store'), payload);
            } else {
                res = await axios.put(route('account.update', { account: data.id }), payload);
            }

            if (res.data.success) {
                onShowToast(
                    mode === 'create' ? 'Account created successfully!' : 'Account updated successfully!',
                    'success'
                );
                onSave();
                onClose();
            } else {
                onShowToast(res.data.message || 'Something went wrong', 'error');
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                onShowToast('Please check your inputs', 'warning');
            } else {
                onShowToast(err.response?.data?.message || 'Server error occurred', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const titleMap = { create: 'Add Account', edit: 'Edit Account', show: 'Account Details' };

    const footer = (
        <>
            <button className="bm-btn bm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
                <button className="bm-btn bm-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (<><span className="bm-spinner" /> Saving...</>) : 'Save Data'}
                </button>
            )}
        </>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={titleMap[mode]} size="xl" footer={footer}>
            {isReadOnly ? (
                /* ── Detail view ── */
                <table className="ac-detail-table">
                    <tbody>
                        <tr>
                            <th>Account</th>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="account-icon" style={{ background: data?.color || 'rgba(125,211,168,0.15)' }}>
                                        {data?.icon || '💰'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{data?.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{data?.masked_account_number || '—'}</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr><th>Type</th><td>{data?.account_type?.name || '—'}</td></tr>
                        <tr><th>Institution</th><td>{data?.institution_name || '—'}</td></tr>
                        <tr><th>Currency</th><td>{data?.currency?.code || '—'}</td></tr>
                        <tr><th>Notes</th><td>{data?.notes || '—'}</td></tr>
                        <tr><th>Created At</th><td>{data?.created_at || '—'}</td></tr>
                        <tr><th>Last Updated</th><td>{data?.updated_at || '—'}</td></tr>
                    </tbody>
                </table>
            ) : (
                /* ── Create / Edit form ── */
                <form className="ac-form" onSubmit={handleSubmit}>
                    {/* Account Name */}
                    <div className="ac-group">
                        <label htmlFor="accountName">
                            Account Name <span className="ac-required">*</span>
                        </label>
                        <input
                            id="accountName" name="name" type="text"
                            value={formData.name} onChange={handleChange}
                            placeholder="e.g., BCA Savings"
                            required disabled={isSubmitting}
                        />
                        {errors.name && <span className="ac-field-error">{errors.name[0]}</span>}
                    </div>

                    {/* Account Type (Searchable) + Currency */}
                    <div className="ac-row">
                        <div className="ac-group">
                            <label htmlFor="accountType">
                                Account Type <span className="ac-required">*</span>
                            </label>
                            <SearchableSelect
                                id="accountType"
                                options={accountTypeOptions}
                                value={formData.account_type_id}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, account_type_id: val }));
                                    if (errors.account_type_id) setErrors(prev => ({ ...prev, account_type_id: null }));
                                }}
                                placeholder="Select Type"
                                disabled={isSubmitting}
                            />
                            {errors.account_type_id && <span className="ac-field-error">{errors.account_type_id[0]}</span>}
                        </div>
                        <div className="ac-group">
                            <label htmlFor="accountCurrency">
                                Currency <span className="ac-required">*</span>
                            </label>
                            <select
                                id="accountCurrency" name="currency_id"
                                value={formData.currency_id} onChange={handleChange}
                                required disabled={isSubmitting}
                            >
                                <option value="">Select Currency</option>
                                {currencyOptions.map(({ id, name }) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                            {errors.currency_id && <span className="ac-field-error">{errors.currency_id[0]}</span>}
                        </div>
                    </div>

                    {/* Institution Name */}
                    <div className="ac-group">
                        <label htmlFor="accountInstitution">Institution Name</label>
                        <input
                            id="accountInstitution" name="institution_name" type="text"
                            value={formData.institution_name} onChange={handleChange}
                            placeholder="e.g., Bank Central Asia"
                            disabled={isSubmitting}
                        />
                        {errors.institution_name && <span className="ac-field-error">{errors.institution_name[0]}</span>}
                    </div>

                    {/* Account Number */}
                    <div className="ac-group">
                        <label htmlFor="accountNumber">Account Number</label>
                        <input
                            id="accountNumber" name="account_number" type="text"
                            value={formData.account_number} onChange={handleChange}
                            placeholder="Last 4 digits or masked number"
                            disabled={isSubmitting}
                        />
                        {errors.account_number && <span className="ac-field-error">{errors.account_number[0]}</span>}
                    </div>

                    {/* Balance + Credit Limit — formatted */}
                    <div className="ac-row">
                        <div className="ac-group">
                            <label htmlFor="accountBalance">
                                Balance <span className="ac-required">*</span>
                            </label>
                            <AmountInput
                                id="accountBalance"
                                name="balance"
                                value={formData.balance}
                                onChange={handleAmountChange}
                                placeholder="0"
                                disabled={isSubmitting}
                                required
                            />
                            {errors.balance && <span className="ac-field-error">{errors.balance[0]}</span>}
                        </div>
                        <div className="ac-group">
                            <label htmlFor="accountCreditLimit">Credit Limit</label>
                            <AmountInput
                                id="accountCreditLimit"
                                name="credit_limit"
                                value={formData.credit_limit}
                                onChange={handleAmountChange}
                                placeholder="0 (for credit cards)"
                                disabled={isSubmitting}
                            />
                            {errors.credit_limit && <span className="ac-field-error">{errors.credit_limit[0]}</span>}
                        </div>
                    </div>

                    {/* Icon + Color (Create only) */}
                    {mode === 'create' && (
                        <div ref={emojiPickerRef}>
                            <div className="ac-row">
                                <div className="ac-group">
                                    <label>Icon Emoji</label>
                                    <div
                                        className="cm-emoji-trigger"
                                        onClick={() => !isSubmitting && setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <span className="cm-emoji-display">{formData.icon || '💰'}</span>
                                        <span className="cm-emoji-label">Click to select emoji</span>
                                    </div>
                                    {errors.icon && <span className="ac-field-error">{errors.icon[0]}</span>}
                                </div>
                                <div className="ac-group">
                                    <label>Color Theme (RGBA)</label>
                                    <div className="color-picker-wrapper">
                                        <input type="color" value={colorHex} onChange={handleHexChange} disabled={isSubmitting} />
                                        <input type="range" min="0" max="1" step="0.01" value={colorAlpha} onChange={handleAlphaChange} disabled={isSubmitting} />
                                        <input type="text" value={formData.color} readOnly />
                                    </div>
                                    {errors.color && <span className="ac-field-error">{errors.color[0]}</span>}
                                </div>
                            </div>

                            {showEmojiPicker && (
                                <div className="cm-emoji-inline-picker">
                                    <div className="cm-emoji-inline-header">
                                        <span>Select Account Icon</span>
                                        <button type="button" onClick={() => setShowEmojiPicker(false)}>&times;</button>
                                    </div>
                                    <div className="cm-emoji-inline-grid">
                                        {POPULAR_EMOJIS.map(emoji => (
                                            <div
                                                key={emoji}
                                                className={`cm-emoji-option ${formData.icon === emoji ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, icon: emoji }));
                                                    if (errors.icon) setErrors(prev => ({ ...prev, icon: null }));
                                                }}
                                            >
                                                {emoji}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Default Account Checkbox */}
                    <div className="ac-group">
                        <div className="ac-checkbox-group">
                            <input
                                id="accountDefault" name="is_default" type="checkbox"
                                checked={Number(formData.is_default) === 1}
                                onChange={handleCheckboxChange}
                                disabled={isSubmitting}
                            />
                            <label htmlFor="accountDefault">Set as default account</label>
                        </div>
                        {errors.is_default && <span className="ac-field-error">{errors.is_default[0]}</span>}
                    </div>

                    {/* Status (Edit only) */}
                    {mode === 'edit' && (
                        <div className="ac-group">
                            <label>Status <span className="ac-required">*</span></label>
                            <div className="ac-radio-group">
                                <label className={`ac-radio-option ${Number(formData.is_active) === 1 ? 'active-active' : ''} ${isSubmitting ? 'disabled' : ''}`}>
                                    <input type="radio" name="is_active" value="1"
                                        checked={Number(formData.is_active) === 1}
                                        onChange={() => { if (!isSubmitting) setFormData(prev => ({ ...prev, is_active: 1 })); }}
                                        className="ac-radio-input" disabled={isSubmitting}
                                    />
                                    <span className="ac-radio-dot" />
                                    <span>Active</span>
                                </label>
                                <label className={`ac-radio-option ${Number(formData.is_active) === 0 ? 'active-inactive' : ''} ${isSubmitting ? 'disabled' : ''}`}>
                                    <input type="radio" name="is_active" value="0"
                                        checked={Number(formData.is_active) === 0}
                                        onChange={() => { if (!isSubmitting) setFormData(prev => ({ ...prev, is_active: 0 })); }}
                                        className="ac-radio-input" disabled={isSubmitting}
                                    />
                                    <span className="ac-radio-dot" />
                                    <span>Inactive</span>
                                </label>
                            </div>
                            {errors.is_active && <span className="ac-field-error">{errors.is_active[0]}</span>}
                        </div>
                    )}

                    {/* Notes */}
                    <div className="ac-group">
                        <label htmlFor="accountNotes">Notes</label>
                        <textarea
                            id="accountNotes" name="notes"
                            value={formData.notes} onChange={handleChange}
                            placeholder="Optional notes about this account" rows="3"
                            disabled={isSubmitting}
                        />
                        {errors.notes && <span className="ac-field-error">{errors.notes[0]}</span>}
                    </div>
                </form>
            )}
        </BaseModal>
    );
}
