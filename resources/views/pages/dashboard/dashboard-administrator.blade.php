<x-master-layout>

    @push('css')
    {{--  <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/dashboard.css">  --}}
    @endpush

    @push('js')
    {{--  <script src="{{ asset('assets/backend/js/dashboard.js') }}"></script>  --}}
    @endpush

    <!-- Welcome Banner -->
    <div class="welcome-banner" data-aos="fade-down">
        <h2>Welcome back, John! 👋</h2>
        <p>Here's what's happening with your finances today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
            <div class="stat-card-header">
                <div class="stat-card-icon success">
                    <svg viewBox="0 0 24 24">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </div>
                <span class="stat-card-trend up">+12.5%</span>
            </div>
            <div class="stat-card-body">
                <h3>Rp 45,320,000</h3>
                <p>Total Balance</p>
            </div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
            <div class="stat-card-header">
                <div class="stat-card-icon primary">
                    <svg viewBox="0 0 24 24">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </svg>
                </div>
                <span class="stat-card-trend up">+8.2%</span>
            </div>
            <div class="stat-card-body">
                <h3>Rp 12,500,000</h3>
                <p>Income This Month</p>
            </div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
            <div class="stat-card-header">
                <div class="stat-card-icon error">
                    <svg viewBox="0 0 24 24">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                        <polyline points="17 18 23 18 23 12" />
                    </svg>
                </div>
                <span class="stat-card-trend down">-5.3%</span>
            </div>
            <div class="stat-card-body">
                <h3>Rp 8,750,000</h3>
                <p>Expenses This Month</p>
            </div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="400">
            <div class="stat-card-header">
                <div class="stat-card-icon warning">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <span class="stat-card-trend up">+15%</span>
            </div>
            <div class="stat-card-body">
                <h3>Rp 25,000,000</h3>
                <p>Savings Goals Progress</p>
            </div>
        </div>
    </div>

    <!-- Additional content placeholder -->
    <div style="
            height: 600px;
            background: var(--bg-card);
            border: 1px solid var(--bg-card-border);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
          " data-aos="fade-up">
        <h3 style="
              font-family: &quot;Cormorant Garamond&quot;, serif;
              font-size: 20px;
              margin-bottom: 16px;
            ">
            Recent Transactions
        </h3>
        <p style="color: var(--text-secondary); font-size: 14px">
            Transaction list will be displayed here...
        </p>
    </div>
</x-master-layout>
