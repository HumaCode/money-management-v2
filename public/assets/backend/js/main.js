/* ============================================================
           MODAL AJAX
        ============================================================ */

let modalRequest = null;

function openModal(url) {
    const $overlay = $("#modal");

    // tampilkan modal + loading
    $overlay.addClass("show").html(`
        <div class="modal modal-sm">
            <div class="modal-body modal-loading">
                <div class="spinner-form mb-2"></div>
                <h4>Memuat Data...</h4>
                <p>Mohon tunggu sebentar, data sedang disiapkan.</p>
            </div>
        </div>
    `);

    $("body").css("overflow", "hidden");

    if (modalRequest) modalRequest.abort();

    modalRequest = $.ajax({
        url,
        method: "GET",
        success(res) {
            $overlay.html(res);
            $(document).trigger("modal:loaded"); // 🔥 sinyal modal siap
        },
        error(xhr) {
            if (xhr.statusText === "abort") return;

            $overlay.html(`
                <div class="modal modal-sm">
                    <div class="modal-body modal-loading">
                        <svg style="width:36px; height:36px; stroke:var(--error);" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h4 style="color: var(--error);">Gagal Memuat Data</h4>
                        <p>Terjadi kesalahan saat mengambil data.</p>
                        <button type="button" class="btn-secondary mt-2" onclick="closeModal()">Tutup</button>
                    </div>
                </div>
            `);
        },
    });
}

function closeModal() {
    $("#modal").removeClass("show").empty();
    $("body").css("overflow", "");
}

/* close modal */
$(document).on("click", "#modal", function (e) {
    if (e.target === this) closeModal();
});

$(document).on("keydown", function (e) {
    if (e.key === "Escape" && $("#modal").hasClass("show")) {
        closeModal();
    }
});

/* ============================================================
           FORM SUBMIT HANDLER
        ============================================================ */

function handleFormSubmit(formSelector) {
    let dataTables = [];
    let onSuccessCallback = null;

    function setDataTable(ids) {
        dataTables = Array.isArray(ids) ? ids : [ids];
        return this;
    }

    function onSuccess(cb) {
        onSuccessCallback = cb;
        return this;
    }

    function init() {
        $(document)
            .off("submit", formSelector)
            .on("submit", formSelector, function (e) {
                e.preventDefault();
                const form = this;

                // Overdraft warning for expense transactions
                const $txType = $(form).find("#txType");
                const $txAccount = $(form).find("#txAccount");
                const $txAmount = $(form).find("#txAmount");

                if ($txType.length && $txAccount.length && $txAmount.length) {
                    const type = $txType.val();
                    const $selectedOpt = $txAccount.find("option:selected");
                    const balance = parseFloat($selectedOpt.attr("data-balance") || 0);
                    const amount = parseFloat(getRawNumberValue($txAmount.val()) || 0);

                    if (type === "expense" && amount > balance && !form.dataset.confirmedOverdraft) {
                        const formattedAmount = "Rp " + amount.toLocaleString("id-ID");
                        const formattedBalance = "Rp " + balance.toLocaleString("id-ID");

                        Swal.fire({
                            title: "Saldo Akun Tidak Cukup",
                            html: `
                                <div style="text-align:center">
                                    <p>Nominal pengeluaran (<strong>${formattedAmount}</strong>) melebihi saldo akun saat ini (<strong>${formattedBalance}</strong>).</p>
                                    <p style="color: #f59e0b; font-size: 13px; margin-top: 8px;">Saldo akun Anda akan berkurang menjadi minus jika dilanjutkan.</p>
                                    <strong style="color: #fff; margin-top: 10px; display: inline-block;">Apakah Anda yakin ingin melanjutkan transaksi ini?</strong>
                                </div>
                            `,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Ya, Lanjutkan Transaksi",
                            cancelButtonText: "Batal / Perbaiki Nominal",
                            confirmButtonColor: "#f59e0b",
                            cancelButtonColor: "#6b7280",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                form.dataset.confirmedOverdraft = "true";
                                $(form).submit();
                            }
                        });
                        return;
                    }
                }

                delete form.dataset.confirmedOverdraft;

                // tampilkan spinner submit
                showFormSpinner();

                $(form).find('button[type="submit"]').prop("disabled", true);

                // delay 500ms sebelum ajax
                setTimeout(() => submitAjax(form), 500);
            });

        return this;
    }

    function submitAjax(form) {
        const formData = new FormData(form);

        // Unformat currency inputs before sending to server
        $(form).find(".currency-input, input[data-type='currency']").each(function () {
            const name = $(this).attr("name");
            if (name) {
                const rawVal = getRawNumberValue($(this).val());
                formData.set(name, rawVal);
            }
        });

        $.ajax({
            url: form.action,
            method: form.method || "POST",
            data: formData,
            contentType: false,
            processData: false,

            beforeSend() {
                $(form).find(".is-invalid").removeClass("is-invalid");
                $(form).find(".invalid-feedback").remove();
            },

            success(res) {
                showToast(res.status || "success", res.message || "Success");
                closeModal();

                // reload table data
                loadData();

                onSuccessCallback && onSuccessCallback(res);
            },

            error(xhr) {
                hideFormSpinner();

                // VALIDATION ERROR
                if (xhr.status === 422 && xhr.responseJSON?.errors) {
                    const errors = xhr.responseJSON.errors;

                    const errorList = Object.values(errors)
                        .map((e) => `• ${e[0]}`)
                        .join("<br>");

                    Swal.fire({
                        icon: "error",
                        title: "Validation Failed",
                        html: errorList,
                    });
                    return;
                }

                // ERROR LAIN
                Swal.fire({
                    icon: "error",
                    title: "Request Failed",
                    text:
                        xhr.responseJSON?.message ||
                        "The operation could not be completed. Please try again.",
                });
            },

            complete() {
                $("#spinner-form-modal").addClass("hidden");
                $(form).find('button[type="submit"]').prop("disabled", false);
            },
        });
    }

    return {
        init,
        setDataTable,
        onSuccess,
    };
}

