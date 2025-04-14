/**
 * DynamicNavbar - Custom component for a responsive navigation sidebar
 *
 * This component creates a navigation bar that can be in three states:
 * - collapsed (60px)
 * - medium (150px)
 * - expanded (300px)
 *
 * It automatically adjusts based on screen size and provides manual toggle controls.
 */
class DynamicNavbar extends HTMLElement {
    constructor() {
        super()
        this._items = []
        this._position = "expanded" // Default position: 'collapsed', 'medium', 'expanded'
        this._resizeObserver = null // To observe window size changes
        this._manualOverride = false // Flag to track if user manually changed the size
    }

    connectedCallback() {
        // Get attributes with defaults
        const position = this.getAttribute("position") || "expanded"
        const transitionDuration = this.getAttribute("transition-duration") || "300ms"
        const styles = this.getAttribute("styles") || ""
        const accentColor = this.getAttribute("accent-color") || "bg-chat-orange"
        const textColor = this.getAttribute("text-color") || "text-gray-700"

        // Set initial position
        this._position = position

        // Create the navbar container
        const styles_s = (styles || "").split(" ").filter(Boolean)
        this.classList.add("h-full", "flex", "flex-col", "relative", "shadow-md", "transition-all", ...styles_s)

        this.style.width = "100%"
        this.style.height = "100%"
        this.style.transitionDuration = transitionDuration
        this.style.zIndex = "50"

        // Set initial width based on position
        this.updateWidth(position)

        // Add toggle buttons
        this._addToggleButtons()

        // Update items visibility based on current position
        this._updateItemsVisibility()

        // Set up ResizeObserver to respond to screen size changes
        this._setupResizeObserver()

        // Add window resize listener as a fallback
        window.addEventListener("resize", this._handleResize.bind(this))
    }

    /**
     * Sets up a ResizeObserver to make the navbar responsive
     * based on screen size
     */
    _setupResizeObserver() {
        // Clear existing observer if there is one
        if (this._resizeObserver) {
            this._resizeObserver.disconnect()
        }

        // Create new observer
        this._resizeObserver = new ResizeObserver(() => {
            this._handleResize()
        })

        // Observe changes in window size
        this._resizeObserver.observe(document.body)
    }

    /**
     * Handles resize events and adjusts navbar width accordingly
     * Only auto-adjusts if user hasn't manually overridden the size
     */
    _handleResize() {
        // Skip auto-adjustment if user manually changed the size
        if (this._manualOverride) return

        // Get window width
        const windowWidth = window.innerWidth

        // Adjust navbar based on screen size
        if (windowWidth < 640) {
            // Small mobile
            this._autoUpdateWidth("collapsed")
        } else if (windowWidth < 768) {
            // Mobile/tablet
            this._autoUpdateWidth("medium")
        } else {
            // Desktop
            this._autoUpdateWidth("expanded")
        }
    }

    /**
     * Updates width automatically (without setting manual override)
     * @param {string} position - Position to set ('collapsed', 'medium', 'expanded')
     */
    _autoUpdateWidth(position) {
        if (this._position !== position) {
            const oldPosition = this._position
            this._position = position

            switch (position) {
                case "collapsed":
                    this.style.width = "60px"
                    break
                case "medium":
                    this.style.width = "150px"
                    break
                case "expanded":
                    this.style.width = "300px"
                    break
                default:
                    this.style.width = "150px"
            }

            // Update aria-expanded attribute for accessibility
            this.setAttribute("aria-expanded", position === "expanded" ? "true" : "false")

            // Update all items to show/hide text based on position
            this._updateItemsVisibility()

            // Update toggle buttons visibility
            this._updateToggleButtonsVisibility(oldPosition, position)

            // Trigger resize event on all new-btn elements to update their display
            this.querySelectorAll("new-btn").forEach((btn) => {
                // Create and dispatch a resize event to trigger the ResizeObserver
                const resizeEvent = new Event("resize")
                btn.dispatchEvent(resizeEvent)

                // Force the ResizeObserver to recalculate
                if (btn.resizeObserver) {
                    btn.resizeObserver.disconnect()
                    btn.resizeObserver.observe(btn)
                }
            })

            // Dispatch custom event
            const event = new CustomEvent("navbarPositionChange", {
                detail: { position: this._position, automatic: true },
            })
            this.dispatchEvent(event)
        }
    }

