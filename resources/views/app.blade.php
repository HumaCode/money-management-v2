<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title inertia>MoneyFlow</title>
    
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

        html.light {
            --bg-deep: #f3f4f6;
            --bg-card: #ffffff;
            --bg-card-border: rgba(0, 0, 0, 0.08);
            --bg-input: rgba(0, 0, 0, 0.03);
            --bg-input-focus: rgba(0, 0, 0, 0.05);
            --text-primary: #1f2937;
            --text-secondary: #4b5563;
            --text-placeholder: #9ca3af;
            --accent: #059669;
            --accent-dim: rgba(5, 150, 105, 0.08);
            --accent-glow: rgba(5, 150, 105, 0.15);
        }

        /* Specific overrides for light theme on login page & layout */
        html.light body {
            background-color: #f3f4f6;
            color: #1f2937;
        }
        html.light .grid-overlay {
            background-image:
                linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
        }
        html.light .panel-brand {
            background: linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 100%);
        }
        html.light .panel-brand::before,
        html.light .panel-brand::after {
            border-color: rgba(5, 150, 105, 0.08);
        }
        html.light .sidebar {
            background: #ffffff;
            border-right: 1px solid rgba(0, 0, 0, 0.08);
        }
        html.light .sidebar-header {
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        html.light .header {
            background: #ffffff;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        html.light .user-dropdown {
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        html.light .dropdown-item {
            color: #4b5563;
        }
        html.light .dropdown-item:hover {
            background: rgba(0, 0, 0, 0.03);
            color: #1f2937;
        }
        html.light .card {
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
        }
        html.light .btn-logout-cancel {
            background: rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(0, 0, 0, 0.08);
            color: #1f2937;
        }
        html.light .btn-logout-cancel:hover {
            background: rgba(0, 0, 0, 0.06);
            border-color: rgba(0, 0, 0, 0.15);
        }
    </style>
    <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/toast.css">
    <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/custom-css.css">
    <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/dashboard.css">
    <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/category.css">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body>
    @inertia

    <!-- Toast container and external libs -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
    <script src="{{ asset('/') }}assets/backend/js/toast.js"></script>
    <script src="{{ asset('/') }}assets/backend/js/main.js"></script>
</body>

</html>
