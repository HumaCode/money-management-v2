import React, { useState, useEffect } from 'react';
import { X, Shield, Palette } from 'lucide-react';

export default function RoleModal({ isOpen, onClose, onSave, mode = 'create', roleData = null }) {
    const [name, setName]                 = useState('');
    const [slug, setSlug]                 = useState('');
    const [color, setColor]               = useState('#3b82f6');
    const [description, setDescription]   = useState('');
    const [isActive, setIsActive]         = useState('1');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors]             = useState({});

    const colorPalette = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'];

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && roleData) {
                setName(roleData.name || '');
                setSlug(roleData.slug || '');
                setColor(roleData.color || '#3b82f6');
                setDescription(roleData.description || '');
                setIsActive(roleData.is_active ? '1' : '0');
            } else {
                setName('');
                setSlug('');
                setColor('#3b82f6');
                setDescription('');
                setIsActive('1');
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, mode, roleData]);

    if (!isOpen) return null;

    const handleNameChange = (val) => {
        setName(val);
        if (mode === 'create') {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formData = {
            name,
            slug,
            color,
            description,
            is_active: isActive === '1',
        };

        try {
            await onSave(formData, roleData?.id);
            onClose();
        } catch (err) {
            if (err.response && err.response.status === 422 && err.response.data.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop show" style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            background: 'rgba(10, 14, 26, 0.78)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="modal-dialog" style={{
                background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px', width: '100%', maxWidth: '480px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: `${color}20`, color: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f2f5', margin: 0 }}>
                                {mode === 'create' ? 'Create Custom Role' : 'Edit Role Info'}
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                                Define role identity and visual tag color
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>ROLE NAME</label>
                            <input
                                type="text"
                                placeholder="e.g. Manager Keuangan"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.04)', border: errors.name ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                }}
                                required
                            />
                            {errors.name && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{errors.name[0]}</span>}
                        </div>

                        {/* Slug */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>SLUG KEY</label>
                            <input
                                type="text"
                                placeholder="e.g. manager-keuangan"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.04)', border: errors.slug ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                }}
                                required
                            />
                            {errors.slug && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{errors.slug[0]}</span>}
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>TAG COLOR</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                {colorPalette.map((c) => (
                                    <button
                                        type="button"
                                        key={c}
                                        onClick={() => setColor(c)}
                                        style={{
                                            width: '28px', height: '28px', borderRadius: '50%', background: c,
                                            border: color === c ? '2px solid #ffffff' : 'none',
                                            transform: color === c ? 'scale(1.15)' : 'scale(1)',
                                            cursor: 'pointer', transition: 'transform 0.15s ease'
                                        }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>DESCRIPTION</label>
                            <textarea
                                rows={3}
                                placeholder="Short explanation of role responsibility"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem', resize: 'none'
                                }}
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>ROLE STATUS</label>
                            <select
                                value={isActive}
                                onChange={(e) => setIsActive(e.target.value)}
                                style={{
                                    width: '100%', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                }}
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1rem 1.5rem', background: '#182234', borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem'
                    }}>
                        <button type="button" onClick={onClose} style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af',
                            borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.85rem', cursor: 'pointer'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} style={{
                            background: '#7dd3a8', border: 'none', color: '#0a0e1a', fontWeight: 600,
                            borderRadius: '10px', padding: '0.6rem 1.4rem', fontSize: '0.85rem', cursor: 'pointer',
                            opacity: isSubmitting ? 0.7 : 1
                        }}>
                            {isSubmitting ? 'Saving...' : 'Save Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
