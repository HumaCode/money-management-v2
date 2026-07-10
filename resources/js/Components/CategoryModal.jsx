import React, { useState, useEffect, useRef } from 'react';
import BaseModal from './BaseModal';
import axios from 'axios';

const POPULAR_EMOJIS = [
    // Finance/Business
    '💰', '💵', '💳', '🪙', '💸', '📈', '📉', '📊', '🏦', '💎',
    // Food/Drink
    '🍔', '🍕', '🍜', '🍣', '☕', '🥤', '🍰', '🍎', '🥦', '🍻',
    // Shopping/Lifestyle
    '🛍️', '🛒', '👕', '👠', '💄', '🎁', '🧸', '💐', '🏠', '🔑',
    // Transport & Travel
    '🚗', '🛵', '🚲', '🚌', '✈️', '🚂', '⛽', '🏨', '🗺️', '🧳',
    // Bills & Utilities
    '🔌', '💧', '📶', '📱', '✉️', '📦', '🏢', '🛠️', '🧹', '📅',
    // Entertainment & Health
    '🎮', '🎬', '🎤', '🎧', '⚽', '🏋️', '🎫', '🎰', '🎨', '📚',
    // Medical & Other
    '💊', '🩺', '🏥', '🦷', '🧴', '💆', '🥗', '💼', '🎓', '👶',
    // Animals & Emotions
    '🐾', '⚡', '🍀', '⚙️', '🔒', '❤️', '🌟', '🔔', '🔥', '✨'
];

