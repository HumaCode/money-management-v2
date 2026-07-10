import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function LogoutConfirmationModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-overlay show" 
            style={{ 
                zIndex: 9999, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.7)' 
            }}
            onClick={onClose}
        >
            <div 
                className="modal" 
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center',
                    padding: '32px 24px',
                    maxWidth: '400px',
                    width: '90%',
                    borderRadius: '16px',
                    transform: 'scale(1)',
                    transition: 'transform 0.3s',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bg-card-border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Warning Icon */}
                <div 
                    style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: 'rgba(245, 158, 11, 0.12)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}
                >
                    <AlertCircle 
                        size={40} 
                        style={{ color: '#f59e0b' }} 
                    />
                </div>

                {/* Title */}
                <h3 
                    style={{ 
                        fontFamily: '"Cormorant Garamond", serif', 
                        fontSize: '26px', 
                        fontWeight: '500', 
                        color: 'var(--text-primary)',
                        marginBottom: '10px'
                    }}
                >
                    Apakah Anda yakin?
                </h3>

                {/* Body Message */}
                <div className="modal-body" style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>
                        Anda akan keluar dari aplikasi!
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="modal-footer" style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button 
                        className="btn btn-danger" 
                        onClick={onConfirm}
                        style={{ 
                            flex: 1, 
                            padding: '12px', 
                            background: '#f87171', 
                            color: '#0a0e1a', 
                            fontWeight: '600', 
                            border: 'none', 
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Ya, keluar!
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={onClose}
                        style={{ 
                            flex: 1, 
                            padding: '12px', 
                            background: '#1f2937', 
                            color: '#f0f2f5', 
                            border: '1px solid var(--bg-card-border)', 
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
