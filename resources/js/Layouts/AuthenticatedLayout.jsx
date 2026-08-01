import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import LogoutConfirmationModal from '../Components/LogoutConfirmationModal';
import Breadcrumb from '../Components/Breadcrumb';
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
    ChevronDown,
    Sun,
    Moon,
    Users,
    ShieldCheck
} from 'lucide-react';

export default function AuthenticatedLayout({ children, breadcrumbs }) {
    const { auth, menus } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }

        if (typeof window !== 'undefined' && window.AOS) {
            window.AOS.init({ duration: 600, once: true });
            window.AOS.refresh();
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        
        if (nextTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };

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
                    {menus && typeof menus === 'object' && Object.keys(menus).length > 0 ? (
                        Object.entries(menus).map(([category, items]) => {
                            const iconMap = {
                                LayoutDashboard,
                                Tags: FolderTree,
                                Wallet,
                                PieChart: CalendarRange,
                                Target: Bookmark,
                                ArrowLeftRight,
                                Repeat: History,
                                BarChart3,
                                Users,
                                ShieldCheck,
                                User,
                                Settings,
                            };

                            const getRouteName = (url) => {
                                const routeMap = {
                                    'dashboard': 'dashboard',
                                    'categories': 'category.index',
                                    'accounts': 'account.index',
                                    'budgets': 'budget.index',
                                    'saving-goals': 'saving-goals.index',
                                    'transactions': 'transaction.index',
                                    'recurring-transactions': 'recurring.index',
                                    'analytics': 'analytics.index',
                                    'users': 'users.index',
                                    'roles-permissions': 'roles-permissions.index',
                                    'profile': 'profile.edit',
                                    'preferences': 'preferences.index',
                                };
                                return routeMap[url] || url;
                            };

                            const isRouteActive = (url) => {
                                const activeMap = {
                                    'dashboard': 'dashboard',
                                    'categories': 'category.*',
                                    'accounts': 'account.*',
                                    'budgets': 'budget.*',
                                    'saving-goals': 'saving-goals.*',
                                    'transactions': 'transaction.*',
                                    'recurring-transactions': 'recurring.*',
                                    'analytics': 'analytics.*',
                                    'users': 'users.*',
                                    'roles-permissions': 'roles-permissions.*',
                                    'profile': 'profile.*',
                                    'preferences': 'preferences.*',
                                };
                                const pattern = activeMap[url];
                                return pattern ? route().current(pattern) : false;
                            };

                            return (
                                <div className="nav-section" key={category}>
                                    {category !== 'MAIN' && (
                                        <div className="nav-section-title">{category}</div>
                                    )}
                                    {Array.isArray(items) && items.map((item) => {
                                        const IconComponent = iconMap[item.icon] || LayoutDashboard;
                                        const targetRoute = getRouteName(item.url);
                                        
                                        return (
                                            <Link
                                                key={item.id || item.url}
                                                href={route().has(targetRoute) ? route(targetRoute) : '#'}
                                                className={`nav-item ${isRouteActive(item.url) ? 'active' : ''}`}
                                            >
                                                <IconComponent size={18} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            );
                        })
                    ) : (
                        <div className="nav-section">
                            <Link 
                                href={route('dashboard')} 
                                className={`nav-item ${route().current('dashboard') ? 'active' : ''}`}
                            >
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                        </div>
                    )}
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
                    <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Topbar Theme Toggle Button */}
                        <button 
                            onClick={toggleTheme} 
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s, color 0.2s',
                                width: '38px',
                                height: '38px'
                            }}
                            className="header-theme-toggle"
                            title="Toggle Theme"
                        >
                            <style>{`
                                .header-theme-toggle:hover {
                                    background: var(--bg-input-focus);
                                    color: var(--accent);
                                }
                                .header-theme-icon-wrapper {
                                    position: relative;
                                    width: 20px;
                                    height: 20px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                                }
                                .header-theme-toggle:hover .header-theme-icon-wrapper {
                                    transform: rotate(45deg);
                                }
                                .header-theme-icon {
                                    position: absolute;
                                    transition: transform 0.5s ease, opacity 0.5s ease;
                                    width: 20px;
                                    height: 20px;
                                    stroke-width: 2;
                                }
                                .header-theme-icon.hide {
                                    transform: scale(0) rotate(-90deg);
                                    opacity: 0;
                                    pointer-events: none;
                                }
                                .header-theme-icon.show {
                                    transform: scale(1) rotate(0deg);
                                    opacity: 1;
                                }
                            `}</style>
                            <div className="header-theme-icon-wrapper">
                                <Sun className={`header-theme-icon ${theme === 'light' ? 'show' : 'hide'}`} />
                                <Moon className={`header-theme-icon ${theme === 'dark' ? 'show' : 'hide'}`} />
                            </div>
                        </button>

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
                    {/* Breadcrumb — rendered when page passes breadcrumbs prop */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <Breadcrumb items={breadcrumbs} />
                    )}
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
