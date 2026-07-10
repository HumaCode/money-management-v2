import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import LogoutConfirmationModal from '../Components/LogoutConfirmationModal';
import { 
    LayoutDashboard, 
    FolderTree, 
    Wallet, 
    CalendarRange, 
    Bookmark, 
    ArrowLeftRight, 
    TrendingUp, 
    TrendingDown, 
    RefreshCw, 
    History, 
    BarChart3, 
    FileText, 
    User, 
    Settings, 
    LogOut,
    Menu,
    ChevronDown
} from 'lucide-react';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Calculate user initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const handleLogout = (e) => {
        e.preventDefault();
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = () => {
        router.post(route('logout'));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`} id="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <svg viewBox="0 0 36 36" fill="none" style={{ width: '32px', height: '32px' }}>
                            <rect width="36" height="36" rx="10" fill="#7dd3a8" opacity="0.15" />
                            <path d="M10 24 L16 16 L21 20 L27 10" stroke="#7dd3a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="27" cy="10" r="2.5" fill="#7dd3a8" />
                        </svg>
                        <span className="sidebar-logo-text">Money<span>Flow</span></span>
                    </div>
                </div>

                <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
                    {/* Dashboard */}
                    <div className="nav-section">
                        <Link 
                            href={route('dashboard')} 
                            className={`nav-item ${route().current('dashboard') ? 'active' : ''}`}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                    </div>

                    {/* Master */}
                    <div className="nav-section">
                        <div className="nav-section-title">Master</div>
                        <Link 
                            href={route('category.index')} 
                            className={`nav-item ${route().current('category.*') ? 'active' : ''}`}
                        >
                            <FolderTree size={18} />
                            Categories
                        </Link>
                        <Link 
                            href={route('account.index')} 
                            className={`nav-item ${route().current('account.*') ? 'active' : ''}`}
                        >
                            <Wallet size={18} />
                            Accounts
                        </Link>
                        <Link 
                            href={route('budget.index')} 
                            className={`nav-item ${route().current('budget.*') ? 'active' : ''}`}
                        >
                            <CalendarRange size={18} />
                            Budgets
                        </Link>
                        <Link 
                            href={route('saving.goals.index')} 
                            className={`nav-item ${route().current('saving.goals.*') ? 'active' : ''}`}
                        >
                            <Bookmark size={18} />
                            Savings Goals
                        </Link>
                    </div>

                    {/* Transactions */}
                    <div className="nav-section">
                        <div className="nav-section-title">Transactions</div>
                        <a href="#" className="nav-item">
                            <ArrowLeftRight size={18} />
                            All Transactions
                        </a>
                        <a href="#" className="nav-item">
                            <TrendingUp size={18} />
                            Income
                        </a>
                        <a href="#" className="nav-item">
                            <TrendingDown size={18} />
                            Expenses
                        </a>
                        <a href="#" className="nav-item">
                            <RefreshCw size={18} />
                            Transfers
                        </a>
                        <a href="#" className="nav-item">
                            <History size={18} />
                            Recurring
                        </a>
                    </div>

                    {/* Reports */}
                    <div className="nav-section">
                        <div className="nav-section-title">Reports</div>
                        <a href="#" className="nav-item">
                            <BarChart3 size={18} />
                            Analytics
                        </a>
                        <a href="#" className="nav-item">
                            <FileText size={18} />
                            Reports
                        </a>
                    </div>

                    {/* Settings */}
                    <div className="nav-section">
                        <div className="nav-section-title">Settings</div>
                        <a href="#" className="nav-item">
                            <User size={18} />
                            Profile
                        </a>
                        <a href="#" className="nav-item">
                            <Settings size={18} />
                            Preferences
                        </a>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">{getInitials(auth.user?.name)}</div>
                        <div className="sidebar-user-info">
                            <h4>{auth.user?.name || 'User'}</h4>
                            <p>Free Plan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Wrapper */}
            <div className={`main-wrapper ${isSidebarOpen ? '' : 'expanded'}`}>
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                            <Menu size={20} />
                        </button>
                    </div>
                    <div className="header-right">
                        <div 
                            className={`header-user ${isDropdownOpen ? 'active' : ''}`}
                            id="headerUser" 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{ position: 'relative' }}
                        >
                            <div className="header-user-avatar">{getInitials(auth.user?.name)}</div>
                            <span className="header-user-name">{auth.user?.name || 'User'}</span>
                            <ChevronDown size={16} />

                            {/* User Dropdown */}
                            <div className={`user-dropdown ${isDropdownOpen ? 'show' : ''}`} id="userDropdown">
                                <a href="#" className="dropdown-item">
                                    <User size={16} style={{ marginRight: '8px' }} />
                                    Profile
                                </a>
                                <a href="#" className="dropdown-item">
                                    <Settings size={16} style={{ marginRight: '8px' }} />
                                    Settings
                                </a>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item danger" onClick={handleLogout}>
                                    <LogOut size={16} style={{ marginRight: '8px' }} />
                                    Logout
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="content">
                    {children}
                </main>
            </div>

            {/* Custom Logout Confirmation Modal */}
            <LogoutConfirmationModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
            />
        </div>
    );
}
