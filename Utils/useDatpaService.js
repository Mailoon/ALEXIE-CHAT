import {DaptaService} from "./DaptaService.js"
import {
    createNewChat,
    getActiveChat, getThreadId,
    loadChatHistory,
    saveThreadId,
    switchToChat,
} from "./Utils-methods-data.js"

/**
 * Inicializa un nuevo chat con Dapta
 * @param {string} nameChat - Primer mensaje para enviar al chat
 * @returns {Promise<Object>} Información del chat creado
 */
const iniciarNuevoChat = async (nameChat) => {
    try {
        // 1. Crear thread en Dapta
        const thread = await DaptaService.createChat()
        if (!thread) {
            console.error("Error in loading chat")
            return { error: true, message: "No se pudo crear el chat" }
        }

        // 2. Crear historial en Dapta
        const responseChatHistory = await DaptaService.createChatHistory(thread.id, nameChat)

        // 3. Guardar ID del thread
        const threadId = responseChatHistory.value.item.thread_id;
        saveThreadId(threadId);
        createNewChat(threadId, nameChat);
        console.log("responsChatHistory:", responseChatHistory)

        // 4. Enviar primer mensaje
        const sendMessage = await DaptaService.sendMessage(nameChat, threadId)
        console.log("SendMessage:", sendMessage)

        // 5. Cargar mensajes
        const mensajes = await DaptaService.getMessages(threadId)
        console.log("mensajes:", mensajes)

        // 7. Actualizar la UI
        loadChatHistory()

        return {
            threadId,
            mensajes,
            success: true,
        }
    } catch (error) {
        console.error("Error al iniciar nuevo chat:", error)
        return { error: true, message: error.message }
    }
}

/**
 * Envía un mensaje al chat activo o al chat especificado
 * @param {string} mensaje - Mensaje a enviar
 * @param {string} [threadId] - ID del thread (opcional)
 * @returns {Promise<Object>} Resultado de la operación
 */
export const enviarMensaje = async (mensaje, threadId) => {
    try {
        // Si no se proporciona un threadId, intentar obtener el activo
        if (!threadId) {
            // Si no existe, intentamos obtener el chat activo
            if (!threadId) {
                const activeChat = getActiveChat()
                if (activeChat) {
                    threadId = activeChat.id
                } else {
                    // Si no hay chat activo, crear uno nuevo
                    console.log("No hay chat activo, creando uno nuevo...")
                    return await iniciarNuevoChat(mensaje)
                }
            }
        }

        // Enviar mensaje a Dapta
        const response = await DaptaService.sendMessage(mensaje, threadId)

        // Si hay error, lanzar excepción
        if (response.error) {
            throw new Error(response.message || "Error al enviar mensaje")
        }

        // Obtener mensajes actualizados
        const mensajes = await DaptaService.getMessages(threadId)

        // Actualizar la UI
        loadChatHistory()

        return {
            response,
            mensajes,
            success: true,
        }
    } catch (error) {
        console.error("Error al enviar mensaje:", error)
        return { error: true, message: error.message }
    }
}

/**
 * Obtiene los mensajes del chat activo o del chat especificado
 * @param {string} [threadId] - ID del thread (opcional)
 * @returns {Promise<Array>} Array con los mensajes
 */
export const obtenerMensajes = async (threadId) => {
    try {
        // Si no se proporciona un threadId, intentar obtener el activo
        if (!threadId) {
            // Primero intentamos obtener el thread de dapta_current_thread
            threadId = getThreadId()
            // Si no existe, intentamos obtener el chat activo
            if (!threadId) {
                const activeChat = getActiveChat()
                if (activeChat) {
                    threadId = activeChat.id
                } else {
                    console.warn("No hay chat activo")
                    return []
                }
            }
        }

        return await DaptaService.getMessages(threadId)
    } catch (error) {
        console.error("Error al obtener mensajes:", error)
        return []
    }
}

/**
 * Obtiene el ID del thread actual
 * @returns {string|null} ID del thread o null
 */
export const obtenerThreadActual = () => {
    // Primero intentamos obtener el thread de dapta_current_thread
    const threadId = getThreadId()
    if (threadId) return threadId

    // Si no existe, intentamos obtener el chat activo
    const activeChat = getActiveChat()
    return activeChat ? activeChat.id : null
}

/**
 * Cambia al chat especificado y actualiza la UI
 * @param {string} chatId - ID del chat al que cambiar
 * @returns {Promise<Object>} Resultado de la operación
 */
export const cambiarChat = async (chatId) => {
    try {
        const success = switchToChat(chatId)
        if (success) {
            // Actualizamos la UI
            loadChatHistory()

            // Obtenemos los mensajes del chat
            const mensajes = await DaptaService.getMessages(chatId)

            return {
                success: true,
                chatId,
                mensajes,
            }
        }
        return { success: false, message: "No se pudo cambiar al chat especificado" }
    } catch (error) {
        console.error("Error al cambiar de chat:", error)
        return { success: false, message: error.message }
    }
}

/**
 * Verifica si hay un chat activo y lo carga, o crea uno nuevo si no existe
 * @param {string} [mensajeInicial] - Mensaje inicial opcional si se crea un nuevo chat
 * @returns {Promise<Object>} Información del chat cargado o creado
 */
export const inicializarChat = async (mensajeInicial = "") => {
    try {
        // Verificar si hay un thread actual
        const threadId = obtenerThreadActual()

        if (threadId) {
            // Si hay un thread actual, lo usamos
            const mensajes = await DaptaService.getMessages(threadId)

            // Actualizar la UI
            loadChatHistory()

            return {
                threadId,
                mensajes,
                isNew: false,
                success: true,
            }
        } else {
            // Si no hay thread actual, creamos uno nuevo
            if (mensajeInicial) {
                return await iniciarNuevoChat(mensajeInicial)
            } else {
                const thread = await DaptaService.createChat()
                if (thread) {
                    const threadId = thread.id
                    saveThreadId(threadId)

                    // Crear chat local
                    createNewChat("", `Chat ${new Date().toLocaleTimeString()}`)

                    // Actualizar la UI
                    loadChatHistory()

                    return {
                        threadId,
                        mensajes: [],
                        isNew: true,
                        success: true,
                    }
                }
            }
        }

        return { success: false, message: "No se pudo inicializar el chat" }
    } catch (error) {
        console.error("Error al inicializar chat:", error)
        return { success: false, message: error.message }
    }
}

window.iniciarNuevoChat = iniciarNuevoChat;