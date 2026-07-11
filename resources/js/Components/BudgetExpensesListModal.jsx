import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import axios from 'axios';
import { Landmark, ArrowLeft, Coins } from 'lucide-react';

export default function BudgetExpensesListModal({ isOpen, budget, onClose, onBackToDetail, onShowToast }) {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const title = budget ? `Expenses Rincian: ${budget.name}` : 'Expenses Rincian';

    const footer = (
        <>
            {onBackToDetail && (
                <button 
                    className="bm-btn bm-btn-cancel" 
                    onClick={() => {
                        onClose();
                        onBackToDetail(budget);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <ArrowLeft size={14} /> Back to Details
                </button>
            )}
            <button className="bm-btn bm-btn-primary" onClick={onClose}>
                Close
            </button>
        </>
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title} size="xl" footer={footer}>
            <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
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
                ) : (
                    <div className="table-wrapper" style={{ border: '1px solid var(--bg-card-border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Spent Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Allocated</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Spent Amount</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((exp) => (
                                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--bg-card-border)' }}>
                                        <td style={{ padding: '12px 16px', fontSize: '13.5px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '15px' }}>{exp.category_icon}</span>
                                                <span style={{ fontWeight: 500 }}>{exp.category_name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                                            {exp.spent_date}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                                            {exp.allocated_amount > 0 ? Number(exp.allocated_amount).toLocaleString('de-DE') : '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {exp.spent_amount_formatted}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={exp.notes}>
                                            {exp.notes}
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
