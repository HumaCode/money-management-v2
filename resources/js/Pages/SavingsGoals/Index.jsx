import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { Search, Bookmark } from 'lucide-react';

export default function Index({ title, subtitle }) {
    const [savings, setSavings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast, showToast, dismissToast } = useToast(3500);

    const fetchSavings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('saving.goals.allPagination'), {
                params: {
                    search: searchTerm || null,
                    row_per_page: 10,
                    page: 1,
                }
            });
            if (response.data.success) {
                setSavings(response.data.data.data || []);
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading savings goals data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => { fetchSavings(); }, [fetchSavings]);

    return (
        <AuthenticatedLayout>
            <DynamicToastContainer toast={toast} onDismiss={dismissToast} />
            <div className="page-header" style={{ marginBottom: '28px' }}>
                <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'var(--accent-dim)', border: '1px solid var(--bg-card-border)',
                        color: 'var(--accent)', flexShrink: 0
                    }}>
                        <Bookmark size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'Savings Goals'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Track your target savings'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Goal Name</th>
                                <th>Target Amount</th>
                                <th>Current Amount</th>
                                <th>Target Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                            ) : savings.length === 0 ? (
                                <tr>
                                    <td colSpan="4">
                                        <EmptyState message="No savings goal records found." icon="Bookmark" />
                                    </td>
                                </tr>
                            ) : (
                                savings.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.name}</td>
                                        <td>{row.target_amount_formatted || row.target_amount}</td>
                                        <td>{row.current_amount_formatted || row.current_amount}</td>
                                        <td>{row.target_date || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
