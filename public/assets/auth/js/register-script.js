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
const passwordVisibility = {
    password: false,
    confirmPassword: false,
};

function togglePassword(fieldId, iconId) {
    passwordVisibility[fieldId] = !passwordVisibility[fieldId];
    const input = document.getElementById(fieldId);
    const icon = document.getElementById(iconId);

    input.type = passwordVisibility[fieldId] ? "text" : "password";

    if (passwordVisibility[fieldId]) {
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

// Password strength checker
function checkPasswordStrength() {
    const password = document.getElementById("password").value;
    const strengthDiv = document.getElementById("passwordStrength");
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (password.length === 0) {
        strengthDiv.classList.remove("show");
        return;
    }

    strengthDiv.classList.add("show");

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    strengthFill.className = "strength-fill";

    if (strength <= 1) {
        strengthFill.classList.add("weak");
        strengthText.textContent = "Weak password";
        strengthText.style.color = "var(--error)";
    } else if (strength <= 2) {
        strengthFill.classList.add("medium");
        strengthText.textContent = "Medium strength";
        strengthText.style.color = "#f59e0b";
    } else {
        strengthFill.classList.add("strong");
        strengthText.textContent = "Strong password";
        strengthText.style.color = "var(--accent)";
    }
}

$(document).on("submit", "#formRegister", function (e) {
    e.preventDefault();

    const $form = $(this);
    const url = $form.data("url");

    $("#errorMsg").removeClass("show");
    $("#successMsg").hide();

    $(".btn-login").prop("disabled", true);
    $("#loadingModal").css("display", "flex");

    $.ajax({
        url: url,
        type: "POST",
        data: $form.serialize(),

        success: function (res) {
            $("#formRegister").fadeOut(200, function () {
                $("#successMsg").css("display", "flex");
                $("#link").css("display", "none");
            });

            setTimeout(() => {
                window.location.href = res.redirect;
            }, 2000);
        },

        error: function (xhr) {
            let message = "Something went wrong.";

            if (xhr.status === 422 && xhr.responseJSON?.errors) {
                message = Object.values(xhr.responseJSON.errors)[0][0];
            }

            $("#errorText").text(message);
            $("#errorMsg").addClass("show");
        },

        complete: function () {
            $(".btn-login").prop("disabled", false);
            $("#loadingModal").hide();
        },
    });
});
