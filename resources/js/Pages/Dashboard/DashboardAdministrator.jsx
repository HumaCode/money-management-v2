import React, { useEffect } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

export default function DashboardAdministrator() {
    const { auth } = usePage().props;

    useEffect(() => {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
            });
        }
    }, []);

    return (
        <AuthenticatedLayout>
            {/* Welcome Banner */}
            <div className="welcome-banner" data-aos="fade-down">
                <h2>Welcome back, {auth.user?.name || 'User'}! 👋</h2>
                <p>Here's what's happening with your finances today.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Total Balance */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
                    <div className="stat-card-header">
                        <div className="stat-card-icon success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={20} />
                        </div>
                        <span className="stat-card-trend up">+12.5%</span>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp 45,320,000</h3>
                        <p>Total Balance</p>
                    </div>
                </div>

                {/* Income This Month */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
                    <div className="stat-card-header">
                        <div className="stat-card-icon primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={20} />
                        </div>
                        <span className="stat-card-trend up">+8.2%</span>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp 12,500,000</h3>
                        <p>Income This Month</p>
                    </div>
                </div>

                {/* Expenses This Month */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
                    <div className="stat-card-header">
                        <div className="stat-card-icon error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowDownRight size={20} />
                        </div>
                        <span className="stat-card-trend down">-5.3%</span>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp 8,750,000</h3>
                        <p>Expenses This Month</p>
                    </div>
                </div>

                {/* Savings Goals Progress */}
                <div className="stat-card" data-aos="fade-up" data-aos-delay="400">
                    <div className="stat-card-header">
                        <div className="stat-card-icon warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={20} />
                        </div>
                        <span className="stat-card-trend up">+15%</span>
                    </div>
                    <div className="stat-card-body">
                        <h3>Rp 25,000,000</h3>
                        <p>Savings Goals Progress</p>
                    </div>
                </div>
            </div>

            {/* Additional content placeholder */}
            <div 
                style={{
                    height: '600px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bg-card-border)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '32px',
                }}
                data-aos="fade-up"
            >
                <h3
                    style={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '20px',
                        marginBottom: '16px',
                        color: 'var(--text-primary)'
                    }}
                >
                    Recent Transactions
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Transaction list will be displayed here...
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
