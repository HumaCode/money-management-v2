import React from 'react';

/**
 * Reusable Table Skeleton Loader Component
 * 
 * @param {number} rows - Number of skeleton rows to render (default 5)
 * @param {number} cols - Number of columns per row (default 5)
 * @param {boolean} showAvatar - Whether the first column displays a circle avatar/icon
 * @param {boolean} showActions - Whether the last column displays action buttons
 */
export default function TableSkeleton({ rows = 5, cols = 5, showAvatar = true, showActions = true }) {
    return (
        <>
            <style>{`
                .skeleton-pulse { 
                    animation: sk-pulse 1.4s ease-in-out infinite; 
                }
                @keyframes sk-pulse { 
                    0%, 100% { opacity: 0.4; } 
                    50% { opacity: 0.85; } 
                }
                .skeleton-block {
                    background: rgba(255, 255, 255, 0.08);
                    height: 14px;
                    border-radius: 6px;
                }
                html.light .skeleton-block {
                    background: rgba(0, 0, 0, 0.08);
                }
            `}</style>

            {[...Array(rows)].map((_, i) => (
                <tr key={`table-sk-${i}`} className="skeleton-pulse" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    {showAvatar && (
                        <td style={{ padding: '1rem 1.25rem', width: '50px' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)' }} />
                        </td>
                    )}

                    {[...Array(cols - (showAvatar ? 1 : 0) - (showActions ? 1 : 0))].map((_, j) => (
                        <td key={`table-sk-col-${j}`} style={{ padding: '1rem 1.25rem' }}>
                            <div 
                                className="skeleton-block" 
                                style={{ width: j === 0 ? '75%' : j === 1 ? '50%' : '60%' }} 
                            />
                        </td>
                    ))}

                    {showActions && (
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                {[0, 1, 2].map((k) => (
                                    <div key={k} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255, 255, 255, 0.08)' }} />
                                ))}
                            </div>
                        </td>
                    )}
                </tr>
            ))}
        </>
    );
}
