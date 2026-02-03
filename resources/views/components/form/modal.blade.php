@props([
'size' => 'lg',
'title',
'action' => null,
'isEdit' => false,
])


<div class="modal">
    <div class="modal-header">
        <h3 id="modalTitle">
            {{ $isEdit ? "Edit $title" : "Add New $title" }}
        </h3>

        <button type="button" class="modal-close" onclick="closeModal()">
            <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    </div>

    <form id="form_action" action="{{ $action }}" method="POST">
        @csrf

        @if ($isEdit)
        @method('PUT')
        @endif

        <div class="modal-body">
            {{ $slot }}
        </div>

        @if ($action)
        <div class="modal-footer">
            <button type="button" class="btn-secondary" onclick="closeModal()">
                Cancel
            </button>

            <button type="submit" class="btn-primary">
                <svg viewBox="0 0 24 24">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                </svg>

                {{ $isEdit ? "Update $title" : "Save $title" }}
            </button>
        </div>
        @endif
    </form>
</div>
