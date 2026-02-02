<x-master-layout>

    @push('css')
        <link rel="stylesheet" href="{{ asset('/') }}assets/backend/css/category.css">
    @endpush

    @push('js')
        {{-- <script src="{{ asset('assets/backend/js/category.js') }}"></script> --}}

      
    @endpush

    <!-- Page Header -->
    <div class="page-header">
        <div class="page-title">
            <h2>Manage Categories</h2>
            <p>Organize your income and expense categories</p>
        </div>

        <a href="{{ route('category.create') }}" class="btn-primary action">
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
                    <input type="text" placeholder="Search categories..." id="searchInput" />
                </div>

                <div class="custom-select">
                    <select id="statusFilter">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div class="custom-select">
                    <select id="typeFilter">
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
                    <tr>
                        <td>
                            <div class="category-icon" style="background: rgba(125,211,168,0.15);">🍔</div>
                        </td>
                        <td>Food & Dining</td>
                        <td><span class="badge expense">Expense</span></td>
                        <td>—</td>
                        <td><span class="badge success">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action edit" onclick="openEditModal(1)" title="Edit">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button class="btn-action delete" onclick="deleteCategory(1)" title="Delete">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="category-icon" style="background: rgba(125,211,168,0.15);">🚗</div>
                        </td>
                        <td>Transportation</td>
                        <td><span class="badge expense">Expense</span></td>
                        <td>—</td>
                        <td><span class="badge success">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action edit" onclick="openEditModal(2)" title="Edit">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button class="btn-action delete" onclick="deleteCategory(2)" title="Delete">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="category-icon" style="background: rgba(125,211,168,0.15);">💰</div>
                        </td>
                        <td>Salary</td>
                        <td><span class="badge income">Income</span></td>
                        <td>—</td>
                        <td><span class="badge success">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action edit" onclick="openEditModal(3)" title="Edit">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button class="btn-action delete" onclick="deleteCategory(3)" title="Delete">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="category-icon" style="background: rgba(125,211,168,0.15);">🏠</div>
                        </td>
                        <td>Housing</td>
                        <td><span class="badge expense">Expense</span></td>
                        <td>—</td>
                        <td><span class="badge danger">Inactive</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action edit" onclick="openEditModal(4)" title="Edit">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button class="btn-action delete" onclick="deleteCategory(4)" title="Delete">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div class="category-icon" style="background: rgba(125,211,168,0.15);">🎮</div>
                        </td>
                        <td>Entertainment</td>
                        <td><span class="badge expense">Expense</span></td>
                        <td>—</td>
                        <td><span class="badge success">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action edit" onclick="openEditModal(5)" title="Edit">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button class="btn-action delete" onclick="deleteCategory(5)" title="Delete">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Table Footer -->
        <div class="table-footer">
            <div class="table-info">
                Showing 1 to 5 of 57 entries
            </div>
            <div class="pagination">
                <button disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button class="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>
                <button>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    </div>


</x-master-layout>
