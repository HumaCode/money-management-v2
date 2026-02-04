<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Access Forbidden | MoneyFlow</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-deep: #0a0e1a;
            --bg-card: #111827;
            --bg-card-border: rgba(255, 255, 255, 0.06);
            --text-primary: #f0f2f5;
            --text-secondary: #6b7280;
            --accent: #7dd3a8;
            --accent-glow: rgba(125, 211, 168, 0.3);
            --error: #f87171;
            --warning: #f59e0b;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg-deep);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
            overflow-y: auto;
            position: relative;
            padding: 20px 0;
        }

        /* Hide scrollbar but keep functionality */
        body::-webkit-scrollbar {
            display: none;
        }

        body {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        /* Animated Background */
        .bg-animation {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }

        .wave {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 200%;
            height: 200px;
            background: linear-gradient(90deg, transparent, rgba(248, 113, 113, 0.1), transparent);
            animation: wave 8s linear infinite;
        }

        .wave:nth-child(2) {
            animation-delay: 2s;
            opacity: 0.5;
        }

        .wave:nth-child(3) {
            animation-delay: 4s;
            opacity: 0.3;
        }

        @keyframes wave {
            0% {
                transform: translateX(0);
            }

            100% {
                transform: translateX(-50%);
            }
        }

        /* Main Container */
        .error-container {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 40px 20px;
            max-width: 600px;
            width: 100%;
        }

        /* 403 Number */
        .error-code {
            font-size: 120px;
            font-weight: 700;
            line-height: 1;
            background: linear-gradient(135deg, var(--error) 0%, var(--warning) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            animation: fadeInScale 0.8s ease-out;
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.8);
            }

            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        /* Lock Icon */
        .lock-icon {
            width: 140px;
            height: 140px;
            margin: 0 auto 30px;
            position: relative;
            animation: lockShake 0.6s ease-out;
        }

        @keyframes lockShake {

            0%,
            100% {
                transform: translateX(0);
            }

            10%,
            30%,
            50%,
            70%,
            90% {
                transform: translateX(-5px);
            }

            20%,
            40%,
            60%,
            80% {
                transform: translateX(5px);
            }
        }

        .lock-icon svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 10px 30px rgba(248, 113, 113, 0.3));
        }

        .lock-body {
            fill: none;
            stroke: var(--error);
            stroke-width: 4;
            animation: pulseStroke 2s ease-in-out infinite;
        }

        .lock-shackle {
            fill: none;
            stroke: var(--error);
            stroke-width: 4;
            animation: pulseStroke 2s ease-in-out infinite;
            animation-delay: 0.5s;
        }

        .lock-keyhole {
            fill: var(--error);
            animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes pulseStroke {

            0%,
            100% {
                stroke-opacity: 1;
            }

            50% {
                stroke-opacity: 0.5;
            }
        }

        @keyframes glowPulse {

            0%,
            100% {
                filter: drop-shadow(0 0 5px var(--error));
            }

            50% {
                filter: drop-shadow(0 0 15px var(--error));
            }
        }

        /* Warning Shield */
        .warning-shield {
            position: absolute;
            top: 10px;
            right: 10px;
            animation: floatShield 3s ease-in-out infinite;
        }

        @keyframes floatShield {

            0%,
            100% {
                transform: translateY(0) rotate(0deg);
            }

            50% {
                transform: translateY(-10px) rotate(5deg);
            }
        }

        /* Text Content */
        .error-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
            animation: slideUp 0.6s ease-out;
            animation-delay: 0.2s;
            animation-fill-mode: backwards;
        }

        .error-message {
            font-size: 16px;
            color: var(--text-secondary);
            margin-bottom: 20px;
            line-height: 1.6;
            animation: slideUp 0.8s ease-out;
            animation-delay: 0.4s;
            animation-fill-mode: backwards;
        }

        .error-reasons {
            background: var(--bg-card);
            border: 1px solid var(--bg-card-border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 40px;
            text-align: left;
            animation: slideUp 1s ease-out;
            animation-delay: 0.6s;
            animation-fill-mode: backwards;
        }

        .error-reasons h3 {
            font-size: 16px;
            margin-bottom: 16px;
            color: var(--text-primary);
        }

        .error-reasons ul {
            list-style: none;
            padding: 0;
        }

        .error-reasons li {
            padding: 8px 0;
            color: var(--text-secondary);
            font-size: 14px;
            display: flex;
            align-items: start;
            gap: 12px;
        }

        .error-reasons li::before {
            content: "⚠️";
            flex-shrink: 0;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Buttons */
        .error-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            animation: slideUp 1.2s ease-out;
            animation-delay: 0.8s;
            animation-fill-mode: backwards;
        }

        .btn {
            padding: 14px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
        }

        .btn-primary {
            background: var(--error);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(248, 113, 113, 0.4);
        }

        .btn-secondary {
            background: var(--bg-card);
            color: var(--text-primary);
            border: 1px solid var(--bg-card-border);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-2px);
        }

        .btn svg {
            width: 20px;
            height: 20px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .error-code {
                font-size: 90px;
            }

            .lock-icon {
                width: 120px;
                height: 120px;
            }

            .error-title {
                font-size: 28px;
            }

            .error-message {
                font-size: 15px;
            }

            .error-actions {
                flex-direction: column;
                align-items: stretch;
            }

            .btn {
                justify-content: center;
            }
        }

        @media (max-width: 480px) {
            .error-code {
                font-size: 70px;
            }

            .lock-icon {
                width: 100px;
                height: 100px;
            }

            .error-title {
                font-size: 22px;
            }

            .error-message {
                font-size: 14px;
            }

            .error-reasons {
                padding: 16px;
            }

            .error-reasons li {
                font-size: 13px;
            }
        }
    </style>
