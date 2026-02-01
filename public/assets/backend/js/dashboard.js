// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 100,
});

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
}

// Toggle User Dropdown
function toggleUserDropdown() {
    const headerUser = document.getElementById("headerUser");
    const dropdown = document.getElementById("userDropdown");
    headerUser.classList.toggle("active");
    dropdown.classList.toggle("show");
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    const headerUser = document.getElementById("headerUser");
    const dropdown = document.getElementById("userDropdown");

    if (!headerUser.contains(event.target)) {
        headerUser.classList.remove("active");
        dropdown.classList.remove("show");
    }
});
