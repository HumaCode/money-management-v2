import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import CustomDatePicker from './CustomDatePicker';
import axios from 'axios';

// ── Searchable Select ─────────
function SearchableSelect({ id, options, value, onChange, placeholder, disabled }) {
    const [open, setOpen]     = useState(false);
    const [search, setSearch] = useState('');
    const wrapRef             = useRef(null);
    const inputRef            = useRef(null);

    const selectedLabel = options.find(o => String(o.id) === String(value))?.name || '';
    const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

    useEffect(() => {
        const h = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false); setSearch('');
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={wrapRef} className={`ac-ss-wrapper ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`} id={id}>
            <div className="ac-ss-trigger" onClick={() => { if (!disabled) setOpen(o => !o); }}>
                <span className={`ac-ss-value ${!selectedLabel ? 'placeholder' : ''}`}>
                    {selectedLabel || placeholder}
                </span>
                <svg className={`ac-ss-arrow ${open ? 'rotated' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {open && (
                <div className="ac-ss-dropdown">
                    <div className="ac-ss-search-wrap">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input ref={inputRef} className="ac-ss-search" placeholder="Search..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Escape') { setOpen(false); setSearch(''); }
                                if (e.key === 'Enter' && filtered.length > 0) { onChange(filtered[0].id); setOpen(false); setSearch(''); }
                            }}
                        />
                    </div>
                    <div className="ac-ss-options">
                        <div className={`ac-ss-option ${!value ? 'selected' : ''}`} onClick={() => { onChange(''); setOpen(false); setSearch(''); }}>{placeholder}</div>
                        {filtered.length === 0
                            ? <div className="ac-ss-no-results">No results found</div>
                            : filtered.map(o => (
                                <div key={o.id}
                                    className={`ac-ss-option ${String(value) === String(o.id) ? 'selected' : ''}`}
                                    onClick={() => { onChange(o.id); setOpen(false); setSearch(''); }}
                                >
                                    {o.label || o.name}
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Formatted Amount Input ─────────
function AmountInput({ id, name, value, onChange, placeholder, disabled, required }) {
    const [display, setDisplay] = useState('');

    useEffect(() => {
        if (!value || value === 0) { setDisplay(''); return; }
        setDisplay(Number(value).toLocaleString('de-DE'));
    }, [value]);

    const handleInput = (e) => {
        const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
        setDisplay(raw === '' ? '' : parseInt(raw, 10).toLocaleString('de-DE'));
        onChange(name, raw === '' ? 0 : Number(raw));
    };

    return (
        <input id={id} type="text" inputMode="numeric" value={display}
            onChange={handleInput} placeholder={placeholder}
            disabled={disabled} required={required} autoComplete="off"
        />
    );
}

const EMOJI_LIST = [
    // Financial/Goals
    '🎯', '💰', '💵', '🏦', '💳', '📈', '🐷', '🔒', '🔑', '🏆',
    // Assets/Major Purchases
    '🏠', '🏡', '🏢', '🚗', '🏍️', '🚲', '🛵', '✈️', '⛵', '🚀',
    // Devices/Tech
    '💻', '📱', '🎮', '🎧', '📷', '⌚', '📺', '🖥️', '⌨️', 'Mouse',
    // Travel/Lifestyle
    '🎒', '🌍', '🏕️', '🏖️', '⛰️', '🎡', '🎢', '🎫', '🎬', '🎨',
    // Celebrations & Gift
    '🎁', '🎈', '🎉', '💍', '🎓', '🍰', '🥂', '🍾', '🧸', '💐',
    // Health & Fitness
    '🏥', '💊', '🩺', '🏃', '🚴', '🧗', '🏋️', '🧘', '🧗', '🥊',
    // Food & Dining
    '🍔', '🍕', '☕', '🍩', '🍣', '🍦', '🍓', '🍿', '🥩', '🍜'
];

function EmojiPicker({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
            <div 
                onClick={() => { if (!disabled) setOpen(o => !o); }}
                style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: '10px',
                    padding: '9px 13px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    height: '40px',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{value || '🎯'}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Choose...</span>
                </div>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 10000,
                    width: '260px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                    padding: '12px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.05em' }}>Select Icon</div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '6px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        paddingRight: '2px'
                    }}>
                        {EMOJI_LIST.map((emo, idx) => (
                            <div 
                                key={idx}
                                onClick={() => { onChange(emo); setOpen(false); }}
                                style={{
                                    fontSize: '20px',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s, transform 0.15s',
                                    background: value === emo ? 'var(--accent-dim)' : 'transparent',
                                    border: value === emo ? '1px solid var(--accent)' : '1px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-input-focus)';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = value === emo ? 'var(--accent-dim)' : 'transparent';
                                    e.currentTarget.style.transform = 'none';
                                }}
                            >
                                {emo}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Saving Goal Modal ──────────────────────────────────────────
export default function SavingGoalModal({ isOpen, mode, data, currencies, accounts, onClose, onSave, onShowToast }) {
    const empty = {
        name: '', description: '', account_id: '', currency_id: '',
        target_amount: 0, current_amount: 0, monthly_target: 0,
        target_date: '', status: 'active', icon: '🎯', color: '#10B981',
    };

    const [formData, setFormData] = useState(empty);
    const [savingData, setSavingData] = useState({
        amount: '',
        notes: '',
        contributed_at: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors]     = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currencyOptions = currencies.map(c => ({ id: c.id, name: `${c.code} — ${c.name}` }));
    const accountOptions  = accounts.map(a => ({ id: a.id, name: a.name }));

    const isReadOnly = mode === 'show';
    const isAddSaving = mode === 'addSaving';

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setSavingData({
                amount: '',
                notes: '',
                contributed_at: new Date().toISOString().split('T')[0]
            });
            if (data && (mode === 'edit' || mode === 'show')) {
                setFormData({
                    name:           data.name || '',
                    description:    data.description || '',
                    account_id:     data.account?.id || '',
                    currency_id:    data.currency?.id || '',
                    target_amount:  data.target_amount || 0,
                    current_amount: data.current_amount || 0,
                    monthly_target: data.monthly_target || 0,
                    target_date:    data.target_date || '',
                    status:         data.status || 'active',
                    icon:           data.icon || '🎯',
                    color:          data.color || '#10B981',
                });
            } else {
                setFormData(empty);
            }
        }
    }, [isOpen, data, mode]);

    const handleFieldChange = (name, val) => {
        setFormData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    };

    const handleSavingFieldChange = (name, val) => {
        setSavingData(prev => ({ ...prev, [name]: val }));
        if (errors[name]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            let res;
            if (mode === 'create') {
                res = await axios.post(route('saving.goals.store'), formData);
            } else if (mode === 'edit') {
                res = await axios.put(route('saving.goals.update', { saving: data.id }), formData);
            } else if (mode === 'addSaving') {
                res = await axios.post(route('saving.goals.addSaving', { saving: data.id }), savingData);
            }

            if (res.data.success) {
                const msgMap = {
                    create: 'Saving goal created successfully!',
                    edit:   'Saving goal updated successfully!',
                    addSaving: 'Contribution added successfully!',
                };
                onShowToast(msgMap[mode], 'success');
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

    const titleMap = {
        create: 'Add Saving Goal',
        edit:   'Edit Saving Goal',
        show:   'Saving Goal Details',
        addSaving: 'Add Saving Contribution',
    };

    const footer = (
        <>
            <button className="bm-btn bm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
                <button className="bm-btn bm-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (<><span className="bm-spinner" /> Saving...</>) : (isAddSaving ? 'Add Saving' : 'Save Data')}
                </button>
            )}
        </>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={titleMap[mode]} size="xl" footer={footer}>
            
            {/* ── DETAIL VIEW ── */}
            {isReadOnly && (
                <table className="sg-detail-table">
                    <tbody>
                        <tr><th>Name</th><td><span style={{ fontSize: '16px', marginRight: '6px' }}>{formData.icon}</span> {formData.name}</td></tr>
                        <tr><th>Description</th><td>{formData.description || '—'}</td></tr>
                        <tr><th>Account</th><td><span className="badge info">{data?.account?.name || '—'}</span></td></tr>
                        <tr><th>Target Amount</th><td style={{ fontWeight: 600 }}>{data?.target_amount_formatted || '—'}</td></tr>
                        <tr><th>Current Saved</th><td style={{ fontWeight: 600, color: 'var(--accent)' }}>{data?.current_amount_formatted || '—'}</td></tr>
                        <tr><th>Monthly Goal</th><td>{data?.monthly_target_formatted || '—'}</td></tr>
                        <tr><th>Remaining Target</th><td>{data?.remaining_amount_formatted || '—'}</td></tr>
                        <tr><th>Target Date</th><td>{data?.target_date_formatted || '—'}</td></tr>
                        <tr>
                            <th>Progress</th>
                            <td>
                                <div className="sg-progress-wrap">
                                    <div className="sg-progress-bar">
                                        <div className="sg-progress-fill" style={{ width: `${data?.progress_bar_width || 0}%`, background: formData.color }} />
                                    </div>
                                    <span className="sg-progress-text">
                                        {data?.progress_percentage}% Saved ({data?.current_amount_formatted} of {data?.target_amount_formatted})
                                    </span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td>
                                <span className={`badge ${formData.status === 'completed' ? 'success' : formData.status === 'paused' ? 'warning' : formData.status === 'cancelled' ? 'danger' : 'info'}`}>
                                    {formData.status}
                                </span>
                            </td>
                        </tr>
                        <tr><th>Created At</th><td>{data?.created_at || '—'}</td></tr>
                        <tr><th>Last Updated</th><td>{data?.updated_at || '—'}</td></tr>
                    </tbody>
                </table>
            )}

            {/* ── CREATE / EDIT FORM ── */}
            {!isReadOnly && (
                <form className="sg-form" onSubmit={handleSubmit}>
                    
                    {/* Row 1: Name, Icon & Color */}
                    <div className="sg-row">
                        <div className="sg-group">
                            <label htmlFor="sg_name">Goal Name <span className="sg-required">*</span></label>
                            <input id="sg_name" type="text" value={formData.name}
                                onChange={e => handleFieldChange('name', e.target.value)}
                                placeholder="e.g. Buy a new Laptop" required disabled={isSubmitting}
                            />
                            {errors.name && <span className="sg-field-error">{errors.name[0]}</span>}
                        </div>
                        <div className="sg-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div className="sg-group">
                                <label>Icon (Emoji) <span className="sg-required">*</span></label>
                                <EmojiPicker 
                                    value={formData.icon} 
                                    onChange={val => handleFieldChange('icon', val)} 
                                    disabled={isSubmitting} 
                                />
                                {errors.icon && <span className="sg-field-error">{errors.icon[0]}</span>}
                            </div>
                            <div className="sg-group">
                                <label htmlFor="sg_color">Theme Color</label>
                                <div className="sg-picker-wrap">
                                    <input id="sg_color" type="color" value={formData.color}
                                        onChange={e => handleFieldChange('color', e.target.value)}
                                        style={{ width: '40px', height: '38px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                        disabled={isSubmitting}
                                    />
                                    <input type="text" value={formData.color}
                                        onChange={e => handleFieldChange('color', e.target.value)}
                                        placeholder="#10B981" maxLength={7}
                                        style={{ flex: 1 }} disabled={isSubmitting}
                                    />
                                </div>
                                {errors.color && <span className="sg-field-error">{errors.color[0]}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Account and Currency */}
                    <div className="sg-row">
                        <div className="sg-group">
                            <label htmlFor="sg_account">Source Account <span className="sg-required">*</span></label>
                            <SearchableSelect id="sg_account" options={accountOptions} value={formData.account_id}
                                onChange={val => handleFieldChange('account_id', val)} placeholder="Select account..."
                                disabled={isSubmitting}
                            />
                            {errors.account_id && <span className="sg-field-error">{errors.account_id[0]}</span>}
                        </div>
                        <div className="sg-group">
                            <label htmlFor="sg_currency">Target Currency <span className="sg-required">*</span></label>
                            <SearchableSelect id="sg_currency" options={currencyOptions} value={formData.currency_id}
                                onChange={val => handleFieldChange('currency_id', val)} placeholder="Select currency..."
                                disabled={isSubmitting}
                            />
                            {errors.currency_id && <span className="sg-field-error">{errors.currency_id[0]}</span>}
                        </div>
                    </div>

                    {/* Row 3: Target Amount, Current Amount */}
                    <div className="sg-row">
                        <div className="sg-group">
                            <label htmlFor="sg_target_amount">Target Amount <span className="sg-required">*</span></label>
                            <AmountInput id="sg_target_amount" name="target_amount" value={formData.target_amount}
                                onChange={handleFieldChange} placeholder="e.g. 15.000.000" required disabled={isSubmitting}
                            />
                            {errors.target_amount && <span className="sg-field-error">{errors.target_amount[0]}</span>}
                        </div>
                        <div className="sg-group">
                            <label htmlFor="sg_current_amount">Current Amount Saved</label>
                            <AmountInput id="sg_current_amount" name="current_amount" value={formData.current_amount}
                                onChange={handleFieldChange} placeholder="e.g. 2.500.000" disabled={isSubmitting}
                            />
                            {errors.current_amount && <span className="sg-field-error">{errors.current_amount[0]}</span>}
                        </div>
                    </div>

                    {/* Row 4: Monthly Target, Target Date */}
                    <div className="sg-row">
                        <div className="sg-group">
                            <label htmlFor="sg_monthly_target">Monthly Save Goal (Optional)</label>
                            <AmountInput id="sg_monthly_target" name="monthly_target" value={formData.monthly_target}
                                onChange={handleFieldChange} placeholder="e.g. 1.000.000" disabled={isSubmitting}
                            />
                            {errors.monthly_target && <span className="sg-field-error">{errors.monthly_target[0]}</span>}
                        </div>
                        <div className="sg-group">
                            <label htmlFor="sg_target_date">Target Date <span className="sg-required">*</span></label>
                            <CustomDatePicker id="sg_target_date" value={formData.target_date}
                                onChange={val => handleFieldChange('target_date', val)} placeholder="Select date..."
                                placement="bottom" required disabled={isSubmitting}
                            />
                            {errors.target_date && <span className="sg-field-error">{errors.target_date[0]}</span>}
                        </div>
                    </div>

                    {/* Row 5: Status (only shown on Edit) */}
                    {mode === 'edit' && (
                        <div className="sg-group">
                            <label>Goal Status</label>
                            <div className="sg-status-group">
                                {['active', 'paused', 'completed', 'cancelled'].map(st => (
                                    <label key={st} className={`sg-status-option ${formData.status === st ? 'active' : ''} status-${st}`}>
                                        <input type="radio" name="status" value={st} checked={formData.status === st}
                                            onChange={() => handleFieldChange('status', st)} className="sg-status-input"
                                        />
                                        <span className="sg-status-dot" />
                                        {st.charAt(0).toUpperCase() + st.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Row 6: Description */}
                    <div className="sg-group">
                        <label htmlFor="sg_desc">Goal Description</label>
                        <textarea id="sg_desc" rows="3" value={formData.description}
                            onChange={e => handleFieldChange('description', e.target.value)}
                            placeholder="Add brief details about this saving goal..." disabled={isSubmitting}
                        />
                        {errors.description && <span className="sg-field-error">{errors.description[0]}</span>}
                    </div>

                </form>
            )}

            {/* ── ADD SAVING FORM ── */}
            {isAddSaving && (
                <form className="sg-form" onSubmit={handleSubmit}>
                    <div style={{
                        background: 'var(--accent-dim)',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '10px',
                        padding: '14px 18px',
                        marginBottom: '20px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        lineHeight: 1.5
                    }}>
                        Adding saving contribution to <strong>{data?.name}</strong> — Target: <strong>{data?.target_amount_formatted}</strong>
                    </div>

                    <div className="sg-row">
                        <div className="sg-group">
                            <label htmlFor="sav_amount">Saving Amount <span className="sg-required">*</span></label>
                            <AmountInput 
                                id="sav_amount" 
                                name="amount" 
                                value={savingData.amount}
                                onChange={handleSavingFieldChange} 
                                placeholder="e.g. 1.000.000" 
                                required 
                                disabled={isSubmitting}
                            />
                            {errors.amount && <span className="sg-field-error">{errors.amount[0]}</span>}
                        </div>
                        <div className="sg-group">
                            <label htmlFor="sav_date">Saving Date <span className="sg-required">*</span></label>
                            <CustomDatePicker 
                                id="sav_date" 
                                value={savingData.contributed_at}
                                onChange={val => handleSavingFieldChange('contributed_at', val)} 
                                disabled={isSubmitting}
                                required
                            />
                            {errors.contributed_at && <span className="sg-field-error">{errors.contributed_at[0]}</span>}
                        </div>
                    </div>

                    <div className="sg-group">
                        <label htmlFor="sav_notes">Notes / Remarks</label>
                        <textarea 
                            id="sav_notes" 
                            rows="3" 
                            value={savingData.notes}
                            onChange={e => handleSavingFieldChange('notes', e.target.value)} 
                            placeholder="Add any details about this saving contribution..." 
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--bg-card-border)',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                color: 'var(--text-primary)',
                                fontSize: '13.5px',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }}
                        />
                        {errors.notes && <span className="sg-field-error">{errors.notes[0]}</span>}
                    </div>
                </form>
            )}

        </BaseModal>
    );
}
