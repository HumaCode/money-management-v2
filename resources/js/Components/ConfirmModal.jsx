import React from 'react';
import BaseModal from './BaseModal';
import { AlertTriangle, Info, CheckCircle, XCircle, Trash } from 'lucide-react';

/**
 * ConfirmModal — Reusable confirmation dialog built on BaseModal.
 *
 * Props:
 *   isOpen        {bool}       — visibility
 *   onClose       {function}   — cancel / close handler
 *   onConfirm     {function}   — confirm handler
 *   isLoading     {bool}       — shows spinner on confirm button
 *   variant       {string}     — 'danger' (default) | 'warning' | 'info' | 'success'
 *   title         {string}     — modal title
 *   message       {ReactNode}  — body message
 *   confirmLabel  {string}     — confirm button text (default: 'Confirm')
 *   cancelLabel   {string}     — cancel button text (default: 'Cancel')
 *   icon          {ReactNode}  — optional custom icon (overrides default)
 */

const VARIANT_CONFIG = {
    danger: {
        icon: <Trash size={30} />,
        iconBg: 'rgba(248, 113, 113, 0.12)',
        iconColor: '#f87171',
        btnClass: 'bm-btn bm-btn-danger',
    },
    warning: {
        icon: <AlertTriangle size={30} />,
        iconBg: 'rgba(251, 191, 36, 0.12)',
        iconColor: '#fbbf24',
        btnClass: 'bm-btn bm-btn-warning',
    },
    info: {
        icon: <Info size={30} />,
        iconBg: 'rgba(96, 165, 250, 0.12)',
        iconColor: '#60a5fa',
        btnClass: 'bm-btn bm-btn-primary',
    },
    success: {
        icon: <CheckCircle size={30} />,
        iconBg: 'rgba(34, 211, 165, 0.12)',
        iconColor: '#22d3a5',
        btnClass: 'bm-btn bm-btn-primary',
    },
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    variant = 'danger',
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    icon,
}) {
    const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.danger;

    const footer = (
        <>
            <button
                className="bm-btn bm-btn-cancel"
                onClick={onClose}
                disabled={isLoading}
            >
                {cancelLabel}
            </button>
            <button
                className={cfg.btnClass}
                onClick={onConfirm}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <span className="bm-spinner" />
                        Processing...
                    </>
                ) : confirmLabel}
            </button>
        </>
    );

    return (
        <>
            <style>{`
                /* ConfirmModal – extra styles */
                .cm-icon-wrap {
                    width: 68px;
                    height: 68px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 18px;
                    animation: cm-icon-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
                }
                @keyframes cm-icon-pop {
                    from { transform: scale(0.5) rotate(-15deg); opacity: 0; }
                    to   { transform: scale(1) rotate(0deg);   opacity: 1; }
                }
                .cm-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 22px;
                    font-weight: 600;
                    color: var(--text-primary);
                    text-align: center;
                    margin: 0 0 10px;
                }
                .cm-message {
                    font-size: 13.5px;
                    color: var(--text-secondary);
                    text-align: center;
                    line-height: 1.6;
                    margin: 0;
                }
                .bm-btn-warning {
                    background: #fbbf24;
                    color: #0a0e1a;
                    font-weight: 600;
                    box-shadow: 0 4px 14px rgba(251, 191, 36, 0.25);
                }
                .bm-btn-warning:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(251, 191, 36, 0.4);
                }
            `}</style>

            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                size="sm"
                footer={footer}
            >
                {/* Icon */}
                <div
                    className="cm-icon-wrap"
                    style={{ background: cfg.iconBg, color: cfg.iconColor }}
                >
                    {icon || cfg.icon}
                </div>

                {/* Title */}
                <p className="cm-title">{title}</p>

                {/* Message */}
                {message && <p className="cm-message">{message}</p>}
            </BaseModal>
        </>
    );
}
