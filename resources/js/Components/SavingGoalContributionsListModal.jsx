import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import CustomDatePicker from './CustomDatePicker';
import axios from 'axios';
import { ArrowLeft, Coins, Calendar, FileText, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

export default function SavingGoalContributionsListModal({ isOpen, saving, onClose, onBackToDetail, onShowToast }) {
    const [contributions, setContributions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter states
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');

    useEffect(() => {
        if (!isOpen || !saving) return;
        
        const fetchContributions = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(route('saving.goals.contributions', { saving: saving.id }));
                if (res.data.success) {
                    setContributions(res.data.data || []);
                } else {
                    onShowToast(res.data.message || 'Failed to fetch contributions', 'error');
                }
            } catch (err) {
                console.error(err);
                onShowToast('Server error while loading contributions', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContributions();
    }, [isOpen, saving]);

    // Reset filters
    const handleResetFilters = () => {
        setFilterStart('');
        setFilterEnd('');
    };

    // Filtered list
    const filteredContributions = contributions.filter(c => {
        if (!c.raw_contributed_date) return true;
        if (filterStart && c.raw_contributed_date < filterStart) return false;
        if (filterEnd && c.raw_contributed_date > filterEnd) return false;
        return true;
    });

    const title = saving ? `Rincian Tabungan: ${saving.name}` : 'Rincian Tabungan';

    const getStatusColor = () => {
        if (!saving) return 'var(--text-primary)';
        if (saving.status === 'completed') return 'var(--success)';
        if (saving.status === 'paused') return 'var(--warning)';
        if (saving.status === 'cancelled') return 'var(--error)';
        return 'var(--info)';
    };

    const footer = (
        <>
            {onBackToDetail && (
                <button 
                    className="bm-btn bm-btn-cancel" 
                    onClick={() => {
                        onClose();
                        onBackToDetail(saving);
                    }}
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontWeight: 500,
                        border: '1px solid var(--bg-card-border)',
                        background: 'var(--bg-input)',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input-focus)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                >
                    <ArrowLeft size={15} /> Back to Details
                </button>
            )}
            <button 
                className="bm-btn bm-btn-primary" 
                onClick={onClose}
                style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 4px 12px var(--accent-glow)'
                }}
            >
                Close
            </button>
        </>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="xl" footer={footer}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* ── Top Summary Cards ── */}
                {saving && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '14px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        {/* Target Card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'var(--accent-dim)', color: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Target Amount</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                                    {saving.target_amount_formatted}
                                </div>
                            </div>
                        </div>

                        {/* Saved Card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'rgba(16, 185, 129, 0.12)', 
                                color: 'var(--success)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Coins size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Total Saved</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>
                                    {saving.current_amount_formatted}
                                </div>
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'var(--bg-input-focus)', color: 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <TrendingDown size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Progress</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {saving.progress_percentage}%
                                    </span>
                                    <span className={`badge ${saving.status === 'completed' ? 'success' : saving.status === 'paused' ? 'warning' : saving.status === 'cancelled' ? 'danger' : 'info'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                                        {saving.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Table Filter Row ── */}
                {!isLoading && contributions.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        borderBottom: '1px solid var(--bg-card-border)',
                        paddingBottom: '14px',
                        marginTop: '4px'
                    }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Records ({filteredContributions.length})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Filter Start Date */}
                            <div style={{ width: '140px' }}>
                                <CustomDatePicker 
                                    value={filterStart}
                                    onChange={setFilterStart}
                                    placeholder="From Date"
                                    placement="bottom"
                                />
                            </div>
                            
                            {/* Arrow separator */}
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>

                            {/* Filter End Date */}
                            <div style={{ width: '140px' }}>
                                <CustomDatePicker 
                                    value={filterEnd}
                                    onChange={setFilterEnd}
                                    placeholder="To Date"
                                    placement="bottom"
                                />
                            </div>

                            {/* Reset filter button */}
                            {(filterStart || filterEnd) && (
                                <button 
                                    onClick={handleResetFilters}
                                    style={{
                                        border: '1px solid var(--bg-card-border)',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    title="Clear Date Filters"
                                >
                                    <RefreshCcw size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Main Data View ── */}
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
                        <span className="bm-spinner" style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--accent)' }} />
                        <span style={{ marginTop: '14px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Loading contributions...</span>
                    </div>
                ) : contributions.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        border: '1px dashed var(--bg-card-border)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎯</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No contributions yet</div>
                        <div style={{ fontSize: '12.5px', marginTop: '4px', maxWidth: '280px' }}>This goal does not have any saving records. Start adding savings to track progress!</div>
                    </div>
                ) : filteredContributions.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        border: '1px dashed var(--bg-card-border)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No contributions match filters</div>
                        <button 
                            onClick={handleResetFilters}
                            style={{
                                marginTop: '12px',
                                border: 'none',
                                background: 'var(--accent-dim)',
                                color: 'var(--accent)',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    // ── Scrollable Table Container ──
                    <div style={{
                        maxHeight: '340px',
                        overflowY: 'auto',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '8px'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            textAlign: 'left'
                        }}>
                            <thead style={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 10,
                                background: 'var(--bg-input)',
                                borderBottom: '1px solid var(--bg-card-border)'
                            }}>
                                <tr>
                                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>Date</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>Notes</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContributions.map((c, idx) => (
                                    <tr key={c.id || idx} style={{
                                        borderBottom: idx < filteredContributions.length - 1 ? '1px solid var(--bg-card-border)' : 'none',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input-focus)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={14} style={{ color: 'var(--accent)' }} />
                                                {c.contributed_at}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'pre-wrap', maxWidth: '300px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <FileText size={14} style={{ color: 'var(--text-secondary)', marginTop: '2px', flexShrink: 0 }} />
                                                <span>{c.notes}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--success)', textAlign: 'right' }}>
                                            {c.amount_formatted}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </BaseModal>
    );
}
