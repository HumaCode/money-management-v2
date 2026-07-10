import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * DynamicToast — Dynamic Island-style toast notification system.
 *
 * Usage:
 *   import { useToast, DynamicToastContainer } from '@/Components/DynamicToast';
 *
 *   const { toast, showToast } = useToast();
 *   showToast('Saved!', 'success');
 *   showToast('Something went wrong', 'error');
 *   showToast('Processing...', 'info');
 *   showToast('Check your input', 'warning');
 *
 *   return (
 *     <>
 *       <DynamicToastContainer toast={toast} />
 *       ... your page ...
 *     </>
 *   );
 */

const TOAST_CONFIGS = {
    success: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
        ),
        label: 'Success',
        color: '#22d3a5',
        glow: 'rgba(34, 211, 165, 0.55)',
        glowSoft: 'rgba(34, 211, 165, 0.12)',
        border: 'rgba(34, 211, 165, 0.35)',
        bg: 'rgba(10, 14, 26, 0.92)',
    },
    error: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
        ),
        label: 'Error',
        color: '#f87171',
        glow: 'rgba(248, 113, 113, 0.55)',
        glowSoft: 'rgba(248, 113, 113, 0.12)',
        border: 'rgba(248, 113, 113, 0.35)',
        bg: 'rgba(10, 14, 26, 0.92)',
    },
    warning: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        ),
        label: 'Warning',
        color: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.55)',
        glowSoft: 'rgba(251, 191, 36, 0.12)',
        border: 'rgba(251, 191, 36, 0.35)',
        bg: 'rgba(10, 14, 26, 0.92)',
    },
    info: {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        ),
        label: 'Info',
        color: '#60a5fa',
        glow: 'rgba(96, 165, 250, 0.55)',
        glowSoft: 'rgba(96, 165, 250, 0.12)',
        border: 'rgba(96, 165, 250, 0.35)',
        bg: 'rgba(10, 14, 26, 0.92)',
    },
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useToast(duration = 3500) {
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success',
    });
    const timerRef = useRef(null);

    const showToast = useCallback((message, type = 'success') => {
        if (timerRef.current) clearTimeout(timerRef.current);

        setToast({ show: true, message, type });

        timerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, duration);
    }, [duration]);

    const dismissToast = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return { toast, showToast, dismissToast };
}

