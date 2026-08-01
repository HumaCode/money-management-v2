import React, { useState, useEffect } from 'react';

/**
 * BaseModal — Reusable glassmorphism modal shell.
 *
 * Props:
 *   isOpen      {bool}        — controls visibility
 *   onClose     {function}    — called when overlay / Escape / × is clicked
 *   title       {string}      — modal header title
 *   size        {string}      — 'sm' | 'md' (default) | 'lg' | 'xl'
 *   footer      {ReactNode}   — footer slot (buttons etc.)
 *   children    {ReactNode}   — body content
 */
export default function BaseModal({ isOpen, onClose, title, size = 'md', footer, children }) {
    const [animateShow, setAnimateShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Allow DOM to mount first, then trigger animation
            const t = setTimeout(() => setAnimateShow(true), 10);
            return () => clearTimeout(t);
        } else {
            setAnimateShow(false);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') handleClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setAnimateShow(false);
        setTimeout(onClose, 280);
    };

    const maxWidths = {
        sm:  '380px',
        md:  '520px',
        lg:  '680px',
        xl:  '860px',
    };

    return (
        <>
            <style>{`
                /* ── BaseModal ── */
                @keyframes bm-overlay-in {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to   { opacity: 1; backdrop-filter: blur(12px); }
                }
                @keyframes bm-card-in {
                    0%   { opacity: 0; transform: scale(0.92) translateY(20px); }
                    60%  { opacity: 1; transform: scale(1.015) translateY(-3px); }
                    100% { transform: scale(1) translateY(0); }
                }
                @keyframes bm-card-out {
                    from { opacity: 1; transform: scale(1) translateY(0); }
                    to   { opacity: 0; transform: scale(0.93) translateY(16px); }
                }

                .bm-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(6, 8, 18, 0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9900;
                    padding: 16px;
                    opacity: 0;
                    transition: opacity 0.28s ease, backdrop-filter 0.28s ease;
                }
                .bm-overlay.bm-show {
                    opacity: 1;
                    backdrop-filter: blur(12px);
                }
                .bm-card {
                    position: relative;
                    background: var(--bg-card);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 22px;
                    width: 100%;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,0.04) inset,
                        0 24px 48px -12px rgba(0, 0, 0, 0.45),
                        0 8px 16px -8px rgba(0, 0, 0, 0.3);
                    transform: scale(0.92) translateY(20px);
                    opacity: 0;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
                    overflow: hidden;
                }
                .bm-overlay.bm-show .bm-card {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }

                /* Header */
                .bm-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--bg-card-border);
                    gap: 12px;
                    flex-shrink: 0;
                    background: var(--bg-card);
                }
                .bm-header h3 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 22px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                    line-height: 1.2;
                }
                .bm-close {
                    flex-shrink: 0;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 20px;
                    line-height: 1;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.18s, color 0.18s, transform 0.18s;
                }
                .bm-close:hover {
                    background: var(--bg-input-focus);
                    color: var(--text-primary);
                    transform: rotate(90deg);
                }

                /* Body */
                .bm-body {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1 1 auto;
                    min-height: 0;
                }

                /* Footer */
                .bm-footer {
                    padding: 14px 24px;
                    border-top: 1px solid var(--bg-card-border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    flex-shrink: 0;
                    background: var(--bg-card);
                }

                /* Shared button primitives that modals can use */
                .bm-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 9px 18px;
                    border-radius: 10px;
                    font-family: 'Inter', sans-serif;
                    font-size: 13.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.18s, transform 0.18s, box-shadow 0.18s, opacity 0.18s;
                    border: 1px solid transparent;
                }
                .bm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .bm-btn-cancel {
                    background: transparent;
                    border-color: var(--bg-card-border);
                    color: var(--text-primary);
                }
                .bm-btn-cancel:hover:not(:disabled) { background: var(--bg-input-focus); }

                .bm-btn-primary {
                    background: var(--accent);
                    color: #0a0e1a;
                    font-weight: 600;
                    box-shadow: 0 4px 14px var(--accent-glow);
                }
                .bm-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px var(--accent-glow);
                }
                .bm-btn-danger {
                    background: #f87171;
                    color: #fff;
                    font-weight: 600;
                    box-shadow: 0 4px 14px rgba(248, 113, 113, 0.25);
                }
                .bm-btn-danger:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(248, 113, 113, 0.4);
                }

                /* Spinner for buttons */
                .bm-spinner {
                    width: 13px;
                    height: 13px;
                    border: 2px solid rgba(255,255,255,0.25);
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: bm-spin 0.7s linear infinite;
                    display: inline-block;
                }
                @keyframes bm-spin {
                    to { transform: rotate(360deg); }
                }

                /* Custom select & dropdown options styling for Dark/Light mode */
                .bm-body select,
                .table-card select,
                .custom-select select {
                    color: var(--text-primary);
                    background-color: var(--bg-input);
                }
                .bm-body select option,
                .table-card select option,
                .custom-select select option {
                    background-color: #111827;
                    color: #f0f2f5;
                }
                html.light .bm-body select option,
                html.light .table-card select option,
                html.light .custom-select select option {
                    background-color: #ffffff;
                    color: #1f2937;
                }

                /* Light mode overrides */
                html.light .bm-footer { background: rgba(0,0,0,0.02); }
                html.light .bm-btn-primary { color: #fff; }
            `}</style>

            <div
                className={`bm-overlay ${animateShow ? 'bm-show' : ''}`}
                onClick={handleClose}
            >
                <div
                    className="bm-card"
                    style={{ maxWidth: maxWidths[size] || maxWidths.md }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bm-header">
                        <h3>{title}</h3>
                        <button className="bm-close" onClick={handleClose} aria-label="Close">
                            &times;
                        </button>
                    </div>

                    {/* Body */}
                    <div className="bm-body">
                        {children}
                    </div>

                    {/* Footer slot */}
                    {footer && (
                        <div className="bm-footer">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
