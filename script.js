// Import Components
import "./Components/new-btn.js"
import "./Components/navbar.js"
import "./Components/chat-bot.js"
import "./Components/Poppup.js"

// Dark mode toggle
const toggleDarkModeChangeIconText = (darkModeToggle) => {
    const htmlElement = document.documentElement

    if (!darkModeToggle) {
        console.error("Dark mode toggle button not found")
        return
    }

    if (htmlElement.classList.contains("dark")) {
        // Switch to light mode
        htmlElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
        darkModeToggle.setAttribute("icon-class", "fa-regular fa-moon fa-2xl")
        darkModeToggle.setAttribute("name", "Dark mode")
    } else {
        // Switch to dark mode
        htmlElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
        darkModeToggle.setAttribute("icon-class", "fa-regular fa-sun fa-2xl")
        darkModeToggle.setAttribute("name", "Light mode")
    }

    // Force a re-render by triggering a resize event
    window.dispatchEvent(new Event("resize"))
}

// Set initial theme based on localStorage or system preference
document.addEventListener("DOMContentLoaded", async () => {
    // Check for saved theme preference or use system preference
    const darkModeToggle = document.getElementById("dark-mode-toggle")

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            toggleDarkModeChangeIconText(darkModeToggle)
        })
    }

    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add("dark")
        if (darkModeToggle) {
            darkModeToggle.setAttribute("icon-class", "fa-regular fa-sun fa-2xl")
            darkModeToggle.setAttribute("name", "Light mode")
        }
    } else {
        document.documentElement.classList.remove("dark")
        if (darkModeToggle) {
            darkModeToggle.setAttribute("icon-class", "fa-regular fa-moon fa-2xl")
            darkModeToggle.setAttribute("name", "Dark mode")
        }
    }
})