    // Method to add menu items programmatically
    addItem(icon, label, action, isAccent = false, position = "middle") {
        const item = { icon, label, action, isAccent, position }
        this._items.push(item)

        return this // Allow chaining
    }

    // Update width based on position (manual user action)
    updateWidth(position) {
        // Set manual override flag when user explicitly changes width
        this._manualOverride = true

        const oldPosition = this._position
        this._position = position

        switch (position) {
            case "collapsed":
                this.style.width = "60px"
                break
            case "medium":
                this.style.width = "150px"
                break
            case "expanded":
                this.style.width = "300px"
                break
            default:
                this.style.width = "150px"
        }

        // Update aria-expanded attribute for accessibility
        this.setAttribute("aria-expanded", position === "expanded" ? "true" : "false")

        // Update all items to show/hide text based on position
        this._updateItemsVisibility()

        // Update toggle buttons visibility
        this._updateToggleButtonsVisibility(oldPosition, position)

        // Trigger resize event on all new-btn elements to update their display
        this.querySelectorAll("new-btn").forEach((btn) => {
            // Create and dispatch a resize event to trigger the ResizeObserver
            const resizeEvent = new Event("resize")
            btn.dispatchEvent(resizeEvent)

            // Force the ResizeObserver to recalculate
            if (btn.resizeObserver) {
                btn.resizeObserver.disconnect()
                btn.resizeObserver.observe(btn)
            }
        })

        // Dispatch custom event
        const event = new CustomEvent("navbarPositionChange", {
            detail: { position: this._position, automatic: false },
        })
        this.dispatchEvent(event)
    }

    /**
     * Updates toggle buttons visibility based on position change
     * @param {string} oldPosition - Previous position
     * @param {string} newPosition - New position
     */
    _updateToggleButtonsVisibility(oldPosition, newPosition) {
        const expandButton = this.querySelector(".navbar-expand")
        const collapseButton = this.querySelector(".navbar-collapse")

        if (!expandButton || !collapseButton) return

        // Update button visibility based on new position
        if (newPosition === "collapsed") {
            expandButton.style.display = "flex"
            collapseButton.style.display = "none"
        } else if (newPosition === "expanded") {
            expandButton.style.display = "none"
            collapseButton.style.display = "flex"
        } else {
            // medium
            expandButton.style.display = "flex"
            collapseButton.style.display = "flex"
        }
    }

    // Update items visibility based on current position
    _updateItemsVisibility() {
        const itemTexts = this.querySelectorAll(".item-text, .text")
        const itemIcons = this.querySelectorAll(".item-icon, i")

        if (this._position === "collapsed") {
            // Hide text, center icons
            itemTexts.forEach((text) => {
                text.style.opacity = "0"
                text.style.display = "none"
            })

            itemIcons.forEach((icon) => {
                icon.classList.add("justify-center")
                // Make icons larger in collapsed mode for better visibility
                icon.classList.add("text-2xl")
            })

            // Adjust button widths for collapsed state
            this.querySelectorAll("button:not(.navbar-expand):not(.navbar-collapse)").forEach((button) => {
                button.classList.add("w-10", "h-10", "p-0", "justify-center")
                button.classList.remove("px-4", "py-2", "py-3")
            })

            // Adjust section padding for collapsed state
            this.querySelectorAll("seccion-create, seccion-carpetas, seccion-historial, seccion-footer").forEach(
                (section) => {
                    section.classList.add("hidden")
                    section.classList.remove("p-4", "p-3", "p-2")
                },
            )
        } else {
            // Show text, align icons
            itemTexts.forEach((text) => {
                text.style.opacity = "1"
                text.style.display = "inline"
            })

            itemIcons.forEach((icon) => {
                icon.classList.remove("justify-center", "text-2xl")
            })

            // Restore button widths for expanded states
            this.querySelectorAll("button:not(.navbar-expand):not(.navbar-collapse)").forEach((button) => {
                button.classList.remove("w-10", "h-10", "p-0", "justify-center")

                // Check if the button has specific classes from new-btn
                if (button.closest("new-btn")) {
                    const newBtn = button.closest("new-btn")
                    const styles = newBtn.getAttribute("styles") || ""

                    // Re-apply original padding classes if they exist in styles
                    if (styles.includes("px-6")) button.classList.add("px-6")
                    if (styles.includes("py-3")) button.classList.add("py-3")
                    if (!styles.includes("px-") && !styles.includes("py-")) {
                        button.classList.add("px-4", "py-2") // Default padding
                    }
                } else {
                    button.classList.add("px-4", "py-2") // Default padding
                }
            })

            // Restore section padding
            this.querySelectorAll("seccion-create").forEach((section) => {
                section.classList.remove("items-center", "hidden")
            })

            this.querySelectorAll("seccion-carpetas, seccion-historial, seccion-footer").forEach((section) => {
                section.classList.remove("p-4", "hidden")
                section.classList.add("p-4")
            })
        }
    }

