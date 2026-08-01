import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import '../../../../public/assets/auth/css/styles.css';
import ThemeToggleFAB from '../../Components/ThemeToggleFAB';

export default function Register() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const SITE_KEY = '6Lfu-W8tAAAAAHD4ouVvYQU6UPKOTrxjKJfzbXnN';

    useEffect(() => {
        // Load Google reCAPTCHA v3 script
        const scriptId = 'google-recaptcha-v3-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (password !== passwordConfirmation) {
            setErrorMsg('Password confirmation does not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get v3 token from grecaptcha
            let token = '';
            if (window.grecaptcha) {
                await new Promise((resolve) => {
                    window.grecaptcha.ready(async () => {
                        try {
                            token = await window.grecaptcha.execute(SITE_KEY, { action: 'register' });
                        } catch (err) {
                            console.error('reCAPTCHA execution error:', err);
                        }
                        resolve();
                    });
                });
            }

            const response = await axios.post(route('register'), {
                name,
                username,
                email,
                password,
                password_confirmation: passwordConfirmation,
                'g-recaptcha-response': token,
            });

            if (response.data.status === 'success') {
                setIsSuccess(true);
                setTimeout(() => {
                    window.location.href = response.data.redirect;
                }, 2000);
            }
        } catch (error) {
            let message = 'Registration failed.';
            if (error.response) {
                if (error.response.status === 422 && error.response.data.errors) {
                    message = Object.values(error.response.data.errors)[0][0];
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                }
            }
            setErrorMsg(message);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Register — MoneyFlow" />
            
            <div className="ambient"></div>
            <div className="grid-overlay"></div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .btn-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(10, 14, 26, 0.25);
                    border-top: 2px solid #0a0e1a;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    display: inline-block;
                }
                @keyframes fadeScale {
                    from {
                        opacity: 0;
                        transform: scale(.96);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>

            <div className="container">
                {/* Left: Branding */}
                <div className="panel-brand">
                    <div className="brand-logo">
                        <svg viewBox="0 0 36 36" fill="none" style={{ width: '36px', height: '36px' }}>
                            <rect width="36" height="36" rx="10" fill="#7dd3a8" fillOpacity="0.15" />
                            <path d="M10 24 L16 16 L21 20 L27 10" stroke="#7dd3a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="27" cy="10" r="2.5" fill="#7dd3a8" />
                        </svg>
                        <span className="brand-name">Money<span>Flow</span></span>
                    </div>

                    <div className="brand-tagline">
                        <h2>Start your<br /><em>financial journey</em></h2>
                        <p>
                            Join MoneyFlow today and take full control of your personal finances with smart budgeting tools.
                        </p>
                    </div>

                    <div className="brand-features">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div className="feature-text">
                                <h4>Free Account</h4>
                                <p>Get instant access to all core features</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                            </div>
                            <div className="feature-text">
                                <h4>Smart Categorization</h4>
                                <p>Effortlessly organize income & expenses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Register Form */}
                <div className="panel-form" style={{ position: 'relative', minHeight: '480px' }}>
                    {!isSuccess ? (
                        <>
                            <div className="form-header">
                                <h1>Create account</h1>
                                <p>Start managing your MoneyFlow account</p>
                            </div>

                            {errorMsg && (
                                <div className="error-msg show" id="errorMsg">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', marginRight: '8px', flexShrink: 0 }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span id="errorText">{errorMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} id="registerForm">
                                {/* Full Name */}
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <div className={`input-wrapper ${focusedField === 'name' ? 'focused' : ''}`}>
                                        <svg className="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input 
                                            type="text" 
                                            id="name" 
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <div className={`input-wrapper ${focusedField === 'username' ? 'focused' : ''}`}>
                                        <svg className="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                            <circle cx="12" cy="12" r="4" />
                                            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                                        </svg>
                                        <input 
                                            type="text" 
                                            id="username" 
                                            placeholder="Choose a username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={() => setFocusedField('username')}
                                            onBlur={() => setFocusedField(null)}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                                        <svg className="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                                        <svg className="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input 
                                            type={passwordVisible ? "text" : "password"} 
                                            id="password" 
                                            placeholder="Create a password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            disabled={isSubmitting}
                                            required
                                        />
                                        <button 
                                            className="toggle-password" 
                                            type="button" 
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            aria-label="Toggle password visibility"
                                            disabled={isSubmitting}
                                        >
                                            {passwordVisible ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Confirmation */}
                                <div className="form-group">
                                    <label htmlFor="passwordConfirmation">Confirm Password</label>
                                    <div className={`input-wrapper ${focusedField === 'passwordConfirmation' ? 'focused' : ''}`}>
                                        <svg className="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input 
                                            type={passwordVisible ? "text" : "password"} 
                                            id="passwordConfirmation" 
                                            placeholder="Confirm your password"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            onFocus={() => setFocusedField('passwordConfirmation')}
                                            onBlur={() => setFocusedField(null)}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn-login" 
                                    disabled={isSubmitting}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        marginTop: '24px'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Creating account...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>
                            </form>
                            <div className="signup-link" id="link">
                                Already have an account? <Link href={route('login')}>Sign in</Link>
                            </div>
                        </>
                    ) : (
                        /* Success state panel */
                        <div className="success-msg show" id="successMsg" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            height: '100%',
                            animation: 'fadeScale .4s ease'
                        }}>
                            <div className="success-icon-wrap" style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'rgba(34, 197, 94, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Account created!</h3>
                            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '360px', lineHeight: '1.6' }}>
                                Welcome to MoneyFlow. Your account has been registered successfully.
                                Redirecting you to your dashboard.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ThemeToggleFAB />
        </>
    );
}
