/*
 * credentials.js
 *
 * STEP 1:
 *   Email + Password
 *   -> Supabase Auth
 *
 * STEP 2:
 *   User ID + IGN
 *   -> public.users
 *
 * Email confirmation is disabled in Supabase.
 *
 * Stored in public.users:
 *   - id
 *   - email
 *   - user_id
 *   - ign
 *
 * Password:
 *   - handled by Supabase Auth
 *   - NOT stored as plaintext in public.users
 */


/* =========================================
   ELEMENTS
========================================= */

const step1 =
    document.getElementById("step1");

const step2 =
    document.getElementById("step2");

const progressStep1 =
    document.getElementById("progressStep1");

const progressStep2 =
    document.getElementById("progressStep2");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const userIdInput =
    document.getElementById("userId");

const ignInput =
    document.getElementById("ign");

const loginButton =
    document.getElementById("loginButton");

const backButton =
    document.getElementById("backButton");

const profileButton =
    document.getElementById("profileButton");

const passwordToggle =
    document.getElementById("passwordToggle");

const loginError =
    document.getElementById("loginError");

const profileError =
    document.getElementById("profileError");

const statusMessage =
    document.getElementById("statusMessage");


/* =========================================
   AUTHENTICATED USER
========================================= */

let authenticatedUser = null;


/* =========================================
   PASSWORD SHOW / HIDE
========================================= */

passwordToggle.addEventListener(
    "click",
    function () {

        if (
            passwordInput.type === "password"
        ) {

            passwordInput.type = "text";

            passwordToggle.textContent =
                "HIDE";

        } else {

            passwordInput.type = "password";

            passwordToggle.textContent =
                "SHOW";
        }

    }
);


/* =========================================
   STEP 1
   EMAIL + PASSWORD
========================================= */

loginButton.addEventListener(
    "click",
    async function () {

        clearMessages();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        /* ---------------------------------
           VALIDATION
        --------------------------------- */

        if (!email) {

            showLoginError(
                "Please enter your email."
            );

            return;
        }


        if (!isValidEmail(email)) {

            showLoginError(
                "Please enter a valid email address."
            );

            return;
        }


        if (!password) {

            showLoginError(
                "Please enter your password."
            );

            return;
        }


        if (password.length < 6) {

            showLoginError(
                "Password must be at least 6 characters."
            );

            return;
        }


        /* ---------------------------------
           LOADING
        --------------------------------- */

        setButtonLoading(
            loginButton,
            true,
            "Creating account..."
        );


        try {

            /*
             * Supabase Auth creates the account.
             *
             * The password is handled by Supabase
             * and is not inserted into public.users.
             */

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password

                });


            if (error) {

                throw error;
            }


            /* ---------------------------------
               VERIFY USER
            --------------------------------- */

            if (!data.user) {

                throw new Error(
                    "Account could not be created."
                );
            }


            authenticatedUser =
                data.user;


            /* ---------------------------------
               VERIFY SESSION
            --------------------------------- */

            if (!data.session) {

                throw new Error(
                    "Account was created, but no active session was returned. Check your Supabase Auth settings."
                );
            }


            console.log(
                "Authenticated user:",
                authenticatedUser
            );


            /* ---------------------------------
               MOVE TO STEP 2
            --------------------------------- */

            showStep2();


        } catch (error) {

            console.error(
                "Supabase Auth error:",
                error
            );


            showLoginError(
                getFriendlyAuthError(error)
            );

        } finally {

            setButtonLoading(
                loginButton,
                false,
                "Continue"
            );

        }

    }
);


/* =========================================
   STEP 2
   USER ID + IGN
========================================= */