    // Private method to add toggle buttons
    _addToggleButtons() {
        if (this.querySelector(".navbar-expand") || this.querySelector(".navbar-collapse")) {
            return // Exit if buttons already exist
        }

        // Create expand button
        const expandButton = document.createElement("button")
        expandButton.className =
            "navbar-expand absolute top-10 right-[-15px] w-6 h-6 flex items-center justify-center text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        expandButton.setAttribute("aria-label", "Expand sidebar")
        expandButton.innerHTML = '<i class="fa-solid fa-arrow-right fa-xl"></i>'
        expandButton.style.display = "none"

        // Create collapse button
        const collapseButton = document.createElement("button")
        collapseButton.className =
            "navbar-collapse absolute top-4 right-[-15px] w-6 h-6 flex items-center justify-center text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        collapseButton.setAttribute("aria-label", "Collapse sidebar")
        collapseButton.innerHTML = '<i class="fa-solid fa-arrow-left fa-xl"></i>'
        collapseButton.style.display = "flex"

        // Set initial button visibility based on position
        if (this._position === "collapsed") {
            expandButton.style.display = "flex"
            collapseButton.style.display = "none"
        } else if (this._position === "expanded") {
            expandButton.style.display = "none"
            collapseButton.style.display = "flex"
        } else {
            // medium
            expandButton.style.display = "flex"
            collapseButton.style.display = "flex"
        }

        // Add click handlers
        expandButton.addEventListener("click", () => {
            // Set manual override when user clicks
            this._manualOverride = true

            const currentPosition = this._position
            if (currentPosition === "collapsed") {
                this.updateWidth("medium")
            } else if (currentPosition === "medium") {
                this.updateWidth("expanded")
                this.querySelectorAll("seccion-create").forEach((section) => {
                    section.classList.remove("p-4")
                    section.classList.add("items-center")
                })
            }
        })

        collapseButton.addEventListener("click", () => {
            // Set manual override when user clicks
            this._manualOverride = true

            const currentPosition = this._position
            if (currentPosition === "expanded") {
                this.updateWidth("medium")
            } else if (currentPosition === "medium") {
                this.updateWidth("collapsed")
            }
        })

        // Add buttons to navbar
        this.appendChild(expandButton)
        this.appendChild(collapseButton)
    }

    // Helper method to get SVG icon based on name
    _getIconSvg(iconName) {
        const icons = {
            chat: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
            "new-chat": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="11"></line><line x1="12" y1="7" x2="12" y2="7"></line><line x1="12" y1="15" x2="12" y2="15"></line></svg>`,
            legal: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
            history: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>`,
            help: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            "night-mode": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
            settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
            folder: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
            bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
            eye: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
            search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
        }

        return icons[iconName] || icons["chat"] // Default to chat icon if not found
    }

    /**
     * Method to clean up resources when the component is removed from the DOM
     */
    disconnectedCallback() {
        // Disconnect the ResizeObserver to prevent memory leaks
        if (this._resizeObserver) {
            this._resizeObserver.disconnect()
            this._resizeObserver = null
        }

        // Remove window resize listener
        window.removeEventListener("resize", this._handleResize.bind(this))
    }

    /**
     * Reset manual override to allow automatic resizing again
     */
    resetManualOverride() {
        this._manualOverride = false
        this._handleResize() // Immediately adjust to current screen size
    }
}

// Register the custom element
customElements.define("dynamic-navbar", DynamicNavbar)
