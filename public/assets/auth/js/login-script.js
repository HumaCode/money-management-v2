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
let passwordVisible = false;
function togglePassword() {
    passwordVisible = !passwordVisible;
    const input = document.getElementById("password");
    const icon = document.getElementById("eyeIcon");

    input.type = passwordVisible ? "text" : "password";

    if (passwordVisible) {
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

// Login handler (demo)
// function handleLogin() {
//     const username = document.getElementById("username").value.trim();
//     const password = document.getElementById("password").value.trim();

//     if (!username || !password) {
//         document.getElementById("errorText").textContent =
//             "Please fill in all fields.";
//         document.getElementById("errorMsg").classList.add("show");
//         return;
//     }

//     // Demo: simulate login check
//     // Replace with actual API call
//     if (username === "admin" && password === "admin123") {
//         document.getElementById("errorMsg").classList.remove("show");
//         // Simulate success — redirect or show dashboard
//         alert("Login successful! Redirecting...");
//     } else {
//         document.getElementById("errorText").textContent =
//             "Username or password is incorrect.";
//         document.getElementById("errorMsg").classList.add("show");
//         // Shake the form card subtly
//         document.querySelector(".panel-form").style.animation = "none";
//         void document.querySelector(".panel-form").offsetWidth;
//     }
// }

// Enter key triggers login
// document.addEventListener("keydown", (e) => {
//     if (e.key === "Enter") handleLogin();
// });
