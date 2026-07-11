import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import CustomDatePicker from './CustomDatePicker';
import axios from 'axios';

// ── Searchable Select (reuse same pattern as AccountModal) ─────────
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

// ── Formatted Amount Input ─────────────────────────────────────────
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

// ── Main Budget Modal ──────────────────────────────────────────────
export default function BudgetModal({ isOpen, mode, data, currencies, periods, categories, onClose, onSave, onShowToast, onShowExpenses }) {
    const empty = {
        name: '', currency_id: '', period: '', start_date: '', end_date: '',
        total_amount: 0, rollover_unused: 0, notes: '', is_active: 1,
    };
    const [formData, setFormData] = useState(empty);
    const [errors, setErrors]     = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Expenses sub-modal state
    const [expenseData, setExpenseData] = useState({
        category_id: '', spent_date: '', allocated_amount: 0, spent_amount: 0, notes: '',
    });

    const currencyOptions = currencies.map(c => ({ id: c.id, name: `${c.code} — ${c.name}` }));
    const periodOptions   = periods.map(p => ({ id: p, name: p.charAt(0).toUpperCase() + p.slice(1) }));
    const categoryOptions = categories.map(c => ({ id: c.id, name: `${c.icon || ''} ${c.name}`.trim() }));

    const isReadOnly   = mode === 'show';
    const isAddExpense = mode === 'addExpense';

    useEffect(() => {
        if (!isOpen) return;
        setErrors({});
        setIsSubmitting(false);

        if (mode === 'create') {
            setFormData(empty);
        } else if (data) {
            setFormData({
                name:            data.name || '',
                currency_id:     data.currency?.id || '',
                period:          data.period?.toLowerCase() || '',
                start_date:      data.start_date || '',
                end_date:        data.end_date   || '',
                total_amount:    data.total_amount !== undefined ? Number(data.total_amount) : 0,
                rollover_unused: data.rollover_unused ? 1 : 0,
                notes:           data.notes || '',
                is_active:       data.is_active !== undefined ? Number(data.is_active) : 1,
            });
            if (mode === 'addExpense') {
                setExpenseData({ category_id: '', spent_date: new Date().toISOString().slice(0, 10), allocated_amount: 0, spent_amount: 0, notes: '' });
            }
        }
    }, [isOpen, mode, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleAmountChange = (name, num) => {
        setFormData(prev => ({ ...prev, [name]: num }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleExpenseAmountChange = (name, num) => {
        setExpenseData(prev => ({ ...prev, [name]: num }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (isReadOnly) return;
        setIsSubmitting(true);
        setErrors({});

        try {
            let res;
            if (mode === 'create') {
                res = await axios.post(route('budget.store'), formData);
            } else if (mode === 'edit') {
                res = await axios.put(route('budget.update', { budget: data.id }), formData);
            } else if (mode === 'addExpense') {
                res = await axios.put(route('budget.storeExpenses', { budget: data.id }), expenseData);
            }

            if (res.data.success) {
                const msgMap = {
                    create: 'Budget created successfully!',
                    edit:   'Budget updated successfully!',
                    addExpense: 'Expense added successfully!',
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
        create:     'Add Budget',
        edit:       'Edit Budget',
        show:       'Budget Details',
        addExpense: 'Add Expense',
    };

    const footer = (
        <>
            {isReadOnly && (
                <button 
                    type="button"
                    className="bm-btn bm-btn-primary" 
                    onClick={() => onShowExpenses(data)}
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    Rincian Expense
                </button>
            )}
            <button className="bm-btn bm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
                <button className="bm-btn bm-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (<><span className="bm-spinner" /> Saving...</>) : (isAddExpense ? 'Add Expense' : 'Save Data')}
                </button>
            )}
        </>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={titleMap[mode]} size="xl" footer={footer}>

            {/* ── DETAIL VIEW ── */}
            {isReadOnly && (
                <table className="bg-detail-table">
                    <tbody>
                        <tr><th>Name</th><td>{data?.name || '—'}</td></tr>
                        <tr><th>Period</th><td>{data?.period || '—'}</td></tr>
                        <tr><th>Date Range</th><td>{data?.date_range_formatted || '—'}</td></tr>
                        <tr><th>Total Budget</th><td style={{ fontWeight: 600 }}>{data?.total_amount_formatted || '—'}</td></tr>
                        <tr>
                            <th>Progress</th>
                            <td>
                                <div className="bg-progress-wrap">
                                    <div className="bg-progress-bar">
                                        <div className={`bg-progress-fill ${data?.status === 'over_budget' ? 'error' : data?.status === 'near_limit' ? 'warning' : ''}`}
                                            style={{ width: `${data?.progress_bar_width || 0}%` }} />
                                    </div>
                                    <span className={`bg-progress-text ${data?.status === 'over_budget' ? 'text-error' : data?.status === 'near_limit' ? 'text-warning' : ''}`}>
                                        {data?.spent_amount_formatted} of {data?.total_amount_formatted} ({Math.round(data?.progress_percentage_normalized || 0)}%)
                                    </span>
                                </div>
                            </td>
                        </tr>
                        <tr><th>Rollover Unused</th><td>{data?.rollover_unused ? 'Yes' : 'No'}</td></tr>
                        <tr><th>Notes</th><td>{data?.notes || '—'}</td></tr>
                        <tr><th>Created At</th><td>{data?.created_at || '—'}</td></tr>
                        <tr><th>Last Updated</th><td>{data?.updated_at || '—'}</td></tr>
                        <tr>
                            <th>Action</th>
                            <td>
                                <button 
                                    type="button" 
                                    className="bm-btn bm-btn-secondary" 
                                    style={{ 
                                        padding: '6px 14px', 
                                        fontSize: '12.5px', 
                                        border: '1px solid var(--bg-card-border)', 
                                        background: 'var(--bg-input)', 
                                        color: 'var(--accent)', 
                                        borderRadius: '8px', 
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => onShowExpenses(data)}
                                >
                                    Lihat Rincian Expense
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}

            {/* ── ADD EXPENSE FORM ── */}
            {isAddExpense && (
                <form className="bg-form" onSubmit={handleSubmit}>
                    <div className="bg-expenses-hint">
                        Adding expense to <strong>{data?.name}</strong> — Budget: {data?.total_amount_formatted}
                    </div>

                    <div className="bg-group">
                        <label htmlFor="expCategory">Category <span className="bg-required">*</span></label>
                        <SearchableSelect
                            id="expCategory"
                            options={categoryOptions}
                            value={expenseData.category_id}
                            onChange={(val) => {
                                setExpenseData(prev => ({ ...prev, category_id: val }));
                                if (errors.category_id) setErrors(prev => ({ ...prev, category_id: null }));
                            }}
                            placeholder="Select Category"
                            disabled={isSubmitting}
                        />
                        {errors.category_id && <span className="bg-field-error">{errors.category_id[0]}</span>}
                    </div>

                    <div className="bg-group">
                        <label htmlFor="expDate">Spent Date <span className="bg-required">*</span></label>
                        <CustomDatePicker
                            id="expDate"
                            value={expenseData.spent_date}
                            onChange={(val) => {
                                setExpenseData(prev => ({ ...prev, spent_date: val }));
                                if (errors.spent_date) setErrors(prev => ({ ...prev, spent_date: null }));
                            }}
                            disabled={isSubmitting}
                            required
                        />
                        {errors.spent_date && <span className="bg-field-error">{errors.spent_date[0]}</span>}
                    </div>

                    <div className="bg-row">
                        <div className="bg-group">
                            <label htmlFor="expAllocated">Allocated Amount <span className="bg-required">*</span></label>
                            <AmountInput id="expAllocated" name="allocated_amount"
                                value={expenseData.allocated_amount}
                                onChange={handleExpenseAmountChange}
                                placeholder="0" required disabled={isSubmitting}
                            />
                            {errors.allocated_amount && <span className="bg-field-error">{errors.allocated_amount[0]}</span>}
                        </div>
                        <div className="bg-group">
                            <label htmlFor="expSpent">Spent Amount</label>
                            <AmountInput id="expSpent" name="spent_amount"
                                value={expenseData.spent_amount}
                                onChange={handleExpenseAmountChange}
                                placeholder="0" disabled={isSubmitting}
                            />
                            {errors.spent_amount && <span className="bg-field-error">{errors.spent_amount[0]}</span>}
                        </div>
                    </div>

                    <div className="bg-group">
                        <label htmlFor="expNotes">Notes</label>
                        <textarea id="expNotes" name="notes"
                            value={expenseData.notes} onChange={handleExpenseChange}
                            placeholder="Optional notes" rows="2"
                            disabled={isSubmitting}
                        />
                        {errors.notes && <span className="bg-field-error">{errors.notes[0]}</span>}
                    </div>
                </form>
            )}

            {/* ── CREATE / EDIT FORM ── */}
            {!isReadOnly && !isAddExpense && (
                <form className="bg-form" onSubmit={handleSubmit}>
                    <div className="bg-group">
                        <label htmlFor="budgetName">Budget Name <span className="bg-required">*</span></label>
                        <input id="budgetName" name="name" type="text"
                            value={formData.name} onChange={handleChange}
                            placeholder="e.g., Monthly Expenses"
                            required disabled={isSubmitting}
                        />
                        {errors.name && <span className="bg-field-error">{errors.name[0]}</span>}
                    </div>

                    <div className="bg-row">
                        <div className="bg-group">
                            <label htmlFor="budgetPeriod">Period <span className="bg-required">*</span></label>
                            <SearchableSelect
                                id="budgetPeriod"
                                options={periodOptions}
                                value={formData.period}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, period: val }));
                                    if (errors.period) setErrors(prev => ({ ...prev, period: null }));
                                }}
                                placeholder="Select Period"
                                disabled={isSubmitting}
                            />
                            {errors.period && <span className="bg-field-error">{errors.period[0]}</span>}
                        </div>
                        <div className="bg-group">
                            <label htmlFor="budgetCurrency">Currency <span className="bg-required">*</span></label>
                            <SearchableSelect
                                id="budgetCurrency"
                                options={currencyOptions}
                                value={formData.currency_id}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, currency_id: val }));
                                    if (errors.currency_id) setErrors(prev => ({ ...prev, currency_id: null }));
                                }}
                                placeholder="Select Currency"
                                disabled={isSubmitting}
                            />
                            {errors.currency_id && <span className="bg-field-error">{errors.currency_id[0]}</span>}
                        </div>
                    </div>

                    <div className="bg-row">
                        <div className="bg-group">
                            <label htmlFor="budgetStart">Start Date <span className="bg-required">*</span></label>
                            <CustomDatePicker
                                id="budgetStart"
                                value={formData.start_date}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, start_date: val }));
                                    if (errors.start_date) setErrors(prev => ({ ...prev, start_date: null }));
                                }}
                                disabled={isSubmitting}
                                required
                            />
                            {errors.start_date && <span className="bg-field-error">{errors.start_date[0]}</span>}
                        </div>
                        <div className="bg-group">
                            <label htmlFor="budgetEnd">End Date <span className="bg-required">*</span></label>
                            <CustomDatePicker
                                id="budgetEnd"
                                value={formData.end_date}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, end_date: val }));
                                    if (errors.end_date) setErrors(prev => ({ ...prev, end_date: null }));
                                }}
                                disabled={isSubmitting}
                                required
                            />
                            {errors.end_date && <span className="bg-field-error">{errors.end_date[0]}</span>}
                        </div>
                    </div>

                    <div className="bg-group">
                        <label htmlFor="budgetTotal">Total Budget Amount <span className="bg-required">*</span></label>
                        <AmountInput id="budgetTotal" name="total_amount"
                            value={formData.total_amount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            required disabled={isSubmitting}
                        />
                        {errors.total_amount && <span className="bg-field-error">{errors.total_amount[0]}</span>}
                    </div>

                    {/* Status (Edit only) */}
                    {mode === 'edit' && (
                        <div className="bg-group">
                            <label>Status <span className="bg-required">*</span></label>
                            <div className="bg-radio-group">
                                <label className={`bg-radio-option ${Number(formData.is_active) === 1 ? 'active-active' : ''} ${isSubmitting ? 'disabled' : ''}`}>
                                    <input type="radio" name="is_active" value="1"
                                        checked={Number(formData.is_active) === 1}
                                        onChange={() => { if (!isSubmitting) setFormData(p => ({ ...p, is_active: 1 })); }}
                                        className="bg-radio-input" disabled={isSubmitting}
                                    />
                                    <span className="bg-radio-dot" />
                                    <span>Active</span>
                                </label>
                                <label className={`bg-radio-option ${Number(formData.is_active) === 0 ? 'active-inactive' : ''} ${isSubmitting ? 'disabled' : ''}`}>
                                    <input type="radio" name="is_active" value="0"
                                        checked={Number(formData.is_active) === 0}
                                        onChange={() => { if (!isSubmitting) setFormData(p => ({ ...p, is_active: 0 })); }}
                                        className="bg-radio-input" disabled={isSubmitting}
                                    />
                                    <span className="bg-radio-dot" />
                                    <span>Inactive</span>
                                </label>
                            </div>
                            {errors.is_active && <span className="bg-field-error">{errors.is_active[0]}</span>}
                        </div>
                    )}

                    <div className="bg-group">
                        <div className="bg-checkbox-group">
                            <input id="budgetRollover" name="rollover_unused" type="checkbox"
                                checked={Number(formData.rollover_unused) === 1}
                                onChange={(e) => setFormData(p => ({ ...p, rollover_unused: e.target.checked ? 1 : 0 }))}
                                disabled={isSubmitting}
                            />
                            <label htmlFor="budgetRollover">Rollover unused budget to next period</label>
                        </div>
                    </div>

                    <div className="bg-group">
                        <label htmlFor="budgetNotes">Notes</label>
                        <textarea id="budgetNotes" name="notes"
                            value={formData.notes} onChange={handleChange}
                            placeholder="Optional notes about this budget" rows="3"
                            disabled={isSubmitting}
                        />
                        {errors.notes && <span className="bg-field-error">{errors.notes[0]}</span>}
                    </div>
                </form>
            )}
        </BaseModal>
    );
}
