import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    const [animateShow, setAnimateShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
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
            // Trigger animation
            const timer = setTimeout(() => setAnimateShow(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateShow(false);
        }
    }, [isOpen, mode, data]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear validation error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleColorChange = (e) => {
        setFormData(prev => ({
            ...prev,
            color: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'show') return;

        setIsSubmitting(true);
        setErrors({});

        try {
            let response;
            if (mode === 'create') {
                response = await axios.post(route('category.store'), formData);
            } else {
                response = await axios.put(route('category.update', { category: data.id }), formData);
            }

            if (response.data.success) {
                onShowToast(
                    mode === 'create' ? 'Category created successfully!' : 'Category updated successfully!',
                    'success'
                );
                onSave();
                handleClose();
            } else {
                onShowToast(response.data.message || 'Something went wrong', 'error');
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
                onShowToast('Please check your inputs', 'error');
            } else {
                onShowToast(error.response?.data?.message || 'Server error occurred', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setAnimateShow(false);
        setTimeout(onClose, 300);
    };

    const isReadOnly = mode === 'show';

    // Filter parent categories to only show ones matching selected type and exclude current category being edited to prevent circular parenting
    const filteredParents = parentCategories.filter(cat => 
        cat.type === formData.type && (!data || cat.id !== data.id)
    );

    return (
        <div 
            className={`category-modal-overlay ${animateShow ? 'show' : ''}`}
            onClick={handleClose}
        >
            <style>{`
                .category-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(8, 10, 18, 0.6);
                    backdrop-filter: blur(0px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999;
                    opacity: 0;
                    transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
                }
                .category-modal-overlay.show {
                    opacity: 1;
                    backdrop-filter: blur(10px);
                }
                .category-modal-card {
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 20px;
                    width: 90%;
                    max-width: 520px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
                    transform: scale(0.95) translateY(15px);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .category-modal-overlay.show .category-modal-card {
                    transform: scale(1) translateY(0);
                }
                .category-modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--bg-card-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .category-modal-header h3 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }
                .category-modal-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    transition: background 0.2s, color 0.2s;
                }
                .category-modal-close:hover {
                    background: var(--bg-input-focus);
                    color: var(--text-primary);
                }
                .category-modal-body {
                    padding: 24px;
                    max-height: 75vh;
                    overflow-y: auto;
                }
                .category-modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .category-form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                @media (max-width: 480px) {
                    .category-form-row {
                        grid-template-columns: 1fr;
                    }
                }
                .category-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .category-form-group label {
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .category-form-group input, 
                .category-form-group select, 
                .category-form-group textarea {
                    background: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 10px;
                    padding: 10px 14px;
                    color: var(--text-primary);
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .category-form-group input:focus, 
                .category-form-group select:focus, 
                .category-form-group textarea:focus {
                    outline: none;
                    border-color: var(--accent);
                    background: var(--bg-input-focus);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }
                .category-form-group input:disabled, 
                .category-form-group select:disabled, 
                .category-form-group textarea:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .color-selector-wrapper {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .color-picker-input {
                    padding: 0 !important;
                    width: 42px !important;
                    height: 42px !important;
                    border-radius: 8px !important;
                    cursor: pointer;
                    border: 1px solid var(--bg-card-border) !important;
                }
                .color-hex-text {
                    flex: 1;
                    background: var(--bg-input) !important;
                    text-align: center;
                    font-weight: 500;
                }
                .field-error {
                    font-size: 12px;
                    color: var(--error);
                    margin-top: 4px;
                    font-weight: 500;
                }
                .category-modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid var(--bg-card-border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    background: rgba(0, 0, 0, 0.05);
                }
                html.light .category-modal-footer {
                    background: rgba(0, 0, 0, 0.02);
                }
                .btn-modal-cancel {
                    background: transparent;
                    border: 1px solid var(--bg-card-border);
                    color: var(--text-primary);
                    padding: 10px 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                    transition: background 0.2s;
                }
                .btn-modal-cancel:hover:not(:disabled) {
                    background: var(--bg-input-focus);
                }
                .btn-modal-submit {
                    background: var(--accent);
                    color: #0a0e1a;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    box-shadow: 0 4px 12px var(--accent-glow);
                    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-modal-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px var(--accent-glow);
                }
                .btn-modal-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .btn-modal-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(10, 14, 26, 0.2);
                    border-top: 2px solid #0a0e1a;
                    border-radius: 50%;
                    animation: modal-spin 0.8s linear infinite;
                    display: inline-block;
                }
                @keyframes modal-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .show-detail-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .show-detail-table th, .show-detail-table td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid var(--bg-card-border);
                }
                .show-detail-table th {
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 13px;
                    width: 35%;
                }
                .show-detail-table td {
                    color: var(--text-primary);
                    font-size: 14px;
                }
            `}</style>

            <div 
                className="category-modal-card"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="category-modal-header">
                    <h3>
                        {mode === 'create' && 'Add Category'}
                        {mode === 'edit' && 'Edit Category'}
                        {mode === 'show' && 'Category Details'}
                    </h3>
                    <button className="category-modal-close" onClick={handleClose}>&times;</button>
                </div>

                <div className="category-modal-body">
                    {isReadOnly ? (
                        <table className="show-detail-table">
                            <tbody>
                                <tr>
                                    <th>Category Name</th>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                background: data.color ? data.color + '26' : 'rgba(125,211,168,0.15)',
                                                color: data.color || 'var(--accent)',
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px'
                                            }}>
                                                {data.icon || '—'}
                                            </span>
                                            {data.name}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Type</th>
                                    <td>
                                        <span className={`badge ${data.type}`} style={{ textTransform: 'capitalize' }}>
                                            {data.type}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Parent</th>
                                    <td>{data.parent?.name || 'None (Main Category)'}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td>
                                        <span className={`badge ${data.is_active ? 'success' : 'danger'}`}>
                                            {data.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Description</th>
                                    <td style={{ whiteSpace: 'pre-wrap' }}>{data.description || '—'}</td>
                                </tr>
                                <tr>
                                    <th>Created At</th>
                                    <td>{data.created_at || '—'}</td>
                                </tr>
                                <tr>
                                    <th>Last Updated</th>
                                    <td>{data.updated_at || '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <form className="category-modal-form" onSubmit={handleSubmit}>
                            <div className="category-form-group">
                                <label htmlFor="name">Category Name <span style={{ color: 'var(--error)' }}>*</span></label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange}
                                    placeholder="e.g., Food & Dining" 
                                    required 
                                    disabled={isSubmitting}
                                />
                                {errors.name && <span className="field-error">{errors.name[0]}</span>}
                            </div>

                            <div className="category-form-row">
                                <div className="category-form-group">
                                    <label htmlFor="type">Type <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <select 
                                        id="type" 
                                        name="type" 
                                        value={formData.type} 
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                    {errors.type && <span className="field-error">{errors.type[0]}</span>}
                                </div>

                                <div className="category-form-group">
                                    <label htmlFor="parent_id">Parent Category</label>
                                    <select 
                                        id="parent_id" 
                                        name="parent_id" 
                                        value={formData.parent_id} 
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">None (Main Category)</option>
                                        {filteredParents.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <span className="field-error">{errors.parent_id[0]}</span>}
                                </div>
                            </div>

                            <div className="category-form-row">
                                <div className="category-form-group">
                                    <label htmlFor="icon">Icon Emoji</label>
                                    <input 
                                        type="text" 
                                        id="icon" 
                                        name="icon" 
                                        value={formData.icon} 
                                        onChange={handleChange}
                                        placeholder="🍔" 
                                        maxLength="10"
                                        disabled={isSubmitting}
                                    />
                                    {errors.icon && <span className="field-error">{errors.icon[0]}</span>}
                                </div>

                                <div className="category-form-group">
                                    <label htmlFor="color">Color Theme</label>
                                    <div className="color-selector-wrapper">
                                        <input 
                                            type="color" 
                                            id="color" 
                                            className="color-picker-input"
                                            value={formData.color} 
                                            onChange={handleColorChange}
                                            disabled={isSubmitting}
                                        />
                                        <input 
                                            type="text" 
                                            className="color-hex-text"
                                            value={formData.color} 
                                            readOnly 
                                        />
                                    </div>
                                    {errors.color && <span className="field-error">{errors.color[0]}</span>}
                                </div>
                            </div>

                            {mode === 'edit' && (
                                <div className="category-form-group">
                                    <label htmlFor="is_active">Status <span style={{ color: 'var(--error)' }}>*</span></label>
                                    <select 
                                        id="is_active" 
                                        name="is_active" 
                                        value={formData.is_active} 
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                    {errors.is_active && <span className="field-error">{errors.is_active[0]}</span>}
                                </div>
                            )}

                            <div className="category-form-group">
                                <label htmlFor="description">Description</label>
                                <textarea 
                                    id="description" 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange}
                                    placeholder="Optional description..."
                                    rows="3"
                                    disabled={isSubmitting}
                                />
                                {errors.description && <span className="field-error">{errors.description[0]}</span>}
                            </div>
                        </form>
                    )}
                </div>

                <div className="category-modal-footer">
                    <button 
                        className="btn-modal-cancel" 
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        {isReadOnly ? 'Close' : 'Cancel'}
                    </button>
                    {!isReadOnly && (
                        <button 
                            className="btn-modal-submit" 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="btn-modal-spinner"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Data'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
