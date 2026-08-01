import React from 'react';

/**
 * Reusable Matrix Skeleton Loader Component
 * Renders glowing skeleton cards for categories and menu permission pills
 */
export default function MatrixSkeleton({ categoriesCount = 3, itemsPerCategory = 3 }) {
    return (
        <>
            <style>{`
                .sk-pulse { 
                    animation: sk-pulse-anim 1.4s ease-in-out infinite; 
                }
                @keyframes sk-pulse-anim { 
                    0%, 100% { opacity: 0.35; } 
                    50% { opacity: 0.85; } 
                }
                .sk-bg {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[...Array(categoriesCount)].map((_, cIdx) => (
                    <div key={`sk-cat-${cIdx}`} className="sk-pulse" style={{
                        background: 'rgba(255, 255, 255, 0.015)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '14px',
                        overflow: 'hidden'
                    }}>
                        {/* Category Header Skeleton */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <div className="sk-bg" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                            <div className="sk-bg" style={{ width: '140px', height: '14px' }} />
                        </div>

                        {/* Menus List Skeleton */}
                        <div style={{ padding: '0.5rem 1rem' }}>
                            {[...Array(itemsPerCategory)].map((_, mIdx) => (
                                <div key={`sk-menu-${mIdx}`} style={{
                                    padding: '0.85rem 0',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    {/* Left: Checkbox + Menu Label */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="sk-bg" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                                        <div>
                                            <div className="sk-bg" style={{ width: '120px', height: '14px', marginBottom: '6px' }} />
                                            <div className="sk-bg" style={{ width: '70px', height: '10px' }} />
                                        </div>
                                    </div>

                                    {/* Right: Permission Pill Badges Skeleton */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {[...Array(5)].map((_, pIdx) => (
                                            <div key={`sk-pill-${pIdx}`} className="sk-bg" style={{
                                                width: '64px',
                                                height: '26px',
                                                borderRadius: '8px'
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