// ─── Container Component ──────────────────────────────────────────────────────
export function DynamicToastContainer({ toast, onDismiss }) {
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);
    const prevShow = useRef(false);

    // Orchestrate the animation sequence: appear → expand → stay → collapse → disappear
    useEffect(() => {
        if (toast.show && !prevShow.current) {
            // APPEAR
            setAnimatingOut(false);
            setVisible(true);
            setExpanded(false);

            // EXPAND
            const t1 = setTimeout(() => setExpanded(true), 80);
            prevShow.current = true;

            return () => clearTimeout(t1);
        }

        if (!toast.show && prevShow.current) {
            // COLLAPSE → DISAPPEAR
            setExpanded(false);
            const t2 = setTimeout(() => {
                setAnimatingOut(true);
            }, 300);
            const t3 = setTimeout(() => {
                setVisible(false);
                setAnimatingOut(false);
                prevShow.current = false;
            }, 600);

            return () => {
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }, [toast.show]);

    if (!visible) return null;

    const cfg = TOAST_CONFIGS[toast.type] || TOAST_CONFIGS.success;

    return (
        <>
            <style>{`
                /* ── DynamicToast Keyframes ── */
                @keyframes di-pill-in {
                    0%   { transform: translateX(-50%) scaleX(0.35) scaleY(0.8); opacity: 0; }
                    60%  { transform: translateX(-50%) scaleX(1.03) scaleY(1.01); opacity: 1; }
                    100% { transform: translateX(-50%) scaleX(1) scaleY(1); opacity: 1; }
                }
                @keyframes di-pill-out {
                    0%   { transform: translateX(-50%) scaleX(1) scaleY(1); opacity: 1; }
                    60%  { transform: translateX(-50%) scaleX(0.6) scaleY(0.9); opacity: 0.5; }
                    100% { transform: translateX(-50%) scaleX(0.35) scaleY(0.7); opacity: 0; }
                }
                @keyframes di-neon-pulse {
                    0%   { box-shadow: var(--di-shadow-base), 0 0 18px var(--di-glow), 0 0 35px var(--di-glow-far); }
                    50%  { box-shadow: var(--di-shadow-base), 0 0 28px var(--di-glow), 0 0 60px var(--di-glow-far); }
                    100% { box-shadow: var(--di-shadow-base), 0 0 18px var(--di-glow), 0 0 35px var(--di-glow-far); }
                }
                @keyframes di-icon-bounce {
                    0%   { transform: scale(0.5) rotate(-20deg); opacity: 0; }
                    60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
                    80%  { transform: scale(0.95) rotate(-2deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes di-text-slide {
                    0%   { transform: translateX(-8px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes di-progress {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
                @keyframes di-particle-float {
                    0%   { transform: translateY(0) scale(1); opacity: 0.8; }
                    100% { transform: translateY(-28px) scale(0); opacity: 0; }
                }

                /* ── Pill Wrapper ── */
                .di-pill {
                    position: fixed;
                    bottom: 32px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;

                    display: flex;
                    align-items: center;
                    gap: 0;

                    background: var(--di-bg);
                    border: 1px solid var(--di-border);
                    border-radius: 999px;

                    overflow: hidden;
                    cursor: pointer;

                    /* pill dimensions */
                    min-width: 52px;
                    max-width: 420px;
                    height: 52px;
                    padding: 0 10px;

                    /* transition width & padding for expand/collapse */
                    transition:
                        padding 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                        gap 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                        min-width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                        max-width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                        border-color 0.2s ease,
                        box-shadow 0.3s ease;

                    animation: di-pill-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                .di-pill.di-out {
                    animation: di-pill-out 0.35s cubic-bezier(0.55, 0, 1, 0.45) both;
                }
                .di-pill.di-expanded {
                    padding: 0 20px 0 14px;
                    gap: 12px;
                    min-width: 220px;
                    animation: di-neon-pulse 2.5s ease-in-out infinite;
                }

                /* ── Icon circle ── */
                .di-icon-wrap {
                    flex-shrink: 0;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--di-glow-soft);
                    color: var(--di-color);
                    transition: transform 0.3s ease, background 0.3s ease;
                }
                .di-icon-wrap svg {
                    width: 18px;
                    height: 18px;
                }
                .di-pill.di-expanded .di-icon-wrap {
                    animation: di-icon-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
                }

                /* ── Text area ── */
                .di-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    overflow: hidden;
                    max-width: 0;
                    opacity: 0;
                    pointer-events: none;
                    transition: max-width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
                    white-space: nowrap;
                }
                .di-pill.di-expanded .di-content {
                    max-width: 280px;
                    opacity: 1;
                    pointer-events: auto;
                }
                .di-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--di-color);
                    line-height: 1;
                }
                .di-message {
                    font-family: 'Inter', sans-serif;
                    font-size: 13.5px;
                    font-weight: 500;
                    color: #f0f2f5;
                    line-height: 1.3;
                    animation: di-text-slide 0.3s ease 0.2s both;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* ── Progress bar ── */
                .di-progress-bar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 2.5px;
                    width: 100%;
                    background: var(--di-color);
                    transform-origin: left center;
                    border-radius: 0 0 999px 999px;
                    opacity: 0.6;
                }
                .di-pill.di-expanded .di-progress-bar {
                    animation: di-progress var(--di-duration, 3.5s) linear 0.45s forwards;
                }

                /* ── Floating neon particles ── */
                .di-particles {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    pointer-events: none;
                }
                .di-particle {
                    position: absolute;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: var(--di-color);
                    box-shadow: 0 0 6px var(--di-glow);
                    opacity: 0;
                }
                .di-pill.di-expanded .di-particle:nth-child(1) { left: -30px; animation: di-particle-float 1.2s ease 0.5s forwards; }
                .di-pill.di-expanded .di-particle:nth-child(2) { left: 10px;  animation: di-particle-float 1.5s ease 0.7s forwards; }
                .di-pill.di-expanded .di-particle:nth-child(3) { left: -10px; animation: di-particle-float 1.0s ease 0.9s forwards; }
                .di-pill.di-expanded .di-particle:nth-child(4) { left: 25px;  animation: di-particle-float 1.3s ease 0.6s forwards; }
                .di-pill.di-expanded .di-particle:nth-child(5) { left: -20px; animation: di-particle-float 1.1s ease 0.8s forwards; }

                /* light mode adjustments */
                html.light .di-message { color: #1f2937; }
                html.light .di-pill {
                    background: rgba(255, 255, 255, 0.92);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }
            `}</style>

            <div
                className={`di-pill ${expanded ? 'di-expanded' : ''} ${animatingOut ? 'di-out' : ''}`}
                onClick={onDismiss}
                title="Click to dismiss"
                style={{
                    '--di-color': cfg.color,
                    '--di-glow': cfg.glow,
                    '--di-glow-far': cfg.glow.replace('0.55', '0.2'),
                    '--di-glow-soft': cfg.glowSoft,
                    '--di-border': cfg.border,
                    '--di-bg': cfg.bg,
                    '--di-shadow-base': '0 16px 32px rgba(0, 0, 0, 0.35)',
                    '--di-duration': '3.5s',
                }}
            >
                {/* Neon floating particles */}
                <div className="di-particles">
                    {[1,2,3,4,5].map(n => (
                        <div key={n} className="di-particle" />
                    ))}
                </div>

                {/* Icon */}
                <div className="di-icon-wrap">
                    {cfg.icon}
                </div>

                {/* Text */}
                <div className="di-content">
                    <span className="di-label">{cfg.label}</span>
                    <span className="di-message">{toast.message}</span>
                </div>

                {/* Progress bar */}
                <div className="di-progress-bar" />
            </div>
        </>
    );
}
