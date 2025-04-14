/**
 * Dapta Chat Integration
 * Este archivo contiene todas las funciones necesarias para integrar
 * un chat con la API de Dapta, gestionar el historial y la interfaz de usuario.
 */

// ======== CONFIGURACIÓN ========
const API_KEY = "0J2dY-35d85cd0-608a-47ad-bd6e-acd32b7179a6-a"
const API_URL = `https://api.dapta.ai/api/openworks-172-349-5/post_alexie_chat`

// ======== UTILIDADES ========

/**
 * Genera un UUID v4 único
 * @returns {string} UUID generado
 */
export function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

// ======== GESTIÓN DE ALMACENAMIENTO ========

/**
 * Guarda los chats en localStorage
 * @param {Object} chats - Objeto con todos los chats
 */
export function saveChats(chats) {
    localStorage.setItem("dapta_chats", JSON.stringify(chats))
}

/**
 * Recupera los chats guardados en localStorage
 * @returns {Object} Objeto con todos los chats o un objeto vacío
 */
export function getSavedChats() {
    const chatsJson = localStorage.getItem("dapta_chats")
    return chatsJson ? JSON.parse(chatsJson) : {}
}

/**
 * Obtiene una lista de todos los chats guardados
 * @returns {Array} Array de objetos con información básica de cada chat
 */
export function listAllChats() {
    const chats = getSavedChats()
    return Object.values(chats).map((chat) => ({
        id: chat.id,
        nameChat: chat.nameChat,
        createdAt: chat.createdAt,
    }))
}

/**
 * Obtiene el chat activo actual
 * @returns {Object|null} Objeto con información del chat activo o null
 */
export function getActiveChat() {
    const activeChatId = localStorage.getItem("dapta_active_chat_id")
    const chats = getSavedChats()

    if (activeChatId && chats[activeChatId]) {
        return {
            id: activeChatId,
            ...chats[activeChatId],
        }
    }

    return null
}

/**
 * Cambia al chat especificado
 * @param {string} chatId - ID del chat al que cambiar
 * @returns {boolean} true si el cambio fue exitoso, false en caso contrario
 */
export function switchToChat(chatId) {
    const chats = getSavedChats()

    if (chats[chatId]) {
        localStorage.setItem("dapta_active_chat_id", chatId)
        return true
    }

    return false
}

// ======== GESTIÓN DE CHATS ========

/**
 * Crea un nuevo chat
 * @param threadId
 * @param nameChat
 * @returns {string} ID del chat creado
 */
export function createNewChat(threadId, nameChat = "") {
    const chats = getSavedChats()

    chats[threadId] = {
        id: threadId,
        createdAt: new Date().toISOString(),
        nameChat: nameChat,
        chatName: nameChat || `Chat ${Object.keys(chats).length + 1}`,
        messages: nameChat
            ? [
                {
                    content: nameChat,
                    role: "user",
                    timestamp: new Date().toISOString(),
                },
            ]
            : [],
    }

    localStorage.setItem("dapta_active_chat_id", threadId)
    saveChats(chats)
    loadChatHistory()

    return threadId
}

/**
 * Renombra un chat existente
 * @param {string} chatId - ID del chat a renombrar
 * @param {string} newName - Nuevo nombre para el chat
 * @returns {boolean} true si el renombrado fue exitoso, false en caso contrario
 */
export function renameChat(chatId, newName) {
    const chats = getSavedChats()

    if (chats[chatId]) {
        chats[chatId].chatName = newName
        saveChats(chats)
        loadChatHistory()
        return true
    }

    return false
}

/**
 * Envía un mensaje al chat activo o crea uno nuevo
 * @param {string} message - Mensaje a enviar
 * @param {boolean} createNew - Si es true, crea un nuevo chat
 * @returns {Promise<Object>} Objeto con la respuesta o error
 */
/**
 * Loads and displays chat history in the interface
 */
