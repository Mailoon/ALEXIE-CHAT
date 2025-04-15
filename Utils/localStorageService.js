const LocalStorageService = {
    listeners: [],

     setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    removeItem(key) {
        localStorage.removeItem(key);
    },

     getActiveChat() {
        const chatId = localStorage.getItem('active_thread_id');
        return chatId ? JSON.parse(chatId) : null;
    },

     setActiveChat(chatId) {
        localStorage.setItem('active_thread_id', JSON.stringify(chatId));
    },

    getMessages(threadId) {
        const raw = localStorage.getItem(`chat_${threadId}_messages`);
        const messages = raw ? JSON.parse(raw) : [];
        return messages.sort((a, b) => a.created_at - b.created_at);
    },

    setMessagesThreadId(threadId, messages) {
        const existing = JSON.parse(localStorage.getItem(`chat_${threadId}_messages`)) || [];
        const existingIds = new Set(existing.map(msg => msg.id));
        const uniqueNewMessages = messages.filter(msg => !existingIds.has(msg.id));
        const updatedMessages = [...existing, ...uniqueNewMessages];
        localStorage.setItem(`chat_${threadId}_messages`, JSON.stringify(updatedMessages));
    },

    addChatToHistory(threadId, messages) {
        const existing = JSON.parse(localStorage.getItem('chat_history')) || [];

        const alreadyExists = existing.find(chat => chat.id === threadId);
        if (alreadyExists) return;

        const userMsg = Array.isArray(messages) ? messages.find(msg => msg.role === 'user') : null;
        let nameChat = "New Chat";
        if (userMsg) {
            const rawText = userMsg.content?.[0]?.text?.value || '';
            const words = rawText.trim().split(/\s+/).slice(0, 20).join(' ');
            nameChat = words + (rawText.split(/\s+/).length > 20 ? "..." : "");
        }

        const newChat = {
            id: threadId,
            nameChat: nameChat
        };

        existing.push(newChat);
        this.setItem('chat_history', existing);
        this.listeners.forEach(listener => listener(newChat));
    },

    switchToChat(chatId) {
        const chat = LocalStorageService.getAllChats().find(c => c.id === chatId);

        if (!chat) {
            console.warn("Chat no encontrado en el historial:", chatId);
            return;
        }
        LocalStorageService.setActiveChat(chatId);
        const messages = LocalStorageService.getMessages(chatId);
        renderMessagesFromThread(chatId);

        console.log(`🔄 Switched to chat: ${chatId}`);
    },

    getAllChats() {
        return JSON.parse(localStorage.getItem('chat_history')) || [];
    },
}

