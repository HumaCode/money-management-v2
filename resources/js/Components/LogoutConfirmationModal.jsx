import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function LogoutConfirmationModal({ isOpen, onClose, onConfirm }) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [animateShow, setAnimateShow] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                setAnimateShow(true);
            }, 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateShow(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsProcessing(false); // Reset processing state when closed
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setIsProcessing(true);
        onConfirm();
    };

    if (!shouldRender) return null;

    return (
        <div 
            className={`logout-modal-overlay ${animateShow ? 'show' : ''}`}
            onClick={isProcessing ? null : onClose}
        >
            <style>{`
                .logout-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(8, 10, 18, 0.6);
                    backdrop-filter: blur(0px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    opacity: 0;
                    transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
                }
                
                .logout-modal-overlay.show {
                    opacity: 1;
                    backdrop-filter: blur(12px);
                }
                
                .logout-modal-card {
                    background: rgba(17, 24, 39, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    width: 90%;
                    max-width: 400px;
                    padding: 36px 28px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                                0 0 40px rgba(125, 211, 168, 0.03);
                    transform: scale(0.9) translateY(20px);
                    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .logout-modal-overlay.show .logout-modal-card {
                    transform: scale(1) translateY(0);
                }
                
                .logout-icon-container {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: rgba(245, 158, 11, 0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    position: relative;
                    animation: pulseWarning 2s infinite ease-in-out;
                }
                
                .logout-icon-container svg {
                    color: #f59e0b;
                    animation: wobbleWarning 2.5s infinite ease-in-out;
                }
                
                @keyframes pulseWarning {
                    0% {
                        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.25);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 0 12px rgba(245, 158, 11, 0);
                        transform: scale(1.04);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
                        transform: scale(1);
                    }
                }
                
                @keyframes wobbleWarning {
                    0%, 100% { transform: rotate(0deg); }
                    10% { transform: rotate(-10deg); }
                    20% { transform: rotate(12deg); }
                    30% { transform: rotate(-8deg); }
                    40% { transform: rotate(6deg); }
                    50% { transform: rotate(0deg); }
                }
                
                .logout-modal-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 28px;
                    font-weight: 500;
                    color: #f0f2f5;
                    margin-bottom: 12px;
                    letter-spacing: -0.3px;
                }
                
                .logout-modal-text {
                    font-size: 14px;
                    color: #94a3b8;
                    margin-bottom: 32px;
                    line-height: 1.5;
                }
                
                .logout-modal-buttons {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                }
                
                .btn-logout-confirm {
                    flex: 1;
                    padding: 14px;
                    background: linear-gradient(135deg, #ef4444, #f87171);
                    color: #0a0e1a;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
                    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .btn-logout-confirm:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
                }
                
                .btn-logout-confirm:active:not(:disabled) {
                    transform: translateY(1px);
                }

                .btn-logout-confirm:disabled {
                    opacity: 0.8;
                    cursor: not-allowed;
                    background: #f87171;
                }
                
                .btn-logout-cancel {
                    flex: 1;
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #f0f2f5;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.2s, border-color 0.2s, transform 0.2s;
                }
                
                .btn-logout-cancel:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-1px);
                }
                
                .btn-logout-cancel:active:not(:disabled) {
                    transform: translateY(1px);
                }

                .btn-logout-cancel:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(10, 14, 26, 0.25);
                    border-top: 2px solid #0a0e1a;
                    border-radius: 50%;
                    animation: btn-spin 0.8s linear infinite;
                    display: inline-block;
                }

                @keyframes btn-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Light mode adjustments */
                html.light .logout-modal-card {
                    background: rgba(255, 255, 255, 0.95);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 
                                0 0 40px rgba(5, 150, 105, 0.04);
                }
                
                html.light .logout-modal-title {
                    color: #1f2937;
                }
                
                html.light .logout-modal-text {
                    color: #4b5563;
                }
                
                html.light .btn-logout-cancel {
                    background: rgba(0, 0, 0, 0.02);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    color: #1f2937;
                }
                
                html.light .btn-logout-cancel:hover:not(:disabled) {
                    background: rgba(0, 0, 0, 0.05);
                    border-color: rgba(0, 0, 0, 0.15);
                }
                
                html.light .btn-logout-confirm {
                    color: #ffffff;
                    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2);
                }
                
                html.light .btn-spinner {
                    border-color: rgba(255, 255, 255, 0.25);
                    border-top-color: #ffffff;
                }
            `}</style>
            
            <div 
                className="logout-modal-card"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Motion Warning Icon */}
                <div className="logout-icon-container">
                    <AlertCircle size={38} strokeWidth={2.2} />
                </div>

                {/* Animated Title */}
                <h3 className="logout-modal-title">
                    Apakah Anda yakin?
                </h3>

                {/* Body Message */}
                <p className="logout-modal-text">
                    Anda akan keluar dari aplikasi!
                </p>

                {/* Footer Buttons */}
                <div className="logout-modal-buttons">
                    <button 
                        className="btn-logout-confirm" 
                        onClick={handleConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <span className="btn-spinner"></span>
                                Sedang proses...
                            </>
                        ) : (
                            'Ya, keluar!'
                        )}
                    </button>
                    <button 
                        className="btn-logout-cancel" 
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
