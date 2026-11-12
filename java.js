/* Apply the saved theme as early as possible to prevent a light-mode flash. */
(() => {
    try {
        const saved = localStorage.getItem("hyperswirl-theme");
        const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.dataset.theme = saved === "dark" || saved === "light" ? saved : preferred;
    } catch (error) {
        document.documentElement.dataset.theme = "light";
    }
})();

document.addEventListener("DOMContentLoaded", () => {

    /* =============== MOBILE MENU =============== */

    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navtoggle");
    const navClose = document.getElementById("navclose");

    function openMenu() {
        if (!navbar || !navToggle) return;

        navbar.classList.add("show-menu");
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Close menu");
        document.body.classList.add("menu-open");
    }

    function closeMenu() {
        if (!navbar || !navToggle) return;

        navbar.classList.remove("show-menu");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("menu-open");
    }

    if (navToggle) {
        navToggle.addEventListener("click", () => {
            navbar?.classList.contains("show-menu")
                ? closeMenu()
                : openMenu();
        });
    }

    navClose?.addEventListener("click", closeMenu);

    document.querySelectorAll(".navlist a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });


    /* =============== EMERGENCY DROPDOWN =============== */

    const dropdown = document.getElementById("safety-dropdown");
    const dropdownTrigger = document.getElementById("dropdown-trigger");

    if (dropdown && dropdownTrigger) {

        dropdownTrigger.addEventListener("click", event => {
            event.stopPropagation();

            const isOpen = dropdown.classList.toggle("dropdown-open");

            dropdownTrigger.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        document.addEventListener("click", event => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove("dropdown-open");
                dropdownTrigger.setAttribute("aria-expanded", "false");
            }
        });
    }


    /* =============== LIGHT / DARK MODE =============== */

    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const root = document.documentElement;
    const themeColorMeta = document.querySelector(
        'meta[name="theme-color"]'
    );

    function applyTheme(theme) {
        root.dataset.theme = theme;
        document.body.classList.toggle("dark-mode", theme === "dark");

        const isDark = theme === "dark";

        if (themeIcon) {
            themeIcon.className = isDark
                ? "ri-sun-line"
                : "ri-moon-line";
        }

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "title",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
        }

        if (themeColorMeta) {
            themeColorMeta.setAttribute(
                "content",
                isDark ? "#101D2B" : "#F0F7F8"
            );
        }
    }

    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("hyperswirl-theme");
    } catch (error) {
        console.warn("Theme preference could not be loaded.", error);
    }

    const preferredTheme = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

    applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme);

    themeToggle?.addEventListener("click", () => {
        const nextTheme =
            root.dataset.theme === "dark" ? "light" : "dark";

        applyTheme(nextTheme);

        try {
            localStorage.setItem("hyperswirl-theme", nextTheme);
        } catch (error) {
            console.warn("Theme preference could not be saved.", error);
        }
    });


    /* =============== ESCAPE KEY =============== */

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();

            if (dropdown && dropdownTrigger) {
                dropdown.classList.remove("dropdown-open");
                dropdownTrigger.setAttribute("aria-expanded", "false");
            }
        }
    });


    /* =============== INFINITE EXPLORE CAROUSEL =============== */

    const track = document.querySelector(".pages-track");
    const originalGroup = track?.querySelector(".pages-group");

    if (track && originalGroup && track.dataset.cloned !== "true") {

        const clone = originalGroup.cloneNode(true);

        clone.setAttribute("aria-hidden", "true");
        clone.inert = true;

        clone.querySelectorAll(
            "a, button, input, select, textarea, [tabindex]"
        ).forEach(element => {
            element.setAttribute("tabindex", "-1");
        });

        track.appendChild(clone);
        track.dataset.cloned = "true";
    }


    /* =============== CONTACT FORM =============== */

    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", event => {
            event.preventDefault();

            const status = document.getElementById("contact-status");

            if (status) {
                status.textContent =
                    "Your form is ready, but a sending service needs to be connected.";
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {

    /* =============== PASSWORD VISIBILITY =============== */

    document.querySelectorAll(".password-toggle").forEach(button => {

        button.addEventListener("click", () => {

            const input = document.getElementById(
                button.dataset.target
            );

            if (!input) return;

            const showing = input.type === "text";

            input.type = showing ? "password" : "text";

            button.innerHTML = showing
                ? '<i class="ri-eye-line"></i>'
                : '<i class="ri-eye-off-line"></i>';

            button.setAttribute(
                "aria-label",
                showing ? "Show password" : "Hide password"
            );

        });

    });


    /* =============== ACCOUNT STORAGE =============== */

    function getAccounts() {
        const accounts = localStorage.getItem("hyperswirl-accounts");
        return accounts ? JSON.parse(accounts) : [];
    }

    function showMessage(element, message, type) {
        if (!element) return;

        element.textContent = message;
        element.className = "auth-message " + type;
    }

    async function hashPassword(password) {

        if (!window.crypto?.subtle) {
            throw new Error(
                "Secure browser access is required. Try running your website through localhost or HTTPS."
            );
        }

        const encoded = new TextEncoder().encode(password);

        const hash = await crypto.subtle.digest("SHA-256", encoded);

        return Array.from(new Uint8Array(hash))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }


    /* =============== REGISTER =============== */

    const registerForm = document.getElementById("register-form");

    registerForm?.addEventListener("submit", async event => {

        event.preventDefault();

        const name = document.getElementById("register-name")
            .value.trim();

        const email = document.getElementById("register-email")
            .value.trim().toLowerCase();

        const password = document.getElementById("register-password")
            .value;

        const confirmPassword = document.getElementById("confirm-password")
            .value;

        const message = document.getElementById("register-message");

        if (password.length < 8) {
            showMessage(
                message,
                "Password must contain at least 8 characters.",
                "error"
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                message,
                "Passwords do not match. Please try again.",
                "error"
            );
            return;
        }

        try {

            const accounts = getAccounts();

            const existingAccount = accounts.find(
                account => account.email === email
            );

            if (existingAccount) {
                showMessage(
                    message,
                    "This email is already registered. Please login instead.",
                    "error"
                );
                return;
            }

            const passwordHash = await hashPassword(password);

            accounts.push({
                name: name,
                email: email,
                passwordHash: passwordHash
            });

            localStorage.setItem(
                "hyperswirl-accounts",
                JSON.stringify(accounts)
            );

            showMessage(
                message,
                "Account created successfully! Redirecting to login...",
                "success"
            );

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);

        } catch (error) {

            showMessage(
                message,
                error.message || "Unable to create your account.",
                "error"
            );

        }

    });

    /* =============== LOGIN =============== */

    const loginForm = document.getElementById("login-form");

    loginForm?.addEventListener("submit", async event => {

        event.preventDefault();

        const email = document.getElementById("login-email")
            .value.trim().toLowerCase();

        const password = document.getElementById("login-password")
            .value;

        const message = document.getElementById("login-message");

        try {

            const accounts = getAccounts();

            const account = accounts.find(
                account => account.email === email
            );

            if (!account) {
                showMessage(
                    message,
                    "No account found with this email. Please register first.",
                    "error"
                );
                return;
            }

            const passwordHash = await hashPassword(password);

            if (passwordHash !== account.passwordHash) {
                showMessage(
                    message,
                    "Incorrect password. Please try again.",
                    "error"
                );
                return;
            }

            sessionStorage.setItem(
                "hyperswirl-user",
                JSON.stringify({
                    name: account.name,
                    email: account.email
                })
            );

            showMessage(
                message,
                "Login successful! Welcome back.",
                "success"
            );

            loginForm.reset();

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {

            showMessage(
                message,
                error.message || "Unable to login. Please try again.",
                "error"
            );

        }

    });

});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    document.querySelectorAll(".event").forEach(event => {
      if (
        filter === "all" ||
        event.dataset.era === filter
      ) {
        event.style.display = "block";
      } else {
        event.style.display = "none";
      }
    });
  });
});

document.querySelectorAll('.accordion-trigger').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.parentElement;

    item.classList.toggle('open');

    button.setAttribute(
      'aria-expanded',
      item.classList.contains('open')
    );
  });
});
