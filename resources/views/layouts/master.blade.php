<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard — MoneyFlow</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet" />
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />


    <style>
        :root {
            --bg-deep: #0a0e1a;
            --bg-card: #111827;
            --bg-card-border: rgba(255, 255, 255, 0.06);
            --bg-input: rgba(255, 255, 255, 0.04);
            --bg-input-focus: rgba(255, 255, 255, 0.07);
            --text-primary: #f0f2f5;
            --text-secondary: #6b7280;
            --text-placeholder: #4b5563;
            --accent: #7dd3a8;
            --accent-dim: rgba(125, 211, 168, 0.15);
            --accent-glow: rgba(125, 211, 168, 0.3);
            --error: #f87171;
            --warning: #f59e0b;
            --success: #10b981;
            --radius: 14px;
            --sidebar-width: 260px;
            --header-height: 70px;
        }

        .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, .3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin .6s linear infinite;
            display: inline-block;
            margin-right: 6px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>

    <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/dashboard.css">

    @stack('css')

</head>

<body>
    <!-- Sidebar -->
    @include('layouts.partials.sidebar')

    <!-- Sidebar Overlay (Mobile) -->
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
        <!-- Header -->
        @include('layouts.partials.header')

        <!-- Content -->
        <main class="content" id="main-content">
            <!-- Modal -->
            <div class="modal-overlay" id="modal"> </div>

            {{ $slot }}
        </main>

        <!-- Footer -->
        @include('layouts.partials.footer')
    </div>

    <!-- Scroll to Top Button -->
    <button class="scroll-to-top" id="scrollToTop" onclick="scrollToTop()">
        <svg viewBox="0 0 24 24">
            <polyline points="18 15 12 9 6 15" />
        </svg>
    </button>

    <!-- Logout Modal -->
    <div class="modal-overlay" id="logoutModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-icon">
                    <svg viewBox="0 0 24 24">
                        <path
                            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h3>Confirm Logout</h3>
            </div>
            <div class="modal-body">
                <p>
                    Are you sure you want to logout? You will need to login again to
                    access your account.
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="hideLogoutModal()">
                    Cancel
                </button>

                <form id="logoutForm" method="POST" action="{{ route('logout') }}">
                    @csrf
                </form>

                <button class="btn btn-danger" id="btnLogoutConfirm" onclick="handleLogout()">
                    Logout
                </button>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

    <script>
        $.ajaxSetup({
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
                "Accept": "application/json"
            },
            xhrFields: {
                withCredentials: true
            }
        });
    </script>

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script>
        /**
         * Modal Handler for Category
         * Handles opening modal and loading content via AJAX
         */

        $(document).ready(function() {

            // Handle button with class "action" click
            $(document).on('click', '.action', function(e) {
                e.preventDefault();

                const url = $(this).attr('href');
                openModal(url);
            });

            /**
             * Open modal and load content
             * @param {string} url - URL to load content from
             */
            function openModal(url) {
                const $modal = $('#modal');

                // Show loading state
                $modal.html(`
                        <div class="modal">
                            <div class="modal-body" style="text-align: center; padding: 40px;">
                                <div class="">Loading...</div>
                            </div>
                        </div>
                    `);

                // Show modal overlay
                $modal.addClass('show');
                $('body').css('overflow', 'hidden'); // Prevent body scroll

                // Load content via AJAX
                $.ajax({
                    url: url,
                    method: 'GET',
                    success: function(response) {
                        // Insert loaded content into modal
                        $modal.html(response);

                        // Initialize modal after content loaded
                        initializeModal();
                    },
                    error: function(xhr, status, error) {
                        console.error('Error loading modal:', error);

                        // Show error message
                        $modal.html(`
                        <div class="modal">
                            <div class="modal-header">
                                <h3>Error</h3>
                                <button class="modal-close" onclick="closeModal()">
                                    <svg viewBox="0 0 24 24">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p style="color: var(--error);">Failed to load content. Please try again.</p>
                            </div>
                            <div class="modal-footer">
                                <button class="btn-secondary" onclick="closeModal()">Close</button>
                            </div>
                        </div>
                    `);
                        }
                    });
            }

            /**
             * Initialize modal after content loaded
             */
            function initializeModal() {
                // Sync color picker and hex input
                const $colorPicker = $('#categoryColor');
                const $colorHex = $('#categoryColorHex');

                if ($colorPicker.length && $colorHex.length) {
                    $colorPicker.on('input', function() {
                        $colorHex.val($(this).val());
                    });

                    $colorHex.on('input', function() {
                        const value = $(this).val();
                        if (/^#[0-9A-F]{6}$/i.test(value)) {
                            $colorPicker.val(value);
                        }
                    });
                }

                // Focus first input
                setTimeout(() => {
                    $('#categoryName').focus();
                }, 100);
            }

            /**
             * Close modal when clicking overlay
             */
            $(document).on('click', '#modal', function(e) {
                if ($(e.target).is('#modal')) {
                    closeModal();
                }
            });

            /**
             * Close modal on ESC key
             */
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' && $('#modal').hasClass('show')) {
                    closeModal();
                }
            });
        });

        /**
         * Close modal function (global scope for onclick)
         */
        function closeModal() {
            const $modal = $('#modal');
            $modal.removeClass('show');
            $modal.html('');
            $('body').css('overflow', ''); // Restore body scroll
        }

        
    </script>

    <script>
        // Scroll to Top
        const scrollToTopBtn = document.getElementById("scrollToTop");

        window.addEventListener("scroll", function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add("show");
            } else {
                scrollToTopBtn.classList.remove("show");
            }
        });

        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }

        function showLogoutModal() {
            document.getElementById("logoutModal")?.classList.add("show");
        }

        function hideLogoutModal() {
            document.getElementById("logoutModal")?.classList.remove("show");
        }

        function handleLogout() {
            const btn = document.getElementById("btnLogoutConfirm");
            const form = document.getElementById("logoutForm");

            if (!form || !btn) return;

            // === DISABLE BUTTON & UX STATE ===
            btn.disabled = true;

            btn.innerHTML = `
                <span class="spinner"></span>
                Logging out...
            `;
            btn.textContent = "Logging out...";

            // === SMALL DELAY FOR UX ===
            setTimeout(() => {
                form.submit();
            }, 500);
        }

        // Close modal when clicking outside
        document.getElementById("logoutModal")?.addEventListener("click", function(e) {
            if (e.target === this) hideLogoutModal();
        });
    </script>

    <script src="{{ asset('assets/backend/js/dashboard.js') }}"></script>


    @stack('js')
</body>

</html>