</head>

<body>
    <!-- Animated Background -->
    <div class="bg-animation">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
    </div>

    <!-- Main Content -->
    <div class="error-container">
        <!-- Lock Icon -->
        <div class="lock-icon">
            <svg viewBox="0 0 200 200">
                <!-- Lock Shackle -->
                <path class="lock-shackle" d="M 60 80 Q 60 30, 100 30 Q 140 30, 140 80" />

                <!-- Lock Body -->
                <rect class="lock-body" x="50" y="80" width="100" height="80" rx="10" />

                <!-- Keyhole -->
                <circle class="lock-keyhole" cx="100" cy="110" r="10" />
                <rect class="lock-keyhole" x="95" y="120" width="10" height="20" rx="2" />

                <!-- Warning Shield -->
                <g class="warning-shield">
                    <path d="M 170 20 L 180 30 L 170 40 L 160 30 Z" fill="var(--warning)" opacity="0.8" />
                    <text x="170" y="35" font-size="12" fill="white" text-anchor="middle" font-weight="bold">!</text>
                </g>
            </svg>
        </div>

        <!-- Error Code -->
        <div class="error-code">403</div>

        <!-- Content -->
        <h1 class="error-title">Access Forbidden</h1>
        <p class="error-message">
            You don't have permission to access this resource.
            This area is restricted and requires proper authorization.
        </p>

        <!-- Reasons -->
        <div class="error-reasons">
            <h3>Possible reasons:</h3>
            <ul>
                <li>You are not logged in or your session has expired</li>
                <li>You don't have sufficient privileges to access this page</li>
                <li>The resource is restricted to certain user roles</li>
                <li>Your account may have been suspended or deactivated</li>
            </ul>
        </div>

        <!-- Actions -->
        <div class="error-actions">
            <a href="{{ url('/') }}" class="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Back to Home
            </a>
            <a href="{{ route('login') }}" class="btn btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Login
            </a>
        </div>
    </div>
</body>

</html>