function showFormSpinner() {
    $("#spinner-form-modal").removeClass("hidden");
}

function hideFormSpinner() {
    $("#spinner-form-modal").addClass("hidden");
}

/* ============================================================
           ACTION HANDLER (VIEW BLADE CUKUP PANGGIL INI)
        ============================================================ */

function handleAction(datatableId, onShow) {
    $(document).on("click", ".action", function (e) {
        e.preventDefault();

        openModal(this.href);

        // tunggu modal benar-benar load
        $(document).one("modal:loaded", function () {
            onShow && onShow();

            handleFormSubmit("#form_action").setDataTable(datatableId).init();
        });
    });
}

/* ============================================================
           UTILITIES
        ============================================================ */

function showToast(status = "success", message = "", duration = 3000) {
    const validStatuses = ["success", "error", "warning", "info"];
    const toastType = validStatuses.includes(status) ? status : "info";
    Toast.show(toastType, message, duration);
}

function initColorPicker() {
    const $color = $("#inputColor");
    const $hex = $("#inputColorHex");

    if (!$color.length || !$hex.length) return;

    // color → hex
    $color.off("input").on("input", function () {
        $hex.val(this.value);
    });

    // hex → color
    $hex.off("input").on("input", function () {
        const val = this.value;

        // valid hex only
        if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
            $color.val(val);
        }
    });
}

function initRgbaPicker() {
    const $color = $("#rgbaColorPicker");
    const $alpha = $("#rgbaAlpha");
    const $output = $("#inputRgba");

    if (!$color.length || !$alpha.length || !$output.length) return;

    function hexToRgb(hex) {
        hex = hex.replace("#", "");

        if (hex.length === 3) {
            hex = hex
                .split("")
                .map((c) => c + c)
                .join("");
        }

        const num = parseInt(hex, 16);

        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255,
        };
    }

    function update() {
        const { r, g, b } = hexToRgb($color.val());
        const a = parseFloat($alpha.val()).toFixed(2);

        $output.val(`rgba(${r},${g},${b},${a})`);
    }

    $color.on("input", update);
    $alpha.on("input", update);

    update(); // init
}

// Category chip toggle
const selectedCategories = [];

function toggleCategory(chip, categoryId) {
    chip.classList.toggle("selected");

    const index = selectedCategories.indexOf(categoryId);
    if (index > -1) {
        selectedCategories.splice(index, 1);
    } else {
        selectedCategories.push(categoryId);
    }
}

function handleDelete(dataTableId, onSuccess) {
    // Keep function for backwards compatibility
}

