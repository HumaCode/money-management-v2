<header class="header">
    <div class="header-left">
        <button class="mobile-menu-toggle" onclick="toggleSidebar()">
            <svg viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        </button>
        <h1>Dashboard</h1>
    </div>
    <div class="header-right">
        <div class="header-user" id="headerUser" onclick="toggleUserDropdown()">
            <div class="header-user-avatar">{{ user_initials() }}</div>
            <span class="header-user-name">{{ user('name') }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
            </svg>

            <!-- User Dropdown -->
            <div class="user-dropdown" id="userDropdown">
                <a href="#" class="dropdown-item">
                    <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile
                </a>
                <a href="#" class="dropdown-item">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <path
                            d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24M9.17 14.83L4.93 19.07M23 12h-6m-6 0H1m19.07-7.07l-4.24 4.24M9.17 9.17L4.93 4.93M19.07 19.07l-4.24-4.24M9.17 9.17L4.93 4.93" />
                    </svg>
                    Settings
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item danger"
                    onclick="
                  event.preventDefault();
                  showLogoutModal();
                ">
                    <svg viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </a>
            </div>
        </div>
    </div>
</header>
