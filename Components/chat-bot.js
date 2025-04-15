/**
 * ChatInput - Custom component for chat input
 *
 * This component handles:
 * - User text input
 * - Processing state (sending/waiting for response)
 * - Send and stop buttons
 * - Automatic textarea size adjustment
 */
class ChatInput extends HTMLElement {
    constructor() {
        super()
        this.isProcessing = false // Track if we're waiting for a response
        this.placeholder = "Ask what you want"
        this.initialMessage = "How can we help you?"
        this.lastMessage = null;
    }

    /**
     * Lifecycle: when the component connects to the DOM
     * Initializes the component, renders the UI and sets up event listeners
     */
    connectedCallback() {
        // Get attributes with defaults
        this.placeholder = this.getAttribute("placeholder") || this.placeholder
        this.initialMessage = this.getAttribute("initial-message") || this.initialMessage
        // Create the component
        this.render()
        if (!this.inputElement.value.trim() || this.isProcessing) {
            this.sendButton.classList.add("hidden")
        }
        // Add event listeners
        this.setupEventListeners()
    }

    /**
     * Renders the HTML structure of the component
     * Includes:
     * - Initial message/title
     * - Textarea for user input
     * - Attach, network, send and stop buttons
     */
    render() {
        const maxSizeTextArea = this.getAttribute("max-size-textarea") || 200;
        // Create the container
        this.className = "w-full max-w-3xl mx-auto my-4";
        const showTitle = !localStorage.getItem("dapta_active_chat_id");
        // Create the HTML structure
        this.innerHTML = `
            <div class="flex flex-col w-full">
                <!-- Initial message/title -->
                ${showTitle ? `<h2 class="text-2xl font-bold text-center mb-4 dark:text-gray-300">${this.initialMessage}</h2>` : ""}
                
                <!-- Chat input container -->
                <div class="flex flex-col relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    <div class="flex-box">
                        <textarea 
                            class="chat-input flex-grow py-2 px-3 focus:outline-none text-gray-700 dark:text-gray-300 dark:bg-gray-800 resize-none overflow-hidden w-full"
                            placeholder="${this.placeholder}"
                            rows="1"
                            style="max-height: ${maxSizeTextArea}px;"
                        ></textarea>
                    </div>
                    <!-- Input field -->
                    <div class="flex justify-between px-4 py-2 dark:text-gray-300"">
                        <!-- Left icons -->
                        <div class="flex items-center space-x-2 mr-3">
                            <button class="attachment-btn text-gray-500 hover:text-gray-700 transition-colors">
                                <i class="fa-solid fa-paperclip text-xl"></i>
                            </button>
                            <button class="network-btn flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                                <i class="fa-solid fa-globe text-xl mr-1"></i>
                                <span>Network</span>
                            </button>
                        </div>
                        <!-- Send/Stop button -->
                        
                        <button class="send-btn text-gray-700 hover:text-gray-900 transition-colors ${this.isProcessing ? "hidden" : ""}">
                            <i class="fa-solid fa-paper-plane text-xl"></i>
                        </button>
                        <button class="stop-btn bg-black text-white rounded-full p-2 ${this.isProcessing ? "" : "hidden"}">
                            <i class="fa-solid fa-stop text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        `

        // Store references to elements
        this.inputElement = this.querySelector(".chat-input");
        this.sendButton = this.querySelector(".send-btn");
        this.stopButton = this.querySelector(".stop-btn");
    }

