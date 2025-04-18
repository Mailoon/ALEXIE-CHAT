import { DaptaService } from "./DaptaService.js"

/**
 * Inicializa un nuevo chat con Dapta
 * @param {string} Message - Primer mensaje para enviar al chat
 * @returns {Promise<Object>} Información del chat creado
 */
const iniciarNuevoChat = async (Message) => {
    try {
        let chatActive = LocalStorageService.getActiveChat();
        const res = await DaptaService.createChat(chatActive,Message);
        if (!res) {
            console.error("Error in loading chat");
            return {error: true, message: "No se pudo crear el chat"}
        }
        const threadId = res.response.thread_id;
        const messages = res.response.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        LocalStorageService.addChatToHistory(threadId,res);
        LocalStorageService.switchToChatSendMessage(res.response.thread_id);
        LocalStorageService.setMessagesThreadId(threadId,res.response.messages);
        const lastAssistantMessage = messages
            .filter(msg => msg.role === "assistant")
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .pop();
        if (lastAssistantMessage) {
            renderAssistantResponse(lastAssistantMessage);
        }

        return {
            success: true,
        }
    } catch (error) {
        console.error("Error al iniciar nuevo chat:", error);
        return { error: true, message: error.message };
    }
}

window.iniciarNuevoChat = iniciarNuevoChat;