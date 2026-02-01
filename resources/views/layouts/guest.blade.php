<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login — MoneyFlow</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500&display=swap"
        rel="stylesheet" />

    <link rel="stylesheet" href="{{ asset('/') }}assets/auth/css/styles.css" />

    <style>
        .loading-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, .4);
            z-index: 9999;
            justify-content: center;
            align-items: center;
        }

        .loading-box {
            background: linear-gradient(135deg, #5bbf8a, #7dd3a8);
            padding: 24px 32px;
            border-radius: var(--radius);
            color: #0a0e1a;
            font-family: "Inter", sans-serif;
            text-align: center;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #ddd;
            border-top: 4px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>
    @stack('auth-css')

</head>

<body>
    <div class="ambient"></div>
    <div class="grid-overlay"></div>

    <div id="loadingModal" class="loading-modal">
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Loading, please wait...</p>
        </div>
    </div>

    {{ $slot }}


</body>

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

@stack('auth-js')

</html>
