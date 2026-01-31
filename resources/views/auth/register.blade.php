<x-guest-layout>

    @push('auth-js')
        <script>
            // Focus state styling
            document.querySelectorAll(".input-wrapper input").forEach((input) => {
                input.addEventListener("focus", () => {
                    input.closest(".input-wrapper").classList.add("focused");
                });
                input.addEventListener("blur", () => {
                    input.closest(".input-wrapper").classList.remove("focused");
                });
            });

            // Toggle password visibility
            const passwordVisibility = {
                password: false,
                confirmPassword: false,
            };

            function togglePassword(fieldId, iconId) {
                passwordVisibility[fieldId] = !passwordVisibility[fieldId];
                const input = document.getElementById(fieldId);
                const icon = document.getElementById(iconId);

                input.type = passwordVisibility[fieldId] ? "text" : "password";

                if (passwordVisibility[fieldId]) {
                    // Eye-off icon
                    icon.innerHTML = `
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    `;
                } else {
                    // Eye icon
                    icon.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    `;
                }
            }

            // Password strength checker
            function checkPasswordStrength() {
                const password = document.getElementById("password").value;
                const strengthDiv = document.getElementById("passwordStrength");
                const strengthFill = document.getElementById("strengthFill");
                const strengthText = document.getElementById("strengthText");

                if (password.length === 0) {
                    strengthDiv.classList.remove("show");
                    return;
                }

                strengthDiv.classList.add("show");

                let strength = 0;
                if (password.length >= 8) strength++;
                if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
                if (/\d/.test(password)) strength++;
                if (/[^a-zA-Z0-9]/.test(password)) strength++;

                strengthFill.className = "strength-fill";

                if (strength <= 1) {
                    strengthFill.classList.add("weak");
                    strengthText.textContent = "Weak password";
                    strengthText.style.color = "var(--error)";
                } else if (strength <= 2) {
                    strengthFill.classList.add("medium");
                    strengthText.textContent = "Medium strength";
                    strengthText.style.color = "#f59e0b";
                } else {
                    strengthFill.classList.add("strong");
                    strengthText.textContent = "Strong password";
                    strengthText.style.color = "var(--accent)";
                }

                clearError();
            }
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
                <h2>Start your journey to<br /><em>financial freedom</em></h2>
                <p>
                    Join thousands of users who have already transformed their financial
                    lives with MoneyFlow.
                </p>
            </div>

            <div class="brand-features">
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div class="feature-text">
                        <h4>Quick Setup</h4>
                        <p>Get started in under 2 minutes</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <div class="feature-text">
                        <h4>100% Secure</h4>
                        <p>Your data is encrypted end-to-end</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div class="feature-text">
                        <h4>Multi-Platform</h4>
                        <p>Access anywhere, anytime</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Register Form -->
        <div class="panel-form">
            <!-- Form body (tersembunyi saat success) -->
            <div class="form-body" id="formBody">
                <div class="form-header">
                    <h1>Create account</h1>
                    <p>Start managing your finances smarter</p>
                </div>

                <!-- Error message -->
                <div class="error-msg" id="errorMsg">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span id="errorText">Something went wrong. Please try again.</span>
                </div>

                <form method="POST" action="{{ route('register') }}">
                    @csrf


                    <!-- Name -->
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <div class="input-wrapper" id="nameWrapper">
                            <svg class="icon-left" viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <input type="text" name="name" autofocus id="name" placeholder="John Doe"
                                autocomplete="off" />
                        </div>
                    </div>

                    <!-- Username -->
                    <div class="form-group">
                        <label for="username">Username</label>
                        <div class="input-wrapper" id="usernameWrapper">
                            <svg class="icon-left" viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <input type="text" name="username" id="username" placeholder="johndoe"
                                autocomplete="off" />
                        </div>
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <div class="input-wrapper" id="emailWrapper">
                            <svg class="icon-left" viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <input type="email" name="email" id="email" placeholder="you@example.com"
                                autocomplete="off" />
                        </div>
                    </div>

                    <!-- Password -->
                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper" id="passwordWrapper">
                            <svg class="icon-left" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input type="password" name="password" id="password"
                                placeholder="Create a strong password" autocomplete="off"
                                oninput="checkPasswordStrength()" />
                            <button class="toggle-password" type="button"
                                onclick="togglePassword('password', 'eyeIconPassword')"
                                aria-label="Toggle password visibility">
                                <svg id="eyeIconPassword" viewBox="0 0 24 24">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </button>
                        </div>
                        <!-- Password strength indicator -->
                        <div class="password-strength" id="passwordStrength">
                            <div class="strength-bar">
                                <div class="strength-fill" id="strengthFill"></div>
                            </div>
                            <span class="strength-text" id="strengthText"></span>
                        </div>
                    </div>

                    <!-- Confirm Password -->
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <div class="input-wrapper" id="confirmPasswordWrapper">
                            <svg class="icon-left" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input type="password" name="password_confirmation" id="confirmPassword"
                                placeholder="Re-enter your password" autocomplete="off" />
                            <button class="toggle-password" type="button"
                                onclick="togglePassword('confirmPassword', 'eyeIconConfirm')"
                                aria-label="Toggle password visibility">
                                <svg id="eyeIconConfirm" viewBox="0 0 24 24">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Terms & Conditions -->
                    <div class="terms-check">
                        <input type="checkbox" id="terms" />
                        <label for="terms">
                            I agree to the <a href="#">Terms of Service</a> and
                            <a href="#">Privacy Policy</a>
                        </label>
                    </div>

                    <!-- Submit button -->
                    <button class="btn-login" type="submit">
                        Create Account
                    </button>

                </form>

                <!-- Sign in link -->
                <div class="signup-link">
                    Already have an account? <a href="{{ route('login') }}">Sign in</a>
                </div>
            </div>

            <!-- Success state (tersembunyi default) -->
            <div class="success-msg" id="successMsg">
                <div class="success-icon-wrap">
                    <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h3>Account created!</h3>
                <p>
                    Welcome to MoneyFlow! Your account has been successfully created. Let's
                    get started.
                </p>
                <button class="{{ route('login') }}">Go to Login</button>
            </div>
        </div>
    </div>
</x-guest-layout>
