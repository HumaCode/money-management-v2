import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import EmptyState from '../../Components/EmptyState';
import { DynamicToastContainer, useToast } from '../../Components/DynamicToast';
import axios from 'axios';
import { Search, RotateCcw, Plus, CalendarRange } from 'lucide-react';

export default function Index({ title, subtitle }) {
    const [budgets, setBudgets] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({ search: '', status: 'all', period: 'all', perPage: 10, page: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const { toast, showToast, dismissToast } = useToast(3500);

    const fetchBudgets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('budget.allPagination'), {
                params: {
                    search:       filters.search || null,
                    status:       filters.status === 'all' ? null : filters.status,
                    period:       filters.period === 'all' ? null : filters.period,
                    row_per_page: filters.perPage,
                    page:         filters.page,
                }
            });
            if (response.data.success) {
                setBudgets(response.data.data.data || []);
                setMeta(response.data.data.meta || { current_page: 1, last_page: 1, from: 0, to: 0, total: 0 });
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading budgets data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchBudgets(); }, [filters]);

    useEffect(() => {
        const h = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
        }, 400);
        return () => clearTimeout(h);
    }, [searchTerm]);

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
                        <CalendarRange size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, lineHeight: 1.25, fontSize: '26px' }}>{title || 'Manage Budgets'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {subtitle || 'Set spending limits and track your financial goals'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => showToast('Add budget feature coming soon!', 'info')}
                    className="btn-primary action"
                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                    <Plus size={16} />
                    Add Data
                </button>
            </div>

            <div className="table-card">
                <div className="table-controls">
                    <div className="table-controls-left">
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="custom-select">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="custom-select">
                            <select
                                value={filters.period}
                                onChange={(e) => setFilters(p => ({ ...p, period: e.target.value, page: 1 }))}
                            >
                                <option value="all">All Periods</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        <button className="btn-icon" onClick={() => fetchBudgets()} title="Reload">
                            <RotateCcw size={15} />
                        </button>
                    </div>

                    <div className="table-controls-right">
                        <div className="custom-select">
                            <select
                                value={filters.perPage}
                                onChange={(e) => setFilters(p => ({ ...p, perPage: Number(e.target.value), page: 1 }))}
                            >
                                <option value={10}>Show 10</option>
                                <option value={25}>Show 25</option>
                                <option value={50}>Show 50</option>
                                <option value={100}>Show 100</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Budget Name</th>
                                <th>Period</th>
                                <th>Total Amount</th>
                                <th>Spent / Progress</th>
                                <th>Status</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                            ) : budgets.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <EmptyState message="No budget records found." icon="CalendarRange" />
                                    </td>
                                </tr>
                            ) : (
                                budgets.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.name}</td>
                                        <td>{row.period}</td>
                                        <td>{row.amount_formatted || row.amount}</td>
                                        <td>{row.spent_formatted || '0'}</td>
                                        <td>
                                            <span className={`badge ${row.is_active ? 'success' : 'danger'}`}>
                                                {row.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>-</td>
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
