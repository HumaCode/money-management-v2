import React, { useState } from 'react';
import { Eye, X, UserCheck, CheckCircle, XCircle, Mail, User as UserIcon, Phone, Shield, Calendar, Clock } from 'lucide-react';

export default function UserModal({ isOpen, onClose, onSave, mode = 'create', userData = null, roles = [] }) {
    const [name, setName]                 = useState('');
    const [username, setUsername]         = useState('');
    const [email, setEmail]               = useState('');
    const [phone, setPhone]               = useState('');
    const [gender, setGender]             = useState('');
    const [role, setRole]                 = useState('user');
    const [password, setPassword]         = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isActive, setIsActive]         = useState('1');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors]             = useState({});

    React.useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' || mode === 'view') {
                setName(userData?.name || '');
                setUsername(userData?.username || '');
                setEmail(userData?.email || '');
                setPhone(userData?.phone || '');
                setGender(userData?.gender || '');
                setRole(userData?.role_slug || 'user');
                setIsActive(userData?.is_active ? '1' : '0');
            } else {
                setName('');
                setUsername('');
                setEmail('');
                setPhone('');
                setGender('');
                setRole('user');
                setIsActive('1');
            }
            setPassword('');
            setPasswordConfirmation('');
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, mode, userData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formData = {
            name,
            username,
            email,
            phone: phone || null,
            gender: gender || null,
            role,
            is_active: isActive === '1',
        };

        if (password) {
            formData.password = password;
            formData.password_confirmation = passwordConfirmation;
        }

        try {
            await onSave(formData, userData?.id);
            onClose();
        } catch (err) {
            if (err.response && err.response.status === 422 && err.response.data.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Detail View (Card Profile Info, Not Input Form)
    if (mode === 'view') {
        return (
            <div className="modal-backdrop show" style={{
                position: 'fixed', inset: 0, zIndex: 1050,
                background: 'rgba(10, 14, 26, 0.78)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}>
                <div className="modal-dialog" style={{
                    background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px', width: '100%', maxWidth: '520px',
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
                                background: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Eye size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f2f5', margin: 0 }}>
                                    User Profile Details
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                                    Overview of user account information
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body Info Card */}
                    <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                        {/* Profile Header Avatar Banner */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center',
                            gap: '1rem', marginBottom: '1.25rem'
                        }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: userData?.avatar ? `url(${userData.avatar}) center/cover` : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                                color: '#7dd3a8', fontWeight: 700, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                                border: '2px solid rgba(125, 211, 168, 0.3)', flexShrink: 0
                            }}>
                                {!userData?.avatar && (userData?.name ? userData.name.charAt(0).toUpperCase() : 'U')}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f0f2f5', margin: 0 }}>
                                        {userData?.name}
                                    </h4>
                                    <span style={{
                                        padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                                        background: `${userData?.role_color || '#3b82f6'}20`,
                                        color: userData?.role_color || '#3b82f6',
                                        border: `1px solid ${userData?.role_color || '#3b82f6'}40`
                                    }}>
                                        {userData?.role_name}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '2px 0 0 0' }}>
                                    @{userData?.username}
                                </p>
                            </div>
                        </div>

                        {/* Detail Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>EMAIL ADDRESS</div>
                                <div style={{ fontSize: '0.9rem', color: '#f0f2f5', fontWeight: 500, wordBreak: 'break-all' }}>{userData?.email || '—'}</div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>ACCOUNT STATUS</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                    {userData?.is_active ? (
                                        <span style={{ color: '#7dd3a8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} /> Active
                                        </span>
                                    ) : (
                                        <span style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <XCircle size={14} /> Inactive
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>PHONE NUMBER</div>
                                <div style={{ fontSize: '0.9rem', color: '#f0f2f5', fontWeight: 500 }}>{userData?.phone || '—'}</div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>GENDER</div>
                                <div style={{ fontSize: '0.9rem', color: '#f0f2f5', fontWeight: 500, textTransform: 'capitalize' }}>{userData?.gender || '—'}</div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>REGISTERED DATE</div>
                                <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>{userData?.created_at || '—'}</div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>LAST LOGIN</div>
                                <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>{userData?.last_login_at || '—'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1rem 1.5rem', background: '#182234', borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end'
                    }}>
                        <button type="button" onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f2f5',
                            borderRadius: '10px', padding: '0.6rem 1.4rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer'
                        }}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Create / Edit Form Modal
    return (
        <div className="modal-backdrop show" style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            background: 'rgba(10, 14, 26, 0.78)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="modal-dialog" style={{
                background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px', width: '100%', maxWidth: '580px',
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
                            background: 'rgba(125, 211, 168, 0.12)', color: '#7dd3a8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f2f5', margin: 0 }}>
                                {mode === 'create' ? 'Add New User' : 'Edit User Account'}
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                                Fill in information to manage user account
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Full Name */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>FULL NAME</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: errors.name ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                    required
                                />
                                {errors.name && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{errors.name[0]}</span>}
                            </div>

                            {/* Username */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>USERNAME</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: errors.username ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                    required
                                />
                                {errors.username && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{errors.username[0]}</span>}
                            </div>

                            {/* Email */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>EMAIL ADDRESS</label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: errors.email ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                    required
                                />
                                {errors.email && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{errors.email[0]}</span>}
                            </div>

                            {/* Role */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>ROLE</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{
                                        width: '100%', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                >
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.slug}>{r.name} ({r.slug})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>ACCOUNT STATUS</label>
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

                            {/* Phone */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>PHONE NUMBER</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 08123456789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>GENDER</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    style={{
                                        width: '100%', background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            {/* Password fields */}
                            <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.8rem', marginTop: '0.4rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
                                    {mode === 'edit' ? 'PASSWORD (Biarkan kosong jika tidak ingin mengubah password)' : 'PASSWORD CREDENTIALS'}
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>PASSWORD</label>
                                <input
                                    type="password"
                                    placeholder={mode === 'edit' ? 'Leave blank to keep' : 'Enter password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: errors.password ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                    required={mode === 'create'}
                                />
                                {errors.password && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{errors.password[0]}</span>}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem' }}>CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '10px', padding: '0.65rem 0.85rem', color: '#f0f2f5', fontSize: '0.9rem'
                                    }}
                                    required={mode === 'create'}
                                />
                            </div>
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
                            {isSubmitting ? 'Saving...' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
