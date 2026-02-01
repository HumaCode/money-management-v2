<x-guest-layout>

    @push('auth-js')
        <script src="{{ asset('/') }}assets/auth/js/login-script.js"></script>
    @endpush

    <div class="container">
        <!-- Left: Branding -->
        <div class="panel-brand">
            <div class="brand-logo">
                <svg viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="10" fill="#7dd3a8" opacity="0.15" />
                    <path d="M10 24 L16 16 L21 20 L27 10" stroke="#7dd3a8" stroke-width="2.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <circle cx="27" cy="10" r="2.5" fill="#7dd3a8" />
                </svg>
                <span class="brand-name">Money<span>Flow</span></span>
            </div>

            <div class="brand-tagline">
                <h2>Take control of<br /><em>your finances</em></h2>
                <p>
                    A smarter way to track, budget, and grow your wealth — all in one
                    elegant dashboard.
                </p>
            </div>

            <div class="brand-features">
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div class="feature-text">
                        <h4>Real-time Tracking</h4>
                        <p>Monitor every transaction instantly</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <div class="feature-text">
                        <h4>Smart Budgeting</h4>
                        <p>Set goals and stay on track</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div class="feature-text">
                        <h4>Secure & Private</h4>
                        <p>Bank-level encryption on all data</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Login Form -->
        <div class="panel-form">
            <div class="form-header">
                <h1>Welcome back</h1>
                <p>Sign in to your MoneyFlow account</p>
            </div>

            <!-- Session Status -->
            <x-auth-session-status class="mb-4" :status="session('status')" />

            <div class="error-msg" id="errorMsg">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span id="errorText">Username or password is incorrect.</span>
            </div>

            <form id="loginForm" method="POST" data-url="{{ route('login') }}">
                @csrf

                <div class="form-group">
                    <label for="identity">Username</label>
                    <div class="input-wrapper" id="usernameWrapper">
                        <svg class="icon-left" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input type="text" id="identity" name="identity" autofocus placeholder="Enter your username"
                            autocomplete="off" />
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-wrapper" id="passwordWrapper">
                        <svg class="icon-left" viewBox="0 0 24 24">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input type="password" id="password" name="password" placeholder="Enter your password"
                            autocomplete="off" />
                        <button class="toggle-password" type="button" onclick="togglePassword()"
                            aria-label="Toggle password visibility">
                            <!-- Eye icon (visible state) -->
                            <svg id="eyeIcon" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <label class="remember-me">
                        <input type="checkbox" name="remember" id="rememberMe" />
                        <span>Remember me</span>
                    </label>

                    @if (Route::has('password.request'))
                        <a href="{{ route('password.request') }}" class="forgot-link">Forgot password?</a>
                    @endif
                </div>
                <button type="submit" class="btn-login">Sign In</button>

            </form>
            <div class="signup-link">
                Don't have an account? <a href="{{ route('register') }}">Sign up</a>
            </div>
        </div>

    </div>
</x-guest-layout>