    /**
     * Sets up event listeners for interactive elements
     * - Send button: sends the message
     * - Stop button: stops processing
     * - Enter key: sends the message
     * - Input change: adjusts height and shows/hides send button
     */
    setupEventListeners() {
        const maxSizeTextArea = this.getAttribute("max-size-textarea") || 200;
        // Send button click
        this.sendButton.addEventListener("click", async () => {
            await this.sendMessage();
            this.inputElement.value = '';
        })

        // Stop button click
        this.stopButton.addEventListener("click", () => {
            this.stopProcessing();
        })

        // Enter key press in input
        this.inputElement.addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                await this.sendMessage();
                this.inputElement.value = '';
                e.preventDefault();
            }
        })

        // Input change to show/hide send button
        this.inputElement.addEventListener("input", () => {
            this.inputElement.style.height = "auto"; // Reset height
            this.inputElement.style.height = `${Math.min(this.inputElement.scrollHeight, maxSizeTextArea)}px`; // Adjust up to 400px
            this.inputElement.style.overflowY = this.inputElement.scrollHeight > maxSizeTextArea ? "auto" : "hidden"; // Adjust up to 400px
            // Show/hide send button
            if (this.inputElement.value.trim() && !this.isProcessing) {
                this.sendButton.classList.remove("hidden");
            } else if (!this.inputElement.value.trim()) {
                this.sendButton.classList.add("hidden");
            }
        })
    }

    /**
     * Sends the user's message
     *
     * IMPORTANT: This function should connect with DaptaService to:
     * 1. Send the message to the Dapta API
     * 2. Receive and process the response
     * 3. Update the UI with the response
     *
     * Currently it only changes the visual state and triggers an event,
     * but does not perform actual communication with the API.
     */
    async sendMessage() {
        const message = this.inputElement.value.trim()
        if (!message || this.isProcessing) return

        const nameChat = message.length > 20 ? message.substring(0, 20) : message
        this.lastMessage = nameChat

        // Cambiar a estado de procesamiento
        this.setProcessingState(true)

        try {
            let result;

            if(localStorage.getItem("dapta_active_chat_id")) {
                result = await enviarMensaje(nameChat, localStorage.getItem("dapta_active_chat_id"))
                console.log("message sent success:", result)
            }

            else {
                result = await iniciarNuevoChat(nameChat)
                console.log("chat created success", result)
            }

            if (result.success) {
                console.log("action made with success", result)
                // Puedes actualizar la UI aquí si quieres
            } else {
                console.error("Fail in create the chat:", result.message)
            }
        } catch (error) {
            console.error("Error in crear new chat:", error)
        } finally {
            this.setProcessingState(false)
        }
    }


    /**
     * Stops the current processing
     *
     * IMPORTANT: This function should connect with DaptaService to:
     * 1. Cancel the ongoing request if possible
     * 2. Clean up any temporary state
     *
     * Currently it only changes the visual state and triggers an event.
     */
    stopProcessing() {
        // Dispatch event to stop processing
        const event = new CustomEvent("chat-processing-stopped")
        this.dispatchEvent(event)

        // Reset the processing state
        this.setProcessingState(false)

        // To integrate with DaptaService:
        // 1. Call DaptaService.cancelRequest() if it exists
        // 2. Clean up any timers or pending state
    }

    /**
     * Changes the visual state of the component between processing and ready
     *
     * When processing:
     * - Hides the send button
     * - Shows the stop button
     * - Disables the input
     *
     * When ready:
     * - Shows the send button
     * - Hides the stop button
     * - Enables the input and focuses it
     *
     * @param {boolean} isProcessing - If in processing state
     */
    setProcessingState(isProcessing) {
        this.isProcessing = isProcessing

        if (isProcessing) {
            this.sendButton.classList.add("hidden");
            this.stopButton.classList.remove("hidden");
        } else {
            this.stopButton.classList.add("hidden");
            this.inputElement.value = this.lastMessage;
            this.inputElement.disabled = false;
        }
    }

    /**
     * Public method to reset the component
     * Useful after changing chats or when starting the application
     */
    reset() {
        this.setProcessingState(false)
    }

    /**
     * Public method to change the placeholder
     * @param {string} text - New placeholder text
     */
    setPlaceholder(text) {
        this.placeholder = text
        this.inputElement.placeholder = text
    }
}

// Register the custom element
customElements.define("chat-input", ChatInput)
