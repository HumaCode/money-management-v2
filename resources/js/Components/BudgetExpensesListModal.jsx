import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import CustomDatePicker from './CustomDatePicker';
import axios from 'axios';
import { ArrowLeft, Coins, Calendar, FileText, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

export default function BudgetExpensesListModal({ isOpen, budget, onClose, onBackToDetail, onShowToast }) {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter states
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');

    useEffect(() => {
        if (!isOpen || !budget) return;
        
        const fetchExpenses = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(route('budget.expenses', { budget: budget.id }));
                if (res.data.success) {
                    setExpenses(res.data.data || []);
                } else {
                    onShowToast(res.data.message || 'Failed to fetch expenses', 'error');
                }
            } catch (err) {
                console.error(err);
                onShowToast('Server error while loading expenses', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpenses();
    }, [isOpen, budget]);

    // Reset filters
    const handleResetFilters = () => {
        setFilterStart('');
        setFilterEnd('');
    };

    // Filtered expenses list
    const filteredExpenses = expenses.filter(exp => {
        if (!exp.raw_spent_date) return true;
        if (filterStart && exp.raw_spent_date < filterStart) return false;
        if (filterEnd && exp.raw_spent_date > filterEnd) return false;
        return true;
    });

    const title = budget ? `Expenses Rincian: ${budget.name}` : 'Expenses Rincian';

    // Calculate usage status color
    const getStatusColor = () => {
        if (!budget) return 'var(--text-primary)';
        if (budget.status === 'over_budget') return 'var(--error)';
        if (budget.status === 'near_limit') return 'var(--warning)';
        return 'var(--success)';
    };

    const footer = (
        <>
            {onBackToDetail && (
                <button 
                    className="bm-btn bm-btn-cancel" 
                    onClick={() => {
                        onClose();
                        onBackToDetail(budget);
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
                {budget && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '14px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        {/* Allocated Card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'var(--accent-dim)', color: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Allocated</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                                    {budget.total_amount_formatted}
                                </div>
                            </div>
                        </div>

                        {/* Spent Card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: budget.status === 'over_budget' ? 'rgba(248, 113, 113, 0.12)' : 'rgba(245, 158, 11, 0.12)', 
                                color: budget.status === 'over_budget' ? 'var(--error)' : 'var(--warning)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <TrendingDown size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Total Spent</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: getStatusColor(), marginTop: '2px' }}>
                                    {budget.spent_amount_formatted}
                                </div>
                            </div>
                        </div>

                        {/* Usage Card */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: 'var(--bg-input-focus)', color: 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Coins size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>Budget Usage</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {Math.round(budget.progress_percentage_normalized || 0)}%
                                    </span>
                                    <span className={`badge ${budget.status === 'over_budget' ? 'danger' : budget.status === 'near_limit' ? 'warning' : 'success'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                                        {budget.status === 'over_budget' ? 'Over' : budget.status === 'near_limit' ? 'Warning' : 'Good'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Table Filter Row ── */}
                {!isLoading && expenses.length > 0 && (
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
                            Records ({filteredExpenses.length})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Filter Start Date */}
                            <div style={{ width: '140px' }}>
                                <CustomDatePicker
                                    id="filterStart"
                                    placeholder="From Date"
                                    value={filterStart}
                                    onChange={setFilterStart}
                                    placement="bottom"
                                />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
                            {/* Filter End Date */}
                            <div style={{ width: '140px' }}>
                                <CustomDatePicker
                                    id="filterEnd"
                                    placeholder="To Date"
                                    value={filterEnd}
                                    onChange={setFilterEnd}
                                    placement="bottom"
                                />
                            </div>
                            {/* Reset Filters */}
                            {(filterStart || filterEnd) && (
                                <button
                                    onClick={handleResetFilters}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '34px',
                                        height: '34px',
                                        background: 'rgba(248, 113, 113, 0.12)',
                                        border: '1px solid rgba(248, 113, 113, 0.25)',
                                        color: 'var(--error)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Reset Date Filters"
                                >
                                    <RefreshCcw size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Table / Content ── */}
                <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                            <span className="bm-spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'var(--accent)' }} />
                            <span style={{ marginTop: '12px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>Loading expenses...</span>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'var(--accent-dim)', color: 'var(--accent)',
                                marginBottom: '12px'
                            }}>
                                <Coins size={22} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>No expenses found</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                                There are no individual expenses recorded under this budget period yet.
                            </p>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'var(--bg-input)', color: 'var(--text-secondary)',
                                marginBottom: '12px'
                            }}>
                                <Calendar size={22} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>No expenses in this date range</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                                Try adjusting your start or end date filters to locate transaction records.
                            </p>
                        </div>
                    ) : (
                        <div style={{ 
                            border: '1px solid var(--bg-card-border)', 
                            borderRadius: '12px', 
                            maxHeight: '340px', // enables vertical scroll
                            overflowY: 'auto',  // scroll container
                            background: 'var(--bg-card)' 
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ 
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 10,
                                        background: 'var(--bg-input)', 
                                        borderBottom: '1px solid var(--bg-card-border)' 
                                    }}>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg-input)' }}>Category</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg-input)' }}>Spent Date</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg-input)' }}>Allocated</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg-input)' }}>Spent Amount</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg-input)' }}>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((exp, idx) => (
                                        <tr 
                                            key={exp.id} 
                                            style={{ 
                                                borderBottom: idx === filteredExpenses.length - 1 ? 'none' : '1px solid var(--bg-card-border)',
                                                transition: 'background 0.2s, transform 0.2s',
                                                cursor: 'default'
                                            }}
                                            className="expense-row-hover"
                                        >
                                            {/* Category */}
                                            <td style={{ padding: '12px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: 'var(--accent-dim)', color: 'var(--accent)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '15px', flexShrink: 0
                                                    }}>
                                                        {exp.category_icon}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                                                        {exp.category_name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td style={{ padding: '12px 18px' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                    <Calendar size={13} style={{ opacity: 0.7 }} />
                                                    <span>{exp.spent_date}</span>
                                                </div>
                                            </td>

                                            {/* Allocated */}
                                            <td style={{ padding: '12px 18px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                                                {exp.allocated_amount > 0 ? (
                                                    <span style={{ background: 'var(--bg-input)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--bg-card-border)' }}>
                                                        {Number(exp.allocated_amount).toLocaleString('de-DE')}
                                                    </span>
                                                ) : (
                                                    <span style={{ opacity: 0.4 }}>—</span>
                                                )}
                                            </td>

                                            {/* Spent Amount */}
                                            <td style={{ padding: '12px 18px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                <span style={{ color: 'var(--error)' }}>- </span>
                                                {exp.spent_amount_formatted}
                                            </td>

                                            {/* Notes */}
                                            <td style={{ padding: '12px 18px', fontSize: '13px' }}>
                                                {exp.notes && exp.notes !== '—' ? (
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                                        <FileText size={13} style={{ opacity: 0.7, flexShrink: 0 }} />
                                                        <span style={{ maxWidth: '160px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={exp.notes}>
                                                            {exp.notes}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ opacity: 0.4, fontStyle: 'italic' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Embedded styles for modern table hovers */}
            <style dangerouslySetInnerHTML={{__html: `
                .expense-row-hover:hover {
                    background: var(--bg-input-focus) !important;
                }
            `}} />
        </BaseModal>
    );
}
