<div class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="sidebar-logo">
            <svg viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="#7dd3a8" opacity="0.15" />
                <path d="M10 24 L16 16 L21 20 L27 10" stroke="#7dd3a8" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                <circle cx="27" cy="10" r="2.5" fill="#7dd3a8" />
            </svg>
            <span class="sidebar-logo-text">Money<span>Flow</span></span>
        </div>
    </div>

    <nav class="sidebar-nav">
        <!-- Dashboard -->
        <div class="nav-section">
            <a href="{{ route('dashboard') }}" class="nav-item {{ active_route('dashboard') }}">
                <i data-lucide="air-vent"></i>
                Dashboard
            </a>
        </div>

        <!-- Master -->
        <div class="nav-section">
            <div class="nav-section-title">Master</div>
            <a href="{{ route('category.index') }}" class="nav-item {{ active_route('category.index') }}">
                <svg viewBox="0 0 24 24">
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                </svg>
                Categories
            </a>
            <a href="{{ route('account.index') }}" class="nav-item {{ active_route('account.index') }}">
                <svg viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Accounts
            </a>
            <a href="{{ route('budget.index') }}" class="nav-item {{ active_route('budget.index') }}">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
                Budgets
            </a>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Savings Goals
            </a>
        </div>

        <!-- Transactions -->
        <div class="nav-section">
            <div class="nav-section-title">Transactions</div>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                All Transactions
            </a>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                </svg>
                Income
            </a>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                </svg>
                Expenses
            </a>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                Transfers
            </a>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                Recurring
            </a>
        </div>

        <!-- Reports -->
        <div class="nav-section">
            <div class="nav-section-title">Reports</div>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Analytics
            </a>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
                Reports
            </a>
        </div>

        <!-- Settings -->
        <div class="nav-section">
            <div class="nav-section-title">Settings</div>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
            </a>
            <a href="#" class="nav-item">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path
                        d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24M9.17 14.83L4.93 19.07M23 12h-6m-6 0H1m19.07-7.07l-4.24 4.24M9.17 9.17L4.93 4.93M19.07 19.07l-4.24-4.24M9.17 9.17L4.93 4.93" />
                </svg>
                Preferences
            </a>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="sidebar-user">
            <div class="sidebar-user-avatar">JD</div>
            <div class="sidebar-user-info">
                <h4>John Doe</h4>
                <p>Free Plan</p>
            </div>
        </div>
    </div>
</div>
