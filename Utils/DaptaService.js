/**
 * Servicio para interactuar con la API de Dapta
 */
export const DaptaService = {
    API_KEY: "sVLfT-8f5211b7-ea23-4f31-b0ab-29710a46e83b-f",
    BASE_URL: "https://api.dapta.ai/api/devops-dapta-tech-169-938-7",
    AGENT_ID: "ffe2e8a3-187f-4f7b-b771-c72e276e32e8", // Tu ID de agente

    /**
     * Crea un nuevo chat (thread) en Dapta
     * @returns {Promise<Object>} Objeto con el ID del thread creado
     */
    async createChat() {
        try {
            const response = await fetch(`${this.BASE_URL}/createchat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.API_KEY
                },
                body: JSON.stringify({
                    agent_id: this.AGENT_ID
                })
            });

            if (!response.ok) {
                throw new Error(`Error al crear chat: ${response.statusText}`);
            }

            const data = await response.json();
            return data.thread;
        } catch (error) {
            console.error("Error al crear chat en Dapta:", error);
            return null;
        }
    },

    /**
     * Crea un registro en el historial de chat
     * @param {string} threadId - ID del thread creado
     * @param {string} name - Nombre o primer mensaje del chat
     * @returns {Promise<Object>} Resultado de la operación
     */
    async createChatHistory(threadId, name) {
        try {
            const response = await fetch(`${this.BASE_URL}/create_chat_history`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.API_KEY
                },
                body: JSON.stringify({
                    agent_id: this.AGENT_ID,
                    thread_id: threadId,
                    name: name,
                    source: "Frontend-Custom"
                })
            });

            if (!response.ok) {
                throw new Error(`Error al crear historial: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error al crear historial en Dapta:", error);
            return { error: true };
        }
    },

    /**
     * Envía un mensaje al chat
     * @param {string} message - Contenido del mensaje
     * @param {string} threadId - ID del thread
     * @returns {Promise<Object>} Resultado de la operación
     */
    async sendMessage(message, threadId) {
        try {
            // Obtener ID de usuario o generar uno
            const userId = localStorage.getItem("dapta_user_id") || this.generateUserId();

            const response = await fetch(`${this.BASE_URL}/createmessage?threadId=${threadId}&assistantId=OpenWorks&agentId=${this.AGENT_ID}&organizationId=OpenWorks&userId=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.API_KEY
                },
                body: JSON.stringify({
                    content: message,
                    role: "user"
                })
            });

            if (!response.ok) {
                throw new Error(`Error al enviar mensaje: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error al enviar mensaje a Dapta:", error);
            return { error: true };
        }
    },

    /**
     * Obtiene los mensajes de un chat
     * @param {string} threadId - ID del thread
     * @returns {Promise<Array>} Array con los mensajes
     */
    async getMessages(threadId) {
        try {
            const response = await fetch(`${this.BASE_URL}/getmessages/${threadId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.API_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener mensajes: ${response.statusText}`);
            }

            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error("Error al obtener mensajes de Dapta:", error);
            return [];
        }
    },

    /**
     * Genera un ID de usuario único
     * @returns {string} ID generado
     */
    generateUserId() {
        const userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem("dapta_user_id", userId);
        return userId;
    }
};