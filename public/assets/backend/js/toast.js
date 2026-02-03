/**
 * Custom Toast Notification
 * Beautiful toast with smooth animations
 * Supports: success, error, warning, info
 */

const Toast = {
    /**
     * Show toast notification
     * @param {string} type - success, error, warning, info
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    show(type = 'success', message = '', duration = 3000) {
        // Create toast container if not exists
        if (!document.getElementById('toast-container')) {
            this.createContainer();
        }

        // Create toast element
        const toast = this.createToast(type, message);

        // Add to container
        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        // Click to close
        toast.addEventListener('click', () => {
            this.remove(toast);
        });
    },

    /**
     * Create toast container
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    },

    /**
     * Create toast element
     * @param {string} type - Toast type
     * @param {string} message - Toast message
     * @returns {HTMLElement}
     */
    createToast(type, message) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        const title = this.getTitle(type);

        toast.innerHTML = `
            <div class="toast-icon">
                ${icon}
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <svg viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(toast);
        });

        return toast;
    },

    /**
     * Get icon for toast type
     * @param {string} type
     * @returns {string}
     */
    getIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`,
            error: `<svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`,
            warning: `<svg viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`,
            info: `<svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`
        };
        return icons[type] || icons.info;
    },

    /**
     * Get title for toast type
     * @param {string} type
     * @returns {string}
     */
    getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    },

    /**
     * Remove toast with animation
     * @param {HTMLElement} toast
     */
    remove(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    // Shorthand methods
    success(message, duration = 3000) {
        this.show('success', message, duration);
    },

    error(message, duration = 3000) {
        this.show('error', message, duration);
    },

    warning(message, duration = 3000) {
        this.show('warning', message, duration);
    },

    info(message, duration = 3000) {
        this.show('info', message, duration);
    }
};

/**
 * Global showToast function (backward compatible)
 * @param {string} type - success, error, warning, info
 * @param {string} message - Message to display
 */
function showToast(type, message) {
    Toast.show(type, message);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
}