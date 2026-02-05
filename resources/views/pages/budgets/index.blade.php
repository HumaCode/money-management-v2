<x-master-layout>

    @push('css')
        <style>
            .color-picker-wrapper {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .color-picker-wrapper input[type="color"] {
                width: 44px;
                height: 36px;
                padding: 0;
                border-radius: 6px;
                flex-shrink: 0;
                /* PENTING */
                cursor: pointer;
            }

            .color-picker-wrapper input[type="range"] {
                flex: 1;
                /* biar slider fleksibel */
            }

            .color-picker-wrapper input[type="text"] {
                width: 150px;
                /* pastikan RGBA kebaca penuh */
                flex-shrink: 0;
            }
        </style>
    @endpush

    @push('js')
        {{-- <script src="{{ asset('assets/backend/js/category.js') }}"></script> --}}

        <script>
            const dataTableId = '{{ $dataTableId }}';

            handleAction(dataTableId, function() {


                $('#name')?.focus();
            });

            handleDelete(dataTableId);

            window.dataTableId = @json($dataTableId);
            window.urlData = @json($dataUrl);
            window.urlEdit = @json($editUrl);
            window.urlShow = @json($showUrl);
            window.urlDestroy = @json($destroyUrl);
        </script>


        <script>
            // GLOBAL STATE
            const tableState = {
                search: null,
                status: null,
                period: null,
                per_page: 10,
                page: 1
            };

            let isLoading = false;

            function renderSkeleton(rows = 5) {
                const $tbody = $('#tableBody');

                let skeletonRows = '';
                for (let i = 0; i < rows; i++) {
                    skeletonRows += `
                        <tr class="skeleton-row">
                            <td><div class="skeleton skeleton-icon"></div></td>
                            <td><div class="skeleton skeleton-text"></div></td>
                            <td><div class="skeleton skeleton-badge"></div></td>
                            <td><div class="skeleton skeleton-text short"></div></td>
                            <td><div class="skeleton skeleton-badge"></div></td>
                            <td><div class="skeleton skeleton-actions"></div></td>
                        </tr>
                    `;
                }

                $tbody.html(skeletonRows);
            }

            /* =========================================================
             | MAIN AJAX LOADER
             ========================================================= */
            function loadData() {
                const $tbody = $('#tableBody');
                if (isLoading) return;

                isLoading = true;

                renderSkeleton(5);


                $.ajax({
                    url: window.urlData,
                    method: 'GET',
                    data: {
                        search: tableState.search,
                        status: tableState.status,
                        period: tableState.period,
                        row_per_page: tableState.per_page,
                        page: tableState.page
                    },
                    success(res) {
                        if (!res.success) {
                            renderEmpty('Failed to load data');
                            return;
                        }

                        const rows = res.data.data;
                        const meta = res.data.meta;

                        renderTable(rows);
                        renderInfo(meta);
                        renderPagination(meta);
                    },
                    error() {
                        renderEmpty('Error loading data');
                    },
                    complete() {
                        isLoading = false;
                    }
                });
            }

            function formatDateRange(startDate, endDate) {
                if (!startDate || !endDate) return '-';

                const start = new Date(startDate);
                const end = new Date(endDate);

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov',
                    'Dec'
                ];

                const sameYear = start.getFullYear() === end.getFullYear();

                if (sameYear) {
                    return `${months[start.getMonth()]} ${start.getDate()} - ` +
                        `${months[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
                }

                return `${months[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ` +
                    `${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
            }

            function formatCurrency(amount, currency = 'IDR') {
                if (amount === null || amount === undefined || isNaN(amount)) {
                    return '-';
                }

                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(amount);
            }

            function normalizePercentage(value) {
                if (value === null || value === undefined || isNaN(value)) {
                    return 0;
                }

                return Math.min(Math.max(value, 0), 100);
            }

            function renderProgress(spent, percentage) {
                const percent = normalizePercentage(percentage);

                return `
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percent}%;"></div>
                            </div>
                            <div class="progress-text">
                                ${formatCurrency(spent)} (${Math.round(percent)}%)
                            </div>
                        `;
            }

            /* =========================================================
             | TABLE RENDER
             ========================================================= */
            function renderTable(rows) {

                const $tbody = $('#tableBody');


                if (!rows || rows.length === 0) {
                    renderEmpty('No data available');
                    return;
                }

                let html = '';

                rows.forEach(row => {


                    const finalEditUrl = window.urlEdit.replace('__ID__', row.id);
                    const finalShowUrl = window.urlShow.replace('__ID__', row.id);
                    const finalDestroyUrl = window.urlDestroy.replace('__ID__', row.id);



                    html += `
                    <tr>
                        <td>
                            <div style="font-weight: 500;">${row.name}</div>
                            <div style="font-size: 11px; color: var(--text-secondary);">
                               ${formatDateRange(row.start_date, row.end_date)}
                            </div>
                        </td>

                        <td>
                            <span class="badge info">
                                ${row.period}
                            </span>
                        </td>

                        <td>
                            ${formatCurrency(row.total_amount)}
                        </td>

                        <td>
                            ${renderProgress(row.spent_amount, row.progress_percentage)}
                        </td>

                        
                        <td>
                            <span class="badge ${row.is_active ? 'success' : 'danger'}">
                                ${row.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                ${row.actions ?? ''}

                                
                                <a href="${finalEditUrl}" class="btn-action edit action" title="Edit"> 
                                    <svg viewBox="0 0 24 24"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /> 
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /> </svg> 
                                </a> 
                                
                                <a href="${finalDestroyUrl}" class="btn-action delete" title="Delete"> 
                                    <svg viewBox="0 0 24 24"> <polyline points="3 6 5 6 21 6" /> 
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> </svg> 
                                </a>
                            </div>
                        </td>
                    </tr>
                `;
                });

                $tbody.html(html);
            }

            function renderEmpty(text) {
                $('#tableBody').html(`
                    <tr>
                        <td colspan="6">
                            <div class="empty-state">
                                <div class="empty-icon">
                                    ⚠️
                                </div>
                                <div class="empty-text">
                                    ${text}
                                </div>
                            </div>
                        </td>
                    </tr>
                `);
            }


            /* =========================================================
             | INFO FOOTER
             ========================================================= */
            function renderInfo(meta) {
                $('.table-info').text(
                    `Showing ${meta.from} to ${meta.to} of ${meta.total} entries`
                );
            }

            /* =========================================================
             | PAGINATION (COMPACT & SAFE)
             ========================================================= */
            function renderPagination(meta) {
                const $pagination = $('.pagination');
                $pagination.empty();

                const current = meta.current_page;
                const last = meta.last_page;

                // Prev
                $pagination.append(paginationButton('prev', current === 1));

                let pages = [];

                if (last <= 5) {
                    pages = [...Array(last).keys()].map(i => i + 1);
                } else {
                    if (current <= 3) {
                        pages = [1, 2, 3, '...', last];
                    } else if (current >= last - 2) {
                        pages = [1, '...', last - 2, last - 1, last];
                    } else {
                        pages = [1, '...', current, '...', last];
                    }
                }

                pages.forEach(p => {
                    if (p === '...') {
                        $pagination.append(`<button disabled>...</button>`);
                    } else {
                        $pagination.append(
                            paginationButton(p, false, p === current)
                        );
                    }
                });

                // Next
                $pagination.append(paginationButton('next', current === last));
            }

            function paginationButton(page, disabled = false, active = false) {
                let label = page;
                if (page === 'prev') label = '‹';
                if (page === 'next') label = '›';

                return `
                <button
                    data-page="${page}"
                    ${disabled ? 'disabled' : ''}
                    class="${active ? 'active' : ''}">
                    ${label}
                </button>
            `;
            }

            /* =========================================================
             | PAGINATION CLICK
             ========================================================= */
            $(document).on('click', '.pagination button', function() {
                const page = $(this).data('page');

                if (page === 'prev' && tableState.page > 1) {
                    tableState.page--;
                } else if (page === 'next') {
                    tableState.page++;
                } else if (!isNaN(page)) {
                    tableState.page = Number(page);
                }

                loadData();
            });

            /* =========================================================
             | SEARCH & FILTER (LODASH DEBOUNCE)
             ========================================================= */
            const debouncedReload = _.debounce(() => {
                tableState.page = 1;
                loadData();
            }, 400);

            $('#searchInput').on('input', function() {
                tableState.search = this.value || null;
                debouncedReload();
            });

            $('#statusFilter').on('change', function() {
                const value = this.value;


                tableState.status = value === 'all' ? null : value;

                debouncedReload();
            });

            $('#periodFilter').on('change', function() {
                tableState.period = this.value === 'all' ? null : this.value;
                debouncedReload();
            });

            $('#perPage').on('change', function() {
                tableState.per_page = Number(this.value);
                tableState.page = 1;
                loadData();
            });

            // reload button
            function reloadTable() {
                // reset filter state
                tableState.search = null;
                tableState.status = null;
                tableState.period = null;
                tableState.page = 1;

                // reset UI select
                $('#statusFilter').val('all').trigger('change');
                $('#periodFilter').val('all').trigger('change');

                $('#searchInput').val('');

                loadData();

                Swal.fire({
                    icon: 'success',
                    title: 'Reloaded',
                    text: 'Table data refreshed',
                    timer: 1000,
                    showConfirmButton: false
                });
            }

            /* =========================================================
            | INITIAL LOAD (DELAYED)
             ========================================================= */
            $(window).on('load', function() {
                setTimeout(() => {
                    loadData();
                }, 600);
            });
        </script>
    @endpush

    <!-- Page Header -->
    <div class="page-header">
        <div class="page-title">
            <h2>{{ $title }}</h2>
            <p>{{ $subtitle }}</p>
        </div>

        <a href="{{ $createUrl }}" class="btn-primary action" style="text-decoration: none;">
            <svg viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Data
        </a>

    </div>

    <!-- Table Card -->
    <div class="table-card" data-aos="fade-up">

        <!-- Table Controls -->
        <div class="table-controls">
            <div class="table-controls-left">
                <div class="search-box">
                    <svg viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input type="text" name="search" placeholder="Search..." id="searchInput" />
                </div>

                <div class="custom-select">
                    <select id="statusFilter" name="status">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div class="custom-select">
                    <select id="periodFilter" name="period">
                        <option value="all">All Periods</option>

                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>

                    </select>
                </div>

                <button class="btn-icon" onclick="reloadTable()" title="Reload">
                    <svg viewBox="0 0 24 24">
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                </button>
            </div>

            <div class="table-controls-right">
                <div class="custom-select">
                    <select id="perPage">
                        <option value="10">Show 10</option>
                        <option value="25">Show 25</option>
                        <option value="50">Show 50</option>
                        <option value="100">Show 100</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
            <table id="{{ $dataTableId }}">
                <thead>
                    <tr>
                        <th>Budget Name</th>
                        <th>Period</th>
                        <th>Total Amount</th>
                        <th>Spent / Progress</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="tableBody">

                </tbody>
            </table>
        </div>

        <!-- Table Footer -->
        <div class="table-footer">

            {{--  info  --}}
            <div class="table-info">
            </div>

            {{--  pagination  --}}
            <div class="pagination">

            </div>
        </div>
    </div>


</x-master-layout>