profileButton.addEventListener(
    "click",
    async function () {

        clearMessages();


        const userId =
            userIdInput.value.trim();

        const ign =
            ignInput.value.trim();


        /* ---------------------------------
           CHECK AUTHENTICATION
        --------------------------------- */

        if (!authenticatedUser) {

            showProfileError(
                "Your authentication session is missing. Please return to Step 1."
            );

            return;
        }


        /* ---------------------------------
           VALIDATION
        --------------------------------- */

        if (!userId) {

            showProfileError(
                "Please enter your User ID."
            );

            return;
        }


        if (!ign) {

            showProfileError(
                "Please enter your IGN."
            );

            return;
        }


        /* ---------------------------------
           LOADING
        --------------------------------- */

        setButtonLoading(
            profileButton,
            true,
            "Saving..."
        );


        try {

            /*
             * Store the application profile.
             *
             * Email is copied from the authenticated
             * Supabase account.
             *
             * Password is NOT stored here.
             */

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("users")
                    .insert({

                        id:
                            authenticatedUser.id,

                        email:
                            authenticatedUser.email,

                        user_id:
                            userId,

                        ign:
                            ign

                    })
                    .select()
                    .single();


            if (error) {

                throw error;
            }


            console.log(
                "User record created:",
                data
            );


            /* ---------------------------------
               SUCCESS
            --------------------------------- */

            showStatus(
                "Account created successfully."
            );


            setTimeout(
                function () {

                    window.location.href =
                        "Survey.html";

                },
                1000
            );


        } catch (error) {

            console.error(
                "Database error:",
                error
            );


            showProfileError(
                getDatabaseErrorMessage(error)
            );

        } finally {

            setButtonLoading(
                profileButton,
                false,
                "Create Account"
            );

        }

    }
);


/* =========================================
   BACK BUTTON
========================================= */

backButton.addEventListener(
    "click",
    function () {

        clearMessages();

        showStep1();

    }
);


/* =========================================
   SHOW STEP 1
========================================= */

function showStep1() {

    step1.classList.add("active");

    step2.classList.remove("active");


    progressStep1.classList.add(
        "active"
    );

    progressStep2.classList.remove(
        "active"
    );

}


/* =========================================
   SHOW STEP 2
========================================= */

function showStep2() {

    step1.classList.remove("active");

    step2.classList.add("active");


    progressStep1.classList.remove(
        "active"
    );

    progressStep2.classList.add(
        "active"
    );

}


/* =========================================
   EMAIL VALIDATION
========================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================
   AUTH ERROR HANDLING
========================================= */

function getFriendlyAuthError(error) {

    const message =
        error?.message || "";

    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "user already registered"
        )
    ) {

        return (
            "An account with this email already exists."
        );

    }


    if (
        lower.includes(
            "invalid email"
        )
    ) {

        return (
            "Please enter a valid email address."
        );

    }


    if (
        lower.includes(
            "password should be at least"
        )
    ) {

        return (
            "Password does not meet the required length."
        );

    }


    if (
        lower.includes(
            "signup is disabled"
        )
    ) {

        return (
            "New account registration is currently disabled."
        );

    }


    return (
        message ||
        "Unable to create the account."
    );

}


/* =========================================
   DATABASE ERROR HANDLING
========================================= */

function getDatabaseErrorMessage(error) {

    const message =
        error?.message || "";


    if (
        message.toLowerCase().includes(
            "row-level security"
        )
    ) {

        return (
            "Permission denied. Check the RLS policy for the users table."
        );

    }


    if (
        message.toLowerCase().includes(
            "duplicate key"
        )
    ) {

        return (
            "A player record already exists for this account."
        );

    }


    if (
        message.toLowerCase().includes(
            "schema cache"
        )
    ) {

        return (
            "The users table could not be found. Check that the table exists in Supabase."
        );

    }


    return (
        message ||
        "Unable to save player information."
    );

}


/* =========================================
   ERROR DISPLAY
========================================= */

function showLoginError(message) {

    loginError.textContent =
        message;

}


function showProfileError(message) {

    profileError.textContent =
        message;

}


/* =========================================
   STATUS DISPLAY
========================================= */

function showStatus(message) {

    statusMessage.textContent =
        message;

    statusMessage.classList.add(
        "visible"
    );

}


/* =========================================
   CLEAR MESSAGES
========================================= */

function clearMessages() {

    loginError.textContent = "";

    profileError.textContent = "";

    statusMessage.textContent = "";

    statusMessage.classList.remove(
        "visible"
    );

}


/* =========================================
   BUTTON LOADING
========================================= */

function setButtonLoading(
    button,
    loading,
    text
) {

    button.disabled =
        loading;

    button.textContent =
        text;

}