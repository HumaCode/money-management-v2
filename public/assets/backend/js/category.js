// Category Modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').classList.add('show');
  }

  function openEditModal(id) {
    document.getElementById('modalTitle').textContent = 'Edit Category';
    // Populate form with existing data
    document.getElementById('categoryName').value = 'Food & Dining';
    document.getElementById('categoryType').value = 'expense';
    document.getElementById('categoryIcon').value = '🍔';
    document.getElementById('categoryColor').value = '#7dd3a8';
    document.getElementById('categoryColorHex').value = '#7dd3a8';
    document.getElementById('categoryStatus').value = 'active';

    document.getElementById('categoryModal').classList.add('show');
  }

  function closeModal() {
    document.getElementById('categoryModal').classList.remove('show');
  }

  document.getElementById('categoryModal').addEventListener('click', function(event) {
    if (event.target === this) closeModal();
  });

  // Color picker sync
  document.getElementById('categoryColor').addEventListener('input', function(e) {
    document.getElementById('categoryColorHex').value = e.target.value;
  });

  document.getElementById('categoryColorHex').addEventListener('input', function(e) {
    document.getElementById('categoryColor').value = e.target.value;
  });

  // Save Category
  function saveCategory() {
    const form = document.getElementById('categoryForm');
    if (form.checkValidity()) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Category saved successfully',
        confirmButtonColor: '#7dd3a8'
      });
      closeModal();
    } else {
      form.reportValidity();
    }
  }

  // Delete Category
  function deleteCategory(id) {
    Swal.fire({
      title: 'Delete Category?',
      text: "This action cannot be undone. All subcategories and related data will be affected.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f87171',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Category has been deleted.',
          confirmButtonColor: '#7dd3a8'
        });
      }
    });
  }

  // Reload Table
  function reloadTable() {
    Swal.fire({
      icon: 'info',
      title: 'Reloading...',
      text: 'Table data refreshed',
      timer: 1000,
      showConfirmButton: false
    });
  }