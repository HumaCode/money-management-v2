import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import '../../../../public/assets/auth/css/styles.css';
import ThemeToggleFAB from '../../Components/ThemeToggleFAB';

export default function Login() {
    const { sso_config } = usePage().props;
    const ssoEnabled      = sso_config?.sso_enabled ?? false;
    const ssoProviderUrl  = sso_config?.sso_provider_url ?? '';
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Lfu-W8tAAAAAHD4ouVvYQU6UPKOTrxjKJfzbXnN';

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
        setIsSubmitting(true);

        try {
            // Get v3 token from grecaptcha
            let token = '';
            if (window.grecaptcha) {
                await new Promise((resolve) => {
                    window.grecaptcha.ready(async () => {
                        try {
                            token = await window.grecaptcha.execute(SITE_KEY, { action: 'login' });
                        } catch (err) {
                            console.error('reCAPTCHA execution error:', err);
                        }
                        resolve();
                    });
                });
            }

            const response = await axios.post(route('login'), {
                identity,
                password,
                remember,
                'g-recaptcha-response': token,
            });

            if (response.data.status === 'success') {
                setIsSuccess(true);
                setTimeout(() => {
                    window.location.href = response.data.redirect;
                }, 2000);
            }
        } catch (error) {
            let message = 'Login failed.';
            if (error.response) {
                if (error.response.status === 422 && error.response.data.errors) {
                    const firstErrorKey = Object.keys(error.response.data.errors)[0];
                    const firstErrorMsg = error.response.data.errors[firstErrorKey][0];
                    message = firstErrorMsg;
                } else if (error.response.data && error.response.data.message) {
                    message = error.response.data.message;
                }
            }
            setErrorMsg(message);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Login — MoneyFlow" />
            
            <div className="ambient"></div>
            <div className="grid-overlay"></div>

            {/* Inline Spin Animation keyframes */}
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
                            <rect width="36" height="36" rx="10" fill="#7dd3a8" opacity="0.15" />
                            <path d="M10 24 L16 16 L21 20 L27 10" stroke="#7dd3a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="27" cy="10" r="2.5" fill="#7dd3a8" />
                        </svg>
                        <span className="brand-name">Money<span>Flow</span></span>
                    </div>

                    <div className="brand-tagline">
                        <h2>Take control of<br /><em>your finances</em></h2>
                        <p>
                            A smarter way to track, budget, and grow your wealth — all in one
                            elegant dashboard.
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
                                <h4>Real-time Tracking</h4>
                                <p>Monitor every transaction instantly</p>
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
                                <h4>Smart Budgeting</h4>
                                <p>Set goals and stay on track</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="feature-text">
                                <h4>Secure & Private</h4>
                                <p>Bank-level encryption on all data</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Login Form */}
                <div className="panel-form" style={{ position: 'relative', minHeight: '420px' }}>
                    {!isSuccess ? (
                        <>
                            <div className="form-header">
                                <h1>Welcome back</h1>
                                <p>Sign in to your MoneyFlow account</p>
                            </div>

                            {errorMsg && (
                                <div className="error-msg show" id="errorMsg">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span id="errorText">{errorMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} id="loginForm">
                                <div className="form-group">
                                    <label htmlFor="identity">Username</label>
                                    <div className={`input-wrapper ${focusedField === 'identity' ? 'focused' : ''}`} id="usernameWrapper">
                                        <svg className="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input 
                                            type="text" 
                                            id="identity" 
                                            name="identity" 
                                            autoFocus 
                                            placeholder="Enter your username"
                                            value={identity}
                                            onChange={(e) => setIdentity(e.target.value)}
                                            onFocus={() => setFocusedField('identity')}
                                            onBlur={() => setFocusedField(null)}
                                            autoComplete="off" 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`} id="passwordWrapper">
                                        <svg className="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input 
                                            type={passwordVisible ? "text" : "password"} 
                                            id="password" 
                                            name="password" 
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            autoComplete="off" 
                                            disabled={isSubmitting}
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

                                <div className="form-options">
                                    <label className="remember-me">
                                        <input 
                                            type="checkbox" 
                                            name="remember" 
                                            id="rememberMe" 
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                            disabled={isSubmitting}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="forgot-link">Forgot password?</a>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn-login" 
                                    disabled={isSubmitting}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Mohon tunggu sebentar...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                {/* SSO Login Button — shown only when SSO is enabled */}
                                {ssoEnabled && (
                                    <>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            margin: '4px 0',
                                        }}>
                                            <div style={{ flex: 1, height: '1px', background: 'var(--input-border, rgba(255,255,255,0.1))' }}></div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap' }}>atau masuk dengan</span>
                                            <div style={{ flex: 1, height: '1px', background: 'var(--input-border, rgba(255,255,255,0.1))' }}></div>
                                        </div>

                                        <a
                                            href="/auth/sso"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px',
                                                width: '100%',
                                                padding: '13px 20px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(99,102,241,0.4)',
                                                background: 'rgba(99,102,241,0.08)',
                                                color: '#818cf8',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                textDecoration: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                letterSpacing: '0.01em',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(99,102,241,0.16)';
                                                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                                                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                                            }}
                                        >
                                            {/* HumaCode Shield Icon */}
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                            Masuk dengan HumaCode SSO
                                        </a>
                                    </>
                                )}
                            </form>
                            <div className="signup-link" id="link">
                                Don't have an account? <Link href={route('register')}>Sign up</Link>
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
                            <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>Login successful!</h3>
                            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '360px', lineHeight: '1.6' }}>
                                Welcome back to MoneyFlow. You’ve been successfully logged in.
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
