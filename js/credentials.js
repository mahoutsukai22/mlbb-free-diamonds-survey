/*
 * credentials.js  (security-awareness training build)
 *
 * WHAT THIS DOES NOT DO:
 *   - It does NOT read the values of the name/username/password fields.
 *   - It does NOT send any credential to Supabase, plaintext OR hashed.
 *
 * WHAT IT DOES:
 *   On submit it records a single de-identified TRAINING EVENT -
 *   essentially "a visitor reached the gate and submitted it" - plus
 *   which topic baited them and which fields were non-empty (as booleans
 *   only). That is exactly the signal a real phishing-awareness platform
 *   keeps: who got caught, not what their password is.
 *
 * Then it redirects to ThankYou.html, which reveals that the page was a
 * simulated phishing lure and explains the red flags.
 *
 * The password field exists purely for realism. Its value is read only to
 * test `.length > 0` for the boolean flag and is never stored or hashed.
 */


/* =========================================
   ELEMENTS
========================================= */

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


/* =========================================
   WHICH TOPIC BAITED THEM (anonymous label)
========================================= */

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
   SUBMIT  ->  log event, discard credentials
========================================= */

registerButton.addEventListener("click", async function () {

    clearMessages();

    /*
     * Build booleans ONLY. We read .value just long enough to check that a
     * field was filled, then let it go out of scope. No value is kept,
     * copied, hashed, or transmitted.
     */
    const event = {
        topic: topic,
        first_name_entered:  firstNameInput.value.trim().length  > 0,
        middle_name_entered: middleNameInput.value.trim().length > 0,
        last_name_entered:   lastNameInput.value.trim().length   > 0,
        username_entered:    usernameInput.value.trim().length   > 0,
        password_entered:    passwordInput.value.length          > 0,
        user_agent:          navigator.userAgent
    };

    /* Minimal realism check so the lure feels real. */
    if (!event.username_entered || !event.password_entered) {
        showError("Please fill in all required fields.");
        return;
    }

    /*
     * Overwrite the password field immediately. Even though we never stored
     * the value, this makes the "we didn't keep it" guarantee visible in
     * the DOM for anyone inspecting the exercise.
     */
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
        // Even if logging fails, still show the teachable reveal.
        console.error("Training event could not be recorded:", error);
    } finally {
        // Hand off to the reveal page regardless.
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
