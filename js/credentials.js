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


registerButton.addEventListener("click", async function () {

    clearMessages();

    const event = {
        topic: topic,
        first_name_entered:  firstNameInput.value.trim(),
        middle_name_entered: middleNameInput.value.trim() || null,
        last_name_entered:   lastNameInput.value.trim(),
        username_entered:    usernameInput.value.trim(),
        password_entered:    passwordInput.value.length > 0,
        user_agent:          navigator.userAgent
    };

    if (!event.username_entered || !event.password_entered) {
        showError("Please fill in all required fields.");
        return;
    }

    passwordInput.value = "";

    setButtonLoading(registerButton, true, "Creating account...");

    try {
        const { error } =
            await supabaseClient
                .from("training_events")
                .insert(event);

        if (error) {
            throw error;
        }

        console.log("Training event recorded (no credentials stored):", event);

    } catch (error) {
        console.error("Training event could not be recorded:", error);
    } finally {
        window.location.href =
            "ThankYou.html?topic=" + encodeURIComponent(topic);
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
