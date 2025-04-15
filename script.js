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

export const renderChatsNavbar = () => {
    const historialContainer = document.getElementById("section-historial-chats");
    historialContainer.innerHTML = "";
    const allChats = LocalStorageService.getAllChats();
    console.log('logs', allChats);
    if (allChats.length > 0) {
        allChats.forEach((chat) => {
            const displayText = chat.nameChat
                ? chat.nameChat.length > 25
                    ? chat.nameChat.substring(0, 25) + "..."
                    : chat.nameChat
                : "No name";

            const chatButton = document.createElement("new-btn");
            chatButton.setAttribute("name", displayText);
            chatButton.setAttribute("styles", "px-6 py-3 text-lg rounded-xl");
            chatButton.setAttribute("icon-class", "fa-regular fa-comments");
            chatButton.setAttribute(
                "button-class",
                "bg-[#E1E5EB] dark:bg-[#3A3A3A] w-full max-w-full text-black dark:text-white justify-start font-semibold font-opensans hover:bg-[#FBFBFB] dark:hover:bg-[#4A4A4A] min-w-[63px] sm:w-[270px] sm:w-full max-w-[270px]"
            );
            chatButton.setAttribute("icon-and-text", "true");
            chatButton.setAttribute("data-chat-id", chat.id);

            chatButton.addEventListener("click", () => {
                LocalStorageService.switchToChat(chat.id);
                console.log(`Cambiado al chat: ${chat.id}`);

                document.querySelectorAll("seccion-historial new-btn").forEach((btn) => {
                    btn.classList.remove("selected-chat");
                });
                chatButton.classList.add("selected-chat");
            });
            historialContainer.appendChild(chatButton);
        });
    }
}

const renderSingleChatNavbar = (chat) => {
    const historialContainer = document.getElementById("section-historial-chats");

    const displayText = chat.nameChat
        ? chat.nameChat.length > 25
            ? chat.nameChat.substring(0, 25) + "..."
            : chat.nameChat
        : "No name";

    const chatButton = document.createElement("new-btn");
    chatButton.setAttribute("name", displayText);
    chatButton.setAttribute("styles", "px-6 py-3 text-lg rounded-xl");
    chatButton.setAttribute("icon-class", "fa-regular fa-comments");
    chatButton.setAttribute(
        "button-class",
        "bg-[#E1E5EB] dark:bg-[#3A3A3A] w-full max-w-full text-black dark:text-white justify-start font-semibold font-opensans hover:bg-[#FBFBFB] dark:hover:bg-[#4A4A4A] min-w-[63px] sm:w-[270px] sm:w-full max-w-[270px]"
    );
    chatButton.setAttribute("icon-and-text", "true");
    chatButton.setAttribute("data-chat-id", chat.id);

    chatButton.addEventListener("click", () => {
        LocalStorageService.switchToChat(chat.id);
        console.log(`Cambiado al chat: ${chat.id}`);

        document.querySelectorAll("seccion-historial new-btn").forEach((btn) => {
            btn.classList.remove("selected-chat");
        });
        chatButton.classList.add("selected-chat");
    });

    historialContainer.appendChild(chatButton);
};

LocalStorageService.listeners.push((newChat) => {
    renderSingleChatNavbar(newChat);
});

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

    const createNewChatbotButton = document.getElementById("create_new_chatbot");
    if (createNewChatbotButton) {
        createNewChatbotButton.addEventListener("click", () => {
            LocalStorageService.removeItem('active_thread_id');
            LocalStorageService.switchToChat('');
        });
    }

    renderChatsNavbar();
    const activeThread = LocalStorageService.getActiveChat();
    if (activeThread) {
        renderMessagesFromThread(activeThread);
    }
})
