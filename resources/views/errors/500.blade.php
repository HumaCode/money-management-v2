<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Server Error | MoneyFlow</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-deep: #0a0e1a;
            --bg-card: #111827;
            --bg-card-border: rgba(255,255,255,0.06);
            --text-primary: #f0f2f5;
            --text-secondary: #6b7280;
            --accent: #7dd3a8;
            --accent-glow: rgba(125,211,168,0.3);
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

        /* Glitch Effect Background */
        .bg-glitch {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }

        .glitch-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--error), transparent);
            opacity: 0;
            animation: glitchLine 8s linear infinite;
        }

        .glitch-line:nth-child(1) { animation-delay: 0s; top: 20%; }
        .glitch-line:nth-child(2) { animation-delay: 2s; top: 40%; }
        .glitch-line:nth-child(3) { animation-delay: 4s; top: 60%; }
        .glitch-line:nth-child(4) { animation-delay: 6s; top: 80%; }

        @keyframes glitchLine {
            0%, 90%, 100% {
                opacity: 0;
                transform: scaleX(0);
            }
            92%, 98% {
                opacity: 0.8;
                transform: scaleX(1);
            }
        }

        /* Main Container */
        .error-container {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 40px 20px;
            max-width: 700px;
            width: 100%;
        }

        /* 500 Number with Glitch */
        .error-code {
            font-size: 120px;
            font-weight: 700;
            line-height: 1;
            background: linear-gradient(135deg, var(--error) 0%, var(--warning) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            position: relative;
            animation: glitchText 5s infinite;
        }

        @keyframes glitchText {
            0%, 100% {
                transform: translate(0);
                filter: hue-rotate(0deg);
            }
            20% {
                transform: translate(-3px, 3px);
            }
            40% {
                transform: translate(3px, -3px);
            }
            60% {
                transform: translate(-3px, -3px);
                filter: hue-rotate(90deg);
            }
            80% {
                transform: translate(3px, 3px);
            }
        }

        /* Server Icon */
        .server-icon {
            width: 150px;
            height: 150px;
            margin: 0 auto 30px;
            position: relative;
            animation: serverShake 4s ease-in-out infinite;
        }

        @keyframes serverShake {
            0%, 100% {
                transform: rotate(0deg);
            }
            10%, 30%, 50%, 70%, 90% {
                transform: rotate(-2deg);
            }
            20%, 40%, 60%, 80% {
                transform: rotate(2deg);
            }
        }

        .server-icon svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 10px 40px rgba(248,113,113,0.4));
        }

        .server-body {
            fill: var(--bg-card);
            stroke: var(--error);
            stroke-width: 3;
        }

        .server-light {
            animation: blink 1s ease-in-out infinite;
        }

        .server-light.red {
            fill: var(--error);
        }

        .server-light.yellow {
            fill: var(--warning);
            animation-delay: 0.3s;
        }

        .server-light.green {
            fill: var(--accent);
            animation-delay: 0.6s;
        }

        @keyframes blink {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.3;
            }
        }

        .spark {
            animation: sparkFloat 2s ease-in-out infinite;
        }

        @keyframes sparkFloat {
            0%, 100% {
                transform: translate(0, 0) scale(1);
                opacity: 0;
            }
            50% {
                transform: translate(-20px, -20px) scale(1.5);
                opacity: 1;
            }
        }

        /* Text Content */
        .error-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
            animation: fadeIn 1s ease-out;
        }

        .error-message {
            font-size: 16px;
            color: var(--text-secondary);
            margin-bottom: 24px;
            line-height: 1.6;
            animation: fadeIn 1.2s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        /* Error Details */
        .error-details {
            background: var(--bg-card);
            border: 1px solid rgba(248,113,113,0.2);
            border-left: 4px solid var(--error);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 40px;
            text-align: left;
            animation: slideIn 1.4s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .error-details h3 {
            font-size: 16px;
            margin-bottom: 12px;
            color: var(--error);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .error-details p {
            color: var(--text-secondary);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 12px;
        }

        .error-details ul {
            list-style: none;
            padding: 0;
        }

        .error-details li {
            padding: 6px 0;
            color: var(--text-secondary);
            font-size: 13px;
            display: flex;
            align-items: start;
            gap: 10px;
        }

        .error-details li::before {
            content: "→";
            color: var(--error);
            font-weight: bold;
        }

        /* Buttons */
        .error-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeIn 1.6s ease-out;
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
            box-shadow: 0 10px 30px rgba(248,113,113,0.4);
        }

        .btn-secondary {
            background: var(--bg-card);
            color: var(--text-primary);
            border: 1px solid var(--bg-card-border);
        }

        .btn-secondary:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(-2px);
        }

        .btn svg {
            width: 20px;
            height: 20px;
        }

        /* Terminal-like footer */
        .terminal-footer {
            margin-top: 40px;
            padding: 16px;
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: var(--accent);
            text-align: left;
            animation: fadeIn 2s ease-out;
        }

        .terminal-footer::before {
            content: "> ";
            color: var(--error);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .error-code {
                font-size: 90px;
            }

            .server-icon {
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

            .server-icon {
                width: 100px;
                height: 100px;
            }

            .error-title {
                font-size: 22px;
            }

            .error-message {
                font-size: 14px;
            }

            .error-details {
                padding: 16px;
            }

            .terminal-footer {
                font-size: 10px;
            }
        }
    </style>
</head>
<body>
    <!-- Glitch Background -->
    <div class="bg-glitch">
        <div class="glitch-line"></div>
        <div class="glitch-line"></div>
        <div class="glitch-line"></div>
        <div class="glitch-line"></div>
    </div>

    <!-- Main Content -->
    <div class="error-container">
        <!-- Server Icon -->
        <div class="server-icon">
            <svg viewBox="0 0 200 200">
                <!-- Server Body -->
                <rect class="server-body" x="40" y="40" width="120" height="120" rx="8"/>
                
                <!-- Server Sections -->
                <line x1="40" y1="80" x2="160" y2="80" stroke="var(--error)" stroke-width="2"/>
                <line x1="40" y1="120" x2="160" y2="120" stroke="var(--error)" stroke-width="2"/>
                
                <!-- Server Lights -->
                <circle class="server-light red" cx="60" cy="60" r="5"/>
                <circle class="server-light yellow" cx="75" cy="60" r="5"/>
                <circle class="server-light green" cx="90" cy="60" r="5"/>
                
                <circle class="server-light red" cx="60" cy="100" r="5"/>
                <circle class="server-light yellow" cx="75" cy="100" r="5"/>
                <circle class="server-light green" cx="90" cy="100" r="5"/>
                
                <circle class="server-light red" cx="60" cy="140" r="5"/>
                <circle class="server-light yellow" cx="75" cy="140" r="5"/>
                <circle class="server-light green" cx="90" cy="140" r="5"/>
                
                <!-- Error Symbol -->
                <text x="130" y="70" font-size="24" fill="var(--error)" font-weight="bold">✕</text>
                <text x="130" y="110" font-size="24" fill="var(--error)" font-weight="bold">✕</text>
                <text x="130" y="150" font-size="24" fill="var(--error)" font-weight="bold">✕</text>
                
                <!-- Sparks -->
                <circle class="spark" cx="170" cy="50" r="3" fill="var(--warning)" opacity="0"/>
                <circle class="spark" cx="165" cy="45" r="2" fill="var(--error)" opacity="0" style="animation-delay: 0.5s"/>
                <circle class="spark" cx="175" cy="55" r="2" fill="var(--accent)" opacity="0" style="animation-delay: 1s"/>
            </svg>
        </div>

        <!-- Error Code -->
        <div class="error-code">500</div>

        <!-- Content -->
        <h1 class="error-title">Internal Server Error</h1>
        <p class="error-message">
            Oops! Something went wrong on our end. 
            Our servers encountered an unexpected error and couldn't complete your request.
        </p>

        <!-- Error Details -->
        <div class="error-details">
            <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                What happened?
            </h3>
            <p>Our technical team has been automatically notified and is working to fix this issue.</p>
            <ul>
                <li>Try refreshing the page in a few moments</li>
                <li>Clear your browser cache and cookies</li>
                <li>Check back later if the problem persists</li>
                <li>Contact support if you continue to experience issues</li>
            </ul>
        </div>

        <!-- Actions -->
        <div class="error-actions">
            <button onclick="location.reload()" class="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Refresh Page
            </button>
            <a href="/" class="btn btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Back to Home
            </a>
        </div>

        <!-- Terminal Footer -->
        <div class="terminal-footer">
            Error 500: Internal Server Error | Request ID: {{ Str::random(16) }} | Timestamp: {{ date('Y-m-d H:i:s') }}
        </div>
    </div>
</body>
</html>
