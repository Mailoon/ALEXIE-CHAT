import { PopupModal } from "./popup-modal" // Import PopupModal

/**
 * Helper function to open a popup from any element
 * @param {HTMLElement} element - Element to attach popup trigger to
 * @param {string} popupId - ID of popup to open
 * @param {Object} options - Popup options
 */
function attachPopupTrigger(element, popupId, options = {}) {
    if (!element) return

    element.addEventListener("click", (event) => {
        // Get click position for contextual popups
        const position = {
            x: event.clientX,
            y: event.clientY,
        }

        // Find the popup element
        const popup = document.getElementById(popupId)
        if (popup && popup instanceof PopupModal) {
            // Merge options with position
            const popupOptions = {
                ...options,
                position,
            }

            // Open the popup
            popup.open(popupOptions)
        }
    })
}

/**
 * Create a popup trigger button
 * @param {string} text - Button text
 * @param {string} popupId - ID of popup to open
 * @param {Object} options - Button and popup options
 * @returns {HTMLButtonElement} - The created button
 */
function createPopupTrigger(text, popupId, options = {}) {
    const button = document.createElement("button")
    button.textContent = text
    button.className = options.className || "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"

    attachPopupTrigger(button, popupId, options)

    return button
}

// Make functions available globally
window.attachPopupTrigger = attachPopupTrigger
window.createPopupTrigger = createPopupTrigger
