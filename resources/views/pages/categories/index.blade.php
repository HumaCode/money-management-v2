<x-master-layout>

    @push('css')
    <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/category.css">
    @endpush

    @push('js')
    {{-- <script src="{{ asset('assets/backend/js/category.js') }}"></script> --}}

    <script>
        const dataTableId = 'table-category';

        handleAction(dataTableId, function () {
            initColorPicker();   // 🔴 INI WAJIB

            $('#name')?.focus();
        });

        window.dataTableId = @json($dataTableId);
        window.urlData = @json($dataUrl);
    </script>


    <script>
        /* =========================================================
         | GLOBAL STATE
         ========================================================= */
        const tableState = {
            search: null,
            status: null,
            type: null,
            per_page: 10,
            page: 1
        };

        /* =========================================================
         | MAIN AJAX LOADER
         ========================================================= */
        function loadData() {
            const $tbody = $('#tableBody');

            // loading placeholder
            $tbody.html(`
                <tr>
                    <td colspan="6" class="text-center py-6">
                        Loading...
                    </td>
                </tr>
            `);

            $.ajax({
                url: window.urlData,
                method: 'GET',
                data: {
                    search: tableState.search,
                    status: tableState.status,
                    type: tableState.type,
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
                }
            });
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
                html += `
                    <tr>
                        <td>
                            <div class="category-icon" style="background:${row.color_bg ?? 'rgba(125,211,168,0.15)'}">
                                ${row.icon ?? '—'}
                            </div>
                        </td>
                        <td>${row.name}</td>
                        <td>
                            <span class="badge ${row.type}">
                                ${row.type_label}
                            </span>
                        </td>
                        <td>${row.parent_name ?? '—'}</td>
                        <td>
                            <span class="badge ${row.is_active ? 'success' : 'danger'}">
                                ${row.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                ${row.actions ?? ''}
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
                    <td colspan="6" class="text-center py-6">
                        ${text}
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
        $(document).on('click', '.pagination button', function () {
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

        $('#searchInput').on('input', function () {
            tableState.search = this.value || null;
            debouncedReload();
        });

        $('#statusFilter').on('change', function () {
            tableState.status = this.value === 'all' ? null : this.value;
            debouncedReload();
        });

        $('#typeFilter').on('change', function () {
            tableState.type = this.value === 'all' ? null : this.value;
            debouncedReload();
        });

        $('#perPage').on('change', function () {
            tableState.per_page = Number(this.value);
            tableState.page = 1;
            loadData();
        });

        /* =========================================================
        | INITIAL LOAD (DELAYED)
         ========================================================= */
        $(window).on('load', function () {
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
            Add Category
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
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>

                <div class="custom-select">
                    <select id="typeFilter" name="type">
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
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
            <table>
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Parent</th>
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
                Showing 1 to 5 of 57 entries
            </div>

            {{--  pagination  --}}
            <div class="pagination">
                <button disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button class="active">1</button>
                <button>2</button>
                <button>..</button>
                <button>5</button>
                <button>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    </div>


</x-master-layout>
