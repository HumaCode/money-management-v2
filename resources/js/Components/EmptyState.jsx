import React from 'react';
import * as Icons from 'lucide-react';

/**
 * EmptyState — Reusable premium empty state component.
 *
 * Props:
 *   message       {string}     — text message to display
 *   icon          {string}     — name of Lucide icon to use (default: 'FolderOpen')
 *   actionButton  {ReactNode}   — optional action button below message
 */
export default function EmptyState({ 
    message = 'No data found matching your filters.', 
    icon = 'FolderOpen',
    actionButton = null 
}) {
    // Dynamically resolve icon from lucide-react
    const LucideIcon = Icons[icon] || Icons.FolderOpen;

    return (
        <div className="empty-state-container">
            <style>{`
                .empty-state-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                    width: 100%;
                }
                .es-icon-wrapper {
                    position: relative;
                    width: 68px;
                    height: 68px;
                    background: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-placeholder);
                    margin-bottom: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                    animation: es-float 3s ease-in-out infinite;
                }
                .es-icon-wrapper::after {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border-radius: 22px;
                    border: 1px dashed var(--bg-card-border);
                    opacity: 0.4;
                    animation: es-rotate-dash 24s linear infinite;
                }
                .es-message {
                    font-size: 13.5px;
                    color: var(--text-secondary);
                    max-width: 340px;
                    margin: 0 0 14px 0;
                    line-height: 1.5;
                }
                .es-action {
                    display: inline-flex;
                    align-items: center;
                }

                @keyframes es-float {
                    0%, 100% { transform: translateY(0); }
                    50% { 
                        transform: translateY(-8px); 
                        color: var(--accent); 
                        border-color: var(--accent-dim); 
                        box-shadow: 0 12px 28px var(--accent-glow); 
                    }
                }
                @keyframes es-rotate-dash {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            
            <div className="es-icon-wrapper">
                <LucideIcon size={28} strokeWidth={1.5} />
            </div>
            <p className="es-message">{message}</p>
            {actionButton && <div className="es-action">{actionButton}</div>}
        </div>
    );
}
