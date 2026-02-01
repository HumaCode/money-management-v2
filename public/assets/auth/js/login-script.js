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

$("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const $form = $(this);
    const url = $form.data("url");

    if (!url) {
        console.error("Login URL is missing");
        return;
    }

    $("#btnLogin").prop("disabled", true);
    $("#loadingModal").css("display", "flex");
    $("#errorMsg").removeClass("show");

    $.ajax({
        url: url,
        type: "POST",
        data: $form.serialize(),

        success: function (res) {
            if (res.redirect) {
                window.location.href = res.redirect;
            } else {
                console.error("Redirect URL not provided");
            }
        },

        error: function (xhr) {
            let message = "Login failed.";

            if (xhr.status === 422 && xhr.responseJSON?.errors) {
                message = Object.values(xhr.responseJSON.errors)[0][0];
            }

            if (xhr.status === 401 && xhr.responseJSON?.message) {
                message = xhr.responseJSON.message;
            }

            $("#errorText").text(message);
            $("#errorMsg").addClass("show");
        },

        complete: function () {
            $("#btnLogin").prop("disabled", false);
            $("#loadingModal").hide();
        },
    });
});
