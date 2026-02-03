<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found | MoneyFlow</title>
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

        .floating-shape {
            position: absolute;
            border-radius: 50%;
            opacity: 0.1;
            animation: float 20s infinite ease-in-out;
        }

        .shape-1 {
            width: 300px;
            height: 300px;
            background: var(--accent);
            top: -150px;
            left: -150px;
            animation-delay: 0s;
        }

        .shape-2 {
            width: 200px;
            height: 200px;
            background: var(--error);
            bottom: -100px;
            right: -100px;
            animation-delay: 3s;
        }

        .shape-3 {
            width: 150px;
            height: 150px;
            background: #3b82f6;
            top: 50%;
            right: 10%;
            animation-delay: 6s;
        }

        @keyframes float {
            0%, 100% {
                transform: translate(0, 0) rotate(0deg);
            }
            33% {
                transform: translate(30px, -50px) rotate(120deg);
            }
            66% {
                transform: translate(-20px, 20px) rotate(240deg);
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

        /* 404 Number */
        .error-code {
            font-size: 120px;
            font-weight: 700;
            line-height: 1;
            background: linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
            animation: glitch 3s infinite;
            position: relative;
        }

        @keyframes glitch {
            0%, 100% {
                transform: translate(0);
            }
            20% {
                transform: translate(-2px, 2px);
            }
            40% {
                transform: translate(-2px, -2px);
            }
            60% {
                transform: translate(2px, 2px);
            }
            80% {
                transform: translate(2px, -2px);
            }
        }

        /* Animated Icon */
        .error-icon {
            width: 140px;
            height: 140px;
            margin: 0 auto 30px;
            position: relative;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-20px);
            }
        }

        .error-icon svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 10px 30px var(--accent-glow));
        }

        .error-icon .search-circle {
            stroke: var(--accent);
            stroke-width: 3;
            fill: none;
            animation: rotate 4s linear infinite;
            transform-origin: center;
        }

        .error-icon .search-handle {
            stroke: var(--accent);
            stroke-width: 3;
            fill: none;
        }

        .error-icon .question-mark {
            fill: var(--accent);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.5;
                transform: scale(0.9);
            }
        }

        /* Text Content */
        .error-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
            animation: slideUp 0.6s ease-out;
        }

        .error-message {
            font-size: 16px;
            color: var(--text-secondary);
            margin-bottom: 30px;
            line-height: 1.6;
            animation: slideUp 0.8s ease-out;
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
            animation: slideUp 1s ease-out;
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
            background: var(--accent);
            color: var(--bg-deep);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px var(--accent-glow);
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

        /* Particles */
        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--accent);
            border-radius: 50%;
            opacity: 0.3;
            animation: particleFloat 15s infinite;
        }

        @keyframes particleFloat {
            0% {
                transform: translateY(100vh) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 0.3;
            }
            90% {
                opacity: 0.3;
            }
            100% {
                transform: translateY(-100px) translateX(100px);
                opacity: 0;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .error-code {
                font-size: 90px;
            }

            .error-icon {
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

            .error-icon {
                width: 100px;
                height: 100px;
            }

            .error-title {
                font-size: 22px;
            }

            .error-message {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <!-- Animated Background -->
    <div class="bg-animation">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
    </div>

    <!-- Particles -->
    <div class="particles" id="particles"></div>

    <!-- Main Content -->
    <div class="error-container">
        <!-- Animated Icon -->
        <div class="error-icon">
            <svg viewBox="0 0 200 200">
                <!-- Search Circle -->
                <circle class="search-circle" cx="80" cy="80" r="40"/>
                <!-- Search Handle -->
                <line class="search-handle" x1="110" y1="110" x2="140" y2="140"/>
                <!-- Question Mark -->
                <text class="question-mark" x="80" y="90" font-size="40" text-anchor="middle">?</text>
            </svg>
        </div>

        <!-- Error Code -->
        <div class="error-code">404</div>

        <!-- Content -->
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-message">
            Oops! The page you're looking for seems to have wandered off. 
            It might have been moved, deleted, or perhaps it never existed.
        </p>

        <!-- Actions -->
        <div class="error-actions">
            <a href="/" class="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Back to Home
            </a>
            <button onclick="history.back()" class="btn btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                </svg>
                Go Back
            </button>
        </div>
    </div>

    <script>
        // Create particles
        const particlesContainer = document.getElementById('particles');
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    </script>
</body>
</html>
