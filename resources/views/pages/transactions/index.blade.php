<x-master-layout>

    @push('css')
    @endpush

    @push('js')
        <script>
            const dataTableId = '{{ $dataTableId }}';

            handleAction(dataTableId, function() {
                $('#txAmount')?.focus();
            });

            handleDelete(dataTableId);

            window.dataTableId = @json($dataTableId);
            window.urlData = @json($dataUrl);
            window.urlEdit = @json($editUrl);
            window.urlDestroy = @json($destroyUrl);
        </script>

        <script>
            // GLOBAL STATE
            const tableState = {
                search: null,
                type: null,
                category_id: null,
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
                            <td><div class="skeleton skeleton-badge"></div></td>
                            <td><div class="skeleton skeleton-text short"></div></td>
                            <td><div class="skeleton skeleton-text short"></div></td>
                            <td><div class="skeleton skeleton-text short"></div></td>
                            <td><div class="skeleton skeleton-actions"></div></td>
                        </tr>
                    `;
                }

                $tbody.html(skeletonRows);
            }

            function loadData() {
                if (isLoading) return;
                isLoading = true;

                renderSkeleton(tableState.per_page > 10 ? 8 : 5);

                const params = {
                    search: tableState.search,
                    type: tableState.type,
                    category_id: tableState.category_id,
                    row_per_page: tableState.per_page,
                    page: tableState.page
                };

                $.ajax({
                    url: window.urlData,
                    type: 'GET',
                    data: params,
                    success: function(res) {
                        isLoading = false;

                        if (!res.success || !res.data) {
                            renderEmptyTable('Failed to load transaction data.');
                            return;
                        }

                        const rows = res.data.data || [];
                        const meta = res.data.meta || {};

                        renderTableRows(rows);
                        renderPagination(meta);
                        renderInfo(meta);
                    },
                    error: function(err) {
                        isLoading = false;
                        renderEmptyTable('An error occurred while fetching transactions.');
                    }
                });
            }

            function renderTableRows(rows) {
                const $tbody = $('#tableBody');
                $tbody.empty();

                if (!rows.length) {
                    renderEmptyTable('No transactions found');
                    return;
                }

                let html = '';

                rows.forEach(row => {
                    const finalEditUrl = window.urlEdit.replace('__ID__', row.id);
                    const finalDestroyUrl = window.urlDestroy.replace('__ID__', row.id);

                    const typeBadgeClass = row.type_badge_class || 'info';
                    const typeLabel = row.type_label || row.type;
                    const amountFormatted = row.amount_formatted || row.amount;
                    const dateFormatted = row.transaction_date_formatted || row.transaction_date;

                    let amountColor = 'var(--text-primary)';
                    if (row.type === 'income') amountColor = 'var(--success)';
                    else if (row.type === 'expense') amountColor = 'var(--error)';

                    let accountDisplay = row.account?.name ?? '—';
                    if (row.type === 'transfer' && row.to_account?.name) {
                        accountDisplay = `${row.account?.name ?? '—'} ➔ ${row.to_account.name}`;
                    }

                    html += `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="account-icon" style="background: rgba(255,255,255,0.06);">${row.type === 'transfer' ? '🔄' : (row.category?.icon ?? '💳')}</div>
                                <div>
                                    <div style="font-weight: 500;">${row.description ?? '—'}</div>
                                    <div style="font-size: 11px; color: var(--text-secondary);">${row.notes && row.notes !== '—' ? row.notes : ''}</div>
                                </div>
                            </div>
                        </td>

                        <td>
                            <span class="badge info">
                                ${accountDisplay}
                            </span>
                        </td>

                        <td>
                            <span class="badge secondary">
                                ${row.type === 'transfer' ? 'Transfer' : (row.category?.name ?? '—')}
                            </span>
                        </td>

                        <td>
                            <span class="badge ${typeBadgeClass}">
                                ${typeLabel}
                            </span>
                        </td>

                        <td style="font-weight: 600; color: ${amountColor};">
                            ${amountFormatted}
                        </td>

                        <td style="font-size: 13px; color: var(--text-primary);">
                            ${dateFormatted}
                        </td>

                        <td style="font-size: 12px; color: var(--text-secondary);">
                            ${row.reference_number ?? '—'}
                        </td>

                        <td>
                            <div class="action-buttons">
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

            function renderEmptyTable(message = 'No data available') {
                const $tbody = $('#tableBody');
                $tbody.html(`
                    <tr>
                        <td colspan="8">
                            <div class="empty-state">
                                <p>${message}</p>
                            </div>
                        </td>
                    </tr>
                `);
                $('#paginationInfo').text('Showing 0 to 0 of 0 entries');
                $('.pagination').empty();
            }

            function renderInfo(meta) {
                if (!meta || !meta.total) {
                    $('#paginationInfo').text('Showing 0 to 0 of 0 entries');
                    return;
                }
                $('#paginationInfo').text(
                    `Showing ${meta.from || 0} to ${meta.to || 0} of ${meta.total || 0} entries`
                );
            }

            function renderPagination(meta) {
                const $pagination = $('.pagination');
                $pagination.empty();

                const current = meta.current_page;
                const last = meta.last_page;

                if (!last || last <= 1) return;

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

            const debouncedReload = _.debounce(() => {
                tableState.page = 1;
                loadData();
            }, 400);

            $('#searchInput').on('input', function() {
                tableState.search = this.value || null;
                debouncedReload();
            });

            $('#typeFilter').on('change', function() {
                tableState.type = this.value === 'all' ? null : this.value;
                debouncedReload();
            });

            $('#categoryFilter').on('change', function() {
                tableState.category_id = this.value === 'all' ? null : this.value;
                debouncedReload();
            });

            $('#perPage').on('change', function() {
                tableState.per_page = Number(this.value);
                tableState.page = 1;
                loadData();
            });

            function reloadTable() {
                tableState.search = null;
                tableState.type = null;
                tableState.category_id = null;
                tableState.page = 1;

                $('#typeFilter').val('all');
                $('#categoryFilter').val('all');
                $('#searchInput').val('');

                loadData();
            }

            $(window).on('load', function() {
                setTimeout(() => {
                    loadData();
                }, 400);
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
            Add Transaction
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
                    <input type="text" name="search" placeholder="Search transactions..." id="searchInput" />
                </div>

                <div class="custom-select">
                    <select id="typeFilter" name="type">
                        <option value="all">All Types</option>
                        <option value="income">Income (Pemasukan)</option>
                        <option value="expense">Expense (Pengeluaran)</option>
                        <option value="transfer">Transfer</option>
                    </select>
                </div>

                <div class="custom-select">
                    <select id="categoryFilter" name="category_id">
                        <option value="all">All Categories</option>
                        @foreach ($formData['CategoryList'] ?? [] as $cat)
                            <option value="{{ $cat['id'] }}">{{ $cat['icon'] ?? '🏷️' }} {{ $cat['name'] }}</option>
                        @endforeach
                    </select>
                </div>

                <button type="button" onclick="reloadTable()" class="btn-icon" title="Reload Table">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                </button>
            </div>

            <div class="table-controls-right">
                <div class="custom-select">
                    <select id="perPage" name="per_page">
                        <option value="10">Show 10</option>
                        <option value="25">Show 25</option>
                        <option value="50">Show 50</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Table Wrapper -->
        <div class="table-wrapper">
            <table id="{{ $dataTableId }}">
                <thead>
                    <tr>
                        <th>TRANSACTION</th>
                        <th>ACCOUNT</th>
                        <th>CATEGORY</th>
                        <th>TYPE</th>
                        <th>AMOUNT</th>
                        <th>DATE</th>
                        <th>REF NO</th>
                        <th style="text-align: right;">ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    <!-- Dynamic Rows -->
                </tbody>
            </table>
        </div>

        <!-- Table Footer -->
        <div class="table-footer">
            <div class="table-info" id="paginationInfo">Showing 0 to 0 of 0 entries</div>
            <div class="pagination"></div>
        </div>

    </div>

</x-master-layout>