$(document).on("click", "a.btn-action.delete, a.delete", function (e) {
    e.preventDefault();

    const $btn = $(this);
    const url = $btn.attr("href");
    if (!url || url === "#" || url.startsWith("javascript:")) return;

    Swal.fire({
        title: "Delete this item?",
        html: `
            <div style="text-align:center">
                <p>This action cannot be undone.</p>
                <strong class="text-danger">The data will be permanently removed.</strong>
            </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
    }).then((result) => {
        if (!result.isConfirmed) return;

        $.ajax({
            url,
            method: "DELETE",

            beforeSend() {
                showLoading(true);
            },

            success(res) {
                showToast(
                    res.status || "success",
                    res.message || "Data deleted successfully"
                );

                if ($btn.closest(".modal").length > 0) {
                    closeModal();
                }

                // 🔁 Reload table data
                if (typeof loadData === "function") {
                    loadData();
                }
            },

            error(err) {
                showToast(
                    "error",
                    err.responseJSON?.message || "Failed to delete data"
                );
            },

            complete() {
                showLoading(false);
            }
        });
    });
});

/* ============================================================
   FLATPICKR DATEPICKER INITIALIZER
   ============================================================ */

function initDatepicker() {
    if (typeof flatpickr !== "undefined") {
        $("input[type='date'], input.datepicker").each(function () {
            if (this._flatpickr) return;

            flatpickr(this, {
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d M Y",
                allowInput: true,
                disableMobile: "true",
                onReady: function (selectedDates, dateStr, instance) {
                    createYearDropdown(instance);
                },
                onMonthChange: function (selectedDates, dateStr, instance) {
                    updateYearDropdown(instance);
                },
                onYearChange: function (selectedDates, dateStr, instance) {
                    updateYearDropdown(instance);
                },
                onOpen: function (selectedDates, dateStr, instance) {
                    updateYearDropdown(instance);
                }
            });
        });
    }
}

function createYearDropdown(instance) {
    const yearInputWrapper = instance.calendarContainer.querySelector(".numInputWrapper");
    if (!yearInputWrapper || instance.calendarContainer.querySelector(".flatpickr-year-select")) return;

    const currentYear = instance.currentYear;
    const startYear = currentYear - 50;
    const endYear = currentYear + 50;

    const yearSelect = document.createElement("select");
    yearSelect.className = "flatpickr-monthDropdown-months flatpickr-year-select";

    for (let y = startYear; y <= endYear; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        opt.className = "flatpickr-monthDropdown-month";
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    yearSelect.addEventListener("change", function () {
        instance.changeYear(parseInt(this.value, 10));
    });

    yearInputWrapper.style.display = "none";
    yearInputWrapper.parentNode.appendChild(yearSelect);
}

function updateYearDropdown(instance) {
    const yearSelect = instance.calendarContainer.querySelector(".flatpickr-year-select");
    if (yearSelect) {
        yearSelect.value = instance.currentYear;
    }
}

/* ============================================================
   CURRENCY INPUT FORMATTER (THOUSAND SEPARATOR)
   ============================================================ */

function formatRupiahInput(val) {
    if (val === null || val === undefined || val === "") return "";
    let str = val.toString().trim();

    // If initial value from DB/PHP is float number string with decimal dot e.g. "100000.00"
    if (/^\d+(\.\d{1,2})?$/.test(str)) {
        let num = parseFloat(str);
        if (isNaN(num)) return "";
        return Math.floor(num).toLocaleString("id-ID");
    }

    let numberString = str.replace(/[^0-9]/g, "");
    if (!numberString) return "";
    return parseInt(numberString, 10).toLocaleString("id-ID");
}

function getRawNumberValue(val) {
    if (!val) return "";
    return val.toString().replace(/\./g, "").replace(/,/g, "");
}

function initCurrencyInput() {
    $(".currency-input, input[data-type='currency']").each(function () {
        const $input = $(this);
        if ($input.data("currency-initialized")) return;

        $input.data("currency-initialized", true);

        if ($input.val()) {
            $input.val(formatRupiahInput($input.val()));
        }

        $input.on("input", function () {
            const cursorPosition = this.selectionStart;
            const originalLength = this.value.length;
            const formatted = formatRupiahInput(this.value);

            this.value = formatted;

            const newLength = formatted.length;
            const newPosition = Math.max(0, cursorPosition + (newLength - originalLength));
            this.setSelectionRange(newPosition, newPosition);
        });
    });
}

$(document).ready(function () {
    initDatepicker();
    initCurrencyInput();
});

$(document).on("modal:loaded", function () {
    initDatepicker();
    initCurrencyInput();
});
