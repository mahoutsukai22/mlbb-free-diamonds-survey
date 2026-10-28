const firstNameInput  = document.getElementById("firstName");
const middleNameInput = document.getElementById("middleName");
const lastNameInput   = document.getElementById("lastName");
const usernameInput   = document.getElementById("username");
const passwordInput   = document.getElementById("password");

const registerButton  = document.getElementById("registerButton");
const passwordToggle  = document.getElementById("passwordToggle");

const registerError   = document.getElementById("registerError");
const statusMessage   = document.getElementById("statusMessage");
const gateSubtitle    = document.getElementById("gateSubtitle");

const topic =
    new URLSearchParams(window.location.search).get("topic") || "unknown";

if (gateSubtitle && topic !== "unknown") {
    gateSubtitle.textContent =
        "Register to unlock this briefing. Free account, takes a few seconds.";
}

/* =========================================
   PASSWORD SHOW / HIDE
========================================= */

passwordToggle.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordToggle.textContent = "HIDE";
    } else {
        passwordInput.type = "password";
        passwordToggle.textContent = "SHOW";
    }
});

/* =========================================
   REGISTRATION / EVENT RECORDING
========================================= */

registerButton.addEventListener("click", async function () {
    clearMessages();

    const firstName = firstNameInput.value.trim();
    const middleName = middleNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const username = usernameInput.value.trim();
    const passwordWasEntered = passwordInput.value.length > 0;

    // Validate required fields before submitting.
    if (!firstName || !lastName || !username || !passwordWasEntered) {
        showError("Please fill in all required fields.");
        return;
    }

    // Only non-sensitive information is stored.
    const event = {
        topic: topic,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        username: username,
        password_entered: passwordWasEntered,
        user_agent: navigator.userAgent
    };

    setButtonLoading(registerButton, true, "Saving...");

    try {
        const { error } = await supabaseClient
            .from("training_events")
            .insert(event);

        if (error) {
            console.error("Supabase insert failed:", error);
            showError("Unable to save your information. Please try again.");
            return;
        }

        statusMessage.textContent = "Information saved successfully.";
        statusMessage.classList.add("visible");

        // Redirect only after Supabase confirms success.
        window.location.href = "index.html";

    } catch (error) {
        console.error("Unexpected error:", error);
        showError("An unexpected error occurred. Please try again.");

    } finally {
        setButtonLoading(registerButton, false, "Create Account");
    }
});

/* =========================================
   HELPERS
========================================= */

function showError(message) {
    registerError.textContent = message;
}

function clearMessages() {
    registerError.textContent = "";
    statusMessage.textContent = "";
    statusMessage.classList.remove("visible");
}

function setButtonLoading(button, loading, text) {
    button.disabled = loading;
    button.textContent = text;
}
