class PopupModal extends HTMLElement {
    static popupRegistry = new Map() // Registry to track all popups
    static activePopups = [] // Stack of active popups

    constructor() {
        super()
        this.isOpen = false
        this.mode = "center" // 'center' or 'contextual'
        this.clickPosition = { x: 0, y: 0 }
        this.closeOnOutsideClick = true
        this.parentPopup = null // Reference to parent popup if nested
        this.id = this.getAttribute("id") || `popup-${Math.random().toString(36).substr(2, 9)}`

        // Register this popup
        PopupModal.popupRegistry.set(this.id, this)
    }

    connectedCallback() {
        // Get attributes with defaults
        this.mode = this.getAttribute("mode") || "center"
        this.closeOnOutsideClick = this.getAttribute("close-on-outside-click") !== "false"
        this.hasHeader = this.getAttribute("no-header") !== "true"

        // Create the component structure
        this.render()

        // Add event listeners
        this.setupEventListeners()
    }

    render() {
        // Create the container
        this.className = "popup-modal fixed inset-0 z-50 flex items-center justify-center"
        if (!this.isOpen) {
            this.style.display = "none"
        }

        // Calculate z-index based on nesting level
        const zIndex = 50 + PopupModal.activePopups.length * 10

        // Create the HTML structure
        this.innerHTML = `
            <div class="popup-overlay fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            this.mode === "center" ? "opacity-50" : "opacity-0 pointer-events-none"
        }" 
                 style="z-index: ${zIndex}"></div>
            <div class="popup-container bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform scale-95 opacity-0 ${
            this.mode === "center" ? "max-w-md w-full mx-4" : "absolute"
        }"
                 style="z-index: ${zIndex + 1}">
                ${
            this.hasHeader
                ? `
                <div class="popup-header flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 class="popup-title text-lg font-semibold dark:text-white">Popup Title</h3>
                    <button class="popup-close-btn text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                        <i class="fa-solid fa-times text-xl"></i>
                    </button>
                </div>
                `
                : ""
        }
                <div class="popup-content p-4 dark:text-gray-200">
                    <!-- Content will be inserted here -->
                </div>
            </div>
        `

        // Store references to elements
        this.overlay = this.querySelector(".popup-overlay")
        this.container = this.querySelector(".popup-container")
        this.closeButton = this.querySelector(".popup-close-btn")
        this.titleElement = this.querySelector(".popup-title")
        this.contentContainer = this.querySelector(".popup-content")

        // Move any child elements into the content container
        const childNodes = Array.from(this.childNodes)
        childNodes.forEach((node) => {
            if (node !== this.overlay && node !== this.container) {
                this.contentContainer.appendChild(node)
            }
        })
    }