export function loadChatHistory() {
    const historialContainer = document.querySelector("seccion-historial")

    if (!historialContainer) {
        console.error("No se encontró el contenedor seccion-historial")
        return
    }

    // Preservar el primer botón (título de sección)
    const firstButton = historialContainer.querySelector("new-btn")
    historialContainer.innerHTML = ""
    if (firstButton) {
        historialContainer.appendChild(firstButton)
    }

    // Obtener y ordenar chats
    const allChats = listAllChats()
    if (allChats.length === 0) {
        const emptyMessage = document.createElement("div")
        emptyMessage.className = "text-center text-gray-500 dark:text-gray-400 p-4 text-sm"
        emptyMessage.textContent = "No hay chats guardados"
        historialContainer.appendChild(emptyMessage)
        return
    }

    // Ordenar por fecha (más reciente primero)
    allChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Crear elementos para cada chat
    allChats.forEach((chat) => {
        // Preparar texto a mostrar
        const displayText = chat.nameChat
            ? chat.nameChat.length > 25
                ? chat.nameChat.substring(0, 25) + "..."
                : chat.nameChat
            : "display:none"

        // Crear botón
        const chatButton = document.createElement("new-btn")
        chatButton.setAttribute("name", displayText)
        chatButton.setAttribute("styles", "px-6 py-3 text-lg rounded-xl")
        chatButton.setAttribute("icon-class", "fa-regular fa-comments")
        chatButton.setAttribute(
            "button-class",
            "bg-[#E1E5EB] dark:bg-[#3A3A3A] w-full max-w-full text-black dark:text-white justify-start font-semibold font-opensans hover:bg-[#FBFBFB] dark:hover:bg-[#4A4A4A] min-w-[63px] sm:w-[270px] sm:w-full max-w-[270px]",
        )
        chatButton.setAttribute("icon-and-text", "true")
        chatButton.setAttribute("data-chat-id", chat.id)

        // Configurar evento de clic
        chatButton.addEventListener("click", () => {
            switchToChat(chat.id)
            console.log(`Cambiado al chat: ${chat.id}`)

            // Resaltar botón seleccionado
            document.querySelectorAll("seccion-historial new-btn").forEach((btn) => {
                btn.classList.remove("selected-chat")
            })
            chatButton.classList.add("selected-chat")
        })

        historialContainer.appendChild(chatButton)
    })
}

/**
 * Obtiene un chat por su ID
 * @param {string} chatId - ID del chat a obtener
 * @returns {Object|null} Objeto con información del chat o null
 */
export function getChatById(chatId) {
    const chats = getSavedChats()
    return chats[chatId] || null
}

/**
 * Elimina un chat por su ID
 * @param {string} chatId - ID del chat a eliminar
 * @returns {boolean} true si la eliminación fue exitosa, false en caso contrario
 */
export function deleteChat(chatId) {
    const chats = getSavedChats()

    if (chats[chatId]) {
        delete chats[chatId]
        saveChats(chats)

        // Si el chat eliminado era el activo, limpiar el chat activo
        const activeChatId = localStorage.getItem("dapta_active_chat_id")
        if (activeChatId === chatId) {
            localStorage.removeItem("dapta_active_chat_id")
        }

        loadChatHistory()
        return true
    }

    return false
}

/**
 * Guarda un thread ID en localStorage
 * @param {string} threadId - ID del thread a guardar
 */
export function saveThreadId(threadId) {
    localStorage.setItem("dapta_current_thread", threadId)
}

/**
 * Obtiene el thread ID guardado en localStorage
 * @returns {string|null} ID del thread o null
 */
export function getThreadId() {
    return localStorage.getItem("dapta_current_thread")
}

// ======== INICIALIZACIÓN ========

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
export function initializeApp() {
    // Cargar historial de chats
    loadChatHistory()
}

// Inicializar cuando el DOM esté listo
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializeApp)
}
