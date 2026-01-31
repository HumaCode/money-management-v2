<x-guest-layout>

    @push('auth-js')
        <script>
            // Focus state styling (sama logikanya dari login.html)
            document.querySelectorAll(".input-wrapper input").forEach((input) => {
                input.addEventListener("focus", () => {
                    input.closest(".input-wrapper").classList.add("focused");
                });
                input.addEventListener("blur", () => {
                    input.closest(".input-wrapper").classList.remove("focused");
                });
            });

            function handleForgotPassword() {
                const email = document.getElementById("email").value.trim();

                // Validasi kosong
                if (!email) {
                    document.getElementById("errorText").textContent =
                        "Please enter your email address.";
                    document.getElementById("errorMsg").classList.add("show");
                    return;
                }

                // Validasi format email sederhana
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    document.getElementById("errorText").textContent =
                        "Please enter a valid email address.";
                    document.getElementById("errorMsg").classList.add("show");
                    return;
                }

                // Demo: simulate API call
                // Ganti bagian ini dengan fetch/axios ke backend
                clearError();

                // Tampilkan success state
                document.getElementById("sentEmail").textContent = email;
                document.getElementById("formBody").classList.add("hidden");
                document.getElementById("successMsg").classList.add("show");
            }

            // Enter key trigger submit
            document.addEventListener("keydown", (e) => {
                if (e.key === "Enter") handleForgotPassword();
            });
        </script>
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

            <!-- Form body (tersembunyi saat success) -->
            <div class="form-body" id="formBody">
                <!-- Icon -->
                <div class="form-icon-wrap">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        <circle cx="12" cy="16" r="1" fill="var(--accent)" stroke="none" />
                    </svg>
                </div>

                <!-- Header -->
                <div class="form-header" style="margin-bottom: 32px">
                    <h1>Forgot password?</h1>
                    <p>
                        No problem. Just let us know your email address and we will email you a password reset link that
                        will allow you to choose a new one.
                    </p>
                </div>

                <!-- Session Status -->
                <x-auth-session-status class="mb-4" :status="session('status')" />

                <!-- Error -->
                <div class="error-msg" id="errorMsg">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span id="errorText">Something went wrong. Please try again.</span>
                </div>

                <form method="POST" action="{{ route('password.email') }}">
                    @csrf

                    <!-- Email input -->
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <div class="input-wrapper" id="emailWrapper">
                            <svg class="icon-left" viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <input type="email" name="email" id="email" placeholder="you@example.com"
                                autocomplete="off" autofocus />
                        </div>
                    </div>

                    <!-- Submit -->
                    <button class="btn-login" type="submit" style="margin-top: 8px">
                        Send Reset Link
                    </button>

                </form>

                <!-- Back to login text -->
                <div class="signup-link" style="margin-top: 28px">
                    Remember your password? <a href="{{ route('login') }}">Sign in</a>
                </div>
            </div>

            <!-- Success state (tersembunyi default) -->
            <div class="success-msg" id="successMsg">
                <div class="success-icon-wrap">
                    <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h3>Check your email</h3>
                <p>
                    We've sent a password reset link to
                    <strong id="sentEmail" style="color: var(--accent)"></strong>. Please
                    check your inbox.
                </p>
                <button class="{{ route('login') }}">
                    Back to Login
                </button>
            </div>
        </div>
    </div>

</x-guest-layout>