    setupEventListeners() {
        // Close button click
        if (this.closeButton) {
            this.closeButton.addEventListener("click", () => {
                this.close()
            })
        }

        // Outside click
        if (this.closeOnOutsideClick) {
            this.overlay.addEventListener("click", () => {
                this.close()
            })
        }

        // Prevent clicks on the container from closing the popup
        this.container.addEventListener("click", (e) => {
            e.stopPropagation()
        })

        // ESC key to close
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isOpen) {
                // Only close the top-most popup
                if (
                    PopupModal.activePopups.length > 0 &&
                    PopupModal.activePopups[PopupModal.activePopups.length - 1] === this.id
                ) {
                    this.close()
                }
            }
        })
    }

    /**
     * Open the popup
     * @param {Object} options - Configuration options
     * @param {string} options.title - Popup title
     * @param {HTMLElement|string} options.content - Content to display
     * @param {string} options.mode - Display mode ('center' or 'contextual')
     * @param {Object} options.position - Position for contextual mode {x, y}
     * @param {string} options.parentPopupId - ID of parent popup if nested
     */
    open(options = {}) {
        // Update options
        if (options.title && this.titleElement) {
            this.titleElement.textContent = options.title
        }

        if (options.content) {
            this.setContent(options.content)
        }

        if (options.mode) {
            this.mode = options.mode
        }

        if (options.position) {
            this.clickPosition = options.position
        }

        // Set parent popup if provided
        if (options.parentPopupId) {
            this.parentPopup = options.parentPopupId
        }

        // Add to active popups stack
        PopupModal.activePopups.push(this.id)

        // Show the popup
        this.isOpen = true
        this.style.display = "flex"

        // Update overlay opacity based on mode
        if (this.mode === "center") {
            this.overlay.classList.remove("opacity-0", "pointer-events-none")
            this.overlay.classList.add("opacity-50")

            // Center positioning
            this.container.style.position = "relative"
            this.container.style.left = "auto"
            this.container.style.top = "auto"
            this.container.classList.add("max-w-md", "w-full", "mx-4")
            this.container.classList.remove("absolute")
        } else {
            // Contextual positioning
            this.overlay.classList.add("opacity-0", "pointer-events-none")
            this.overlay.classList.remove("opacity-50")

            this.container.classList.remove("max-w-md", "w-full", "mx-4")
            this.container.classList.add("absolute")

            // Position the container at the click position
            this.positionContextual()
        }

        // Animate in
        setTimeout(() => {
            this.container.classList.add("scale-100", "opacity-100")
            this.container.classList.remove("scale-95", "opacity-0")
        }, 10)

        // Dispatch open event
        this.dispatchEvent(
            new CustomEvent("popup-opened", {
                detail: { popupId: this.id, parentPopupId: this.parentPopup },
            }),
        )
    }

    /**
     * Position the popup at the click position
     */
    positionContextual() {
        const { x, y } = this.clickPosition

        // Get viewport dimensions
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // Set initial position
        this.container.style.position = "absolute"
        this.container.style.left = `${x}px`
        this.container.style.top = `${y}px`

        // Wait for the container to render to get its dimensions
        setTimeout(() => {
            const rect = this.container.getBoundingClientRect()

            // Check if the popup would go off-screen
            if (x + rect.width > viewportWidth) {
                this.container.style.left = `${Math.max(0, x - rect.width)}px`
            }

            if (y + rect.height > viewportHeight) {
                this.container.style.top = `${Math.max(0, y - rect.height)}px`
            }
        }, 0)
    }

    /**
     * Close the popup
     */
    close() {
        if (!this.isOpen) return

        // Animate out
        this.container.classList.add("scale-95", "opacity-0")
        this.container.classList.remove("scale-100", "opacity-100")
        this.overlay.classList.add("opacity-0")

        // Remove from active popups stack
        const index = PopupModal.activePopups.indexOf(this.id)
        if (index !== -1) {
            PopupModal.activePopups.splice(index, 1)
        }

        // Hide after animation
        setTimeout(() => {
            this.isOpen = false
            this.style.display = "none"

            // Dispatch close event
            this.dispatchEvent(
                new CustomEvent("popup-closed", {
                    detail: { popupId: this.id, parentPopupId: this.parentPopup },
                }),
            )
        }, 300)
    }

    /**
     * Set the content of the popup
     * @param {HTMLElement|string} content - Content to display
     */
    setContent(content) {
        // Clear existing content
        this.contentContainer.innerHTML = ""

        // Add new content
        if (typeof content === "string") {
            this.contentContainer.innerHTML = content
        } else if (content instanceof HTMLElement) {
            this.contentContainer.appendChild(content)
        }
    }

    /**
     * Set the title of the popup
     * @param {string} title - Title to display
     */
    setTitle(title) {
        if (this.titleElement) {
            this.titleElement.textContent = title
        }
    }

    /**
     * Set the display mode
     * @param {string} mode - Display mode ('center' or 'contextual')
     */
    setMode(mode) {
        this.mode = mode
    }

    /**
     * Check if the popup is open
     * @returns {boolean} - True if open, false if closed
     */
    isVisible() {
        return this.isOpen
    }

    /**
     * Toggle the popup
     * @param {Object} options - Configuration options (same as open method)
     */
    toggle(options = {}) {
        if (this.isOpen) {
            this.close()
        } else {
            this.open(options)
        }
    }

    /**
     * Static method to open a popup by ID
     * @param {string} popupId - ID of the popup to open
     * @param {Object} options - Configuration options
     */
    static openPopup(popupId, options = {}) {
        const popup = PopupModal.popupRegistry.get(popupId)
        if (popup) {
            popup.open(options)
            return popup
        }
        return null
    }

    /**
     * Static method to close a popup by ID
     * @param {string} popupId - ID of the popup to close
     */
    static closePopup(popupId) {
        const popup = PopupModal.popupRegistry.get(popupId)
        if (popup) {
            popup.close()
        }
    }

    /**
     * Static method to close all open popups
     */
    static closeAllPopups() {
        // Close in reverse order (last opened first)
        ;[...PopupModal.activePopups].reverse().forEach((popupId) => {
            const popup = PopupModal.popupRegistry.get(popupId)
            if (popup) {
                popup.close()
            }
        })
    }

    disconnectedCallback() {
        // Remove from registry
        PopupModal.popupRegistry.delete(this.id)

        // Remove from active popups if needed
        const index = PopupModal.activePopups.indexOf(this.id)
        if (index !== -1) {
            PopupModal.activePopups.splice(index, 1)
        }
    }
}

// Register the custom element
customElements.define("popup-modal", PopupModal)

export { PopupModal }