export default function CategoryModal({ isOpen, mode, data, parentCategories, onClose, onSave, onShowToast }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        parent_id: '',
        icon: '🍔',
        color: '#7dd3a8',
        is_active: 1,
        description: ''
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

    // Reset / populate form when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setErrors({});
        setIsSubmitting(false);

        if (mode === 'create') {
            setFormData({
                name: '',
                type: 'expense',
                parent_id: '',
                icon: '🍔',
                color: '#7dd3a8',
                is_active: 1,
                description: ''
            });
        } else if (data) {
            setFormData({
                name: data.name || '',
                type: data.type || 'expense',
                parent_id: data.parent?.id || '',
                icon: data.icon || '',
                color: data.color || '#7dd3a8',
                is_active: data.is_active !== undefined ? Number(data.is_active) : 1,
                description: data.description || ''
            });
        }
    }, [isOpen, mode, data]);

    const isReadOnly = mode === 'show';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                res = await axios.post(route('category.store'), formData);
            } else {
                res = await axios.put(route('category.update', { category: data.id }), formData);
            }

            if (res.data.success) {
                onShowToast(
                    mode === 'create' ? 'Category created successfully!' : 'Category updated successfully!',
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

    // Normalize parentCategories — handles plain array or {data:[]} from ResourceCollection
    const parentCatArray = Array.isArray(parentCategories)
        ? parentCategories
        : (parentCategories?.data ?? []);

    // Filter to match selected type and exclude self (prevent circular parent)
    const filteredParents = parentCatArray.filter(
        cat => cat.type === formData.type && (!data || cat.id !== data.id)
    );

    // ── Title ──
    const titleMap = { create: 'Add Category', edit: 'Edit Category', show: 'Category Details' };

    // ── Footer ──
    const footer = (
        <>
            <button className="bm-btn bm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
                <button className="bm-btn bm-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <><span className="bm-spinner" /> Saving...</>
                    ) : 'Save Data'}
                </button>
            )}
        </>
    );

    return (
        <>
            <style>{`
                /* ── CategoryModal form styles ── */
                .cm-form { display: flex; flex-direction: column; gap: 16px; }
                .cm-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                @media (max-width: 480px) { .cm-row { grid-template-columns: 1fr; } }

                .cm-group { display: flex; flex-direction: column; gap: 5px; }
                .cm-group label {
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--text-primary);
                    font-family: 'Inter', sans-serif;
                }
                .cm-group input,
                .cm-group select,
                .cm-group textarea {
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
                .cm-group input:focus,
                .cm-group select:focus,
                .cm-group textarea:focus {
                    outline: none;
                    border-color: var(--accent);
                    background: var(--bg-input-focus);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }
                .cm-group input:disabled,
                .cm-group select:disabled,
                .cm-group textarea:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }
                .cm-field-error {
                    font-size: 11.5px;
                    color: var(--error);
                    font-weight: 500;
                    margin-top: 2px;
                }
                .cm-required { color: var(--error); margin-left: 2px; }

                /* Color picker row */
                .cm-color-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .cm-color-swatch {
                    flex-shrink: 0;
                    width: 40px !important;
                    height: 40px;
                    border-radius: 9px !important;
                    padding: 0 !important;
                    cursor: pointer;
                    border: 1px solid var(--bg-card-border) !important;
                }
                .cm-color-hex {
                    flex: 1;
                    text-align: center;
                    font-weight: 500;
                    letter-spacing: 0.04em;
                }

                /* Emoji picker */
                .cm-emoji-picker-container {
                    position: relative;
                    width: 100%;
                }
                .cm-emoji-trigger {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 10px;
                    padding: 10px 14px;
                    cursor: pointer;
                    user-select: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .cm-emoji-trigger:hover {
                    border-color: var(--accent);
                    background: var(--bg-input-focus);
                }
                .cm-emoji-display {
                    font-size: 22px;
                    line-height: 1;
                }
                .cm-emoji-label {
                    font-size: 13.5px;
                    color: var(--text-secondary);
                }
                .cm-emoji-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 14px;
                    box-shadow: 
                        0 0 0 1px rgba(255,255,255,0.04) inset,
                        0 20px 40px rgba(0, 0, 0, 0.45);
                    padding: 14px;
                    z-index: 1050;
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    gap: 8px;
                    max-height: 220px;
                    overflow-y: auto;
                    backdrop-filter: blur(16px);
                }
                .cm-emoji-dropdown::-webkit-scrollbar {
                    width: 5px;
                }
                .cm-emoji-dropdown::-webkit-scrollbar-thumb {
                    background: var(--bg-card-border);
                    border-radius: 3px;
                }
                .cm-emoji-option {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.1s;
                }
                .cm-emoji-option:hover {
                    background: var(--bg-input-focus);
                    transform: scale(1.18);
                }
                .cm-emoji-option.selected {
                    background: var(--accent-dim);
                    border: 1px solid var(--accent);
                }

                /* Show / detail table */
                .cm-detail-table { width: 100%; border-collapse: collapse; }
                .cm-detail-table th, .cm-detail-table td {
                    padding: 11px 14px;
                    text-align: left;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .cm-detail-table th {
                    width: 35%;
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .cm-detail-table td {
                    font-size: 13.5px;
                    color: var(--text-primary);
                }
            `}</style>

            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title={titleMap[mode]}
                size="xl"
                footer={footer}
            >
                {isReadOnly ? (
                    /* ── Detail view ── */
                    <table className="cm-detail-table">
                        <tbody>
                            <tr>
                                <th>Name</th>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            background: data?.color ? data.color + '26' : 'rgba(125,211,168,0.15)',
                                            color: data?.color || 'var(--accent)',
                                            width: '26px', height: '26px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '14px'
                                        }}>
                                            {data?.icon || '—'}
                                        </span>
                                        {data?.name}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>Type</th>
                                <td>
                                    <span className={`badge ${data?.type}`} style={{ textTransform: 'capitalize' }}>
                                        {data?.type}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Parent</th>
                                <td>{data?.parent?.name || 'None (Main Category)'}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>
                                    <span className={`badge ${data?.is_active ? 'success' : 'danger'}`}>
                                        {data?.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td style={{ whiteSpace: 'pre-wrap' }}>{data?.description || '—'}</td>
                            </tr>
                            <tr>
                                <th>Created At</th>
                                <td>{data?.created_at || '—'}</td>
                            </tr>
                            <tr>
                                <th>Updated At</th>
                                <td>{data?.updated_at || '—'}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    /* ── Create / Edit form ── */
                    <form className="cm-form" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="cm-group">
                            <label htmlFor="name">
                                Category Name <span className="cm-required">*</span>
                            </label>
                            <input
                                id="name" name="name" type="text"
                                value={formData.name} onChange={handleChange}
                                placeholder="e.g. Food & Dining"
                                required disabled={isSubmitting}
                            />
                            {errors.name && <span className="cm-field-error">{errors.name[0]}</span>}
                        </div>

                        {/* Type + Parent */}
                        <div className="cm-row">
                            <div className="cm-group">
                                <label htmlFor="type">
                                    Type <span className="cm-required">*</span>
                                </label>
                                <select id="type" name="type" value={formData.type} onChange={handleChange} required disabled={isSubmitting}>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                                {errors.type && <span className="cm-field-error">{errors.type[0]}</span>}
                            </div>
                            <div className="cm-group">
                                <label htmlFor="parent_id">Parent Category</label>
                                <select id="parent_id" name="parent_id" value={formData.parent_id} onChange={handleChange} disabled={isSubmitting}>
                                    <option value="">None (Main Category)</option>
                                    {filteredParents.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                                {errors.parent_id && <span className="cm-field-error">{errors.parent_id[0]}</span>}
                            </div>
                        </div>

                        {/* Icon + Color */}
                        <div className="cm-row">
                            <div className="cm-group" ref={emojiPickerRef}>
                                <label htmlFor="icon">Icon Emoji</label>
                                <div className="cm-emoji-picker-container">
                                    <div 
                                        className="cm-emoji-trigger" 
                                        onClick={() => !isSubmitting && setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <span className="cm-emoji-display">{formData.icon || '🍔'}</span>
                                        <span className="cm-emoji-label">Click to select emoji</span>
                                    </div>
                                    
                                    {showEmojiPicker && (
                                        <div className="cm-emoji-dropdown">
                                            {POPULAR_EMOJIS.map(emoji => (
                                                <div 
                                                    key={emoji}
                                                    className={`cm-emoji-option ${formData.icon === emoji ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, icon: emoji }));
                                                        setShowEmojiPicker(false);
                                                        if (errors.icon) setErrors(prev => ({ ...prev, icon: null }));
                                                    }}
                                                >
                                                    {emoji}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.icon && <span className="cm-field-error">{errors.icon[0]}</span>}
                            </div>
                            <div className="cm-group">
                                <label htmlFor="color">Color Theme</label>
                                <div className="cm-color-row">
                                    <input type="color" className="cm-color-swatch"
                                        id="color" value={formData.color}
                                        onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                        disabled={isSubmitting}
                                    />
                                    <input type="text" className="cm-color-hex"
                                        value={formData.color} readOnly
                                    />
                                </div>
                                {errors.color && <span className="cm-field-error">{errors.color[0]}</span>}
                            </div>
                        </div>

                        {/* Status (edit only) */}
                        {mode === 'edit' && (
                            <div className="cm-group">
                                <label htmlFor="is_active">
                                    Status <span className="cm-required">*</span>
                                </label>
                                <select id="is_active" name="is_active" value={formData.is_active} onChange={handleChange} required disabled={isSubmitting}>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                {errors.is_active && <span className="cm-field-error">{errors.is_active[0]}</span>}
                            </div>
                        )}

                        {/* Description */}
                        <div className="cm-group">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description"
                                value={formData.description} onChange={handleChange}
                                placeholder="Optional description..." rows="3"
                                disabled={isSubmitting}
                            />
                            {errors.description && <span className="cm-field-error">{errors.description[0]}</span>}
                        </div>
                    </form>
                )}
            </BaseModal>
        </>
    );
}
