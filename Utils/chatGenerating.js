const extractMessageText = (msg) => {
    if (Array.isArray(msg.content)) {
        return msg.content.map(c => c.text?.value || "").join(" ");
    }
    return msg.content;
};

const createTypingIndicator = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "self-start bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-  max-w-xl flex items-center gap-1";

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.className = "w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce";
        dot.style.animationDelay = `${i * 0.2}s`;
        wrapper.appendChild(dot);
    }

    return wrapper;
};

const createMessageElement = (msg, isLoading = false) => {
    const wrapper = document.createElement("div");
    wrapper.className = `w-full flex mb-2 ${
        msg.role === "user" ? "justify-end" : "justify-start"
    }`;

    const bubble = document.createElement("div");
    bubble.className = `relative max-w-xl px-4 py-2 whitespace-pre-wrap before:content-[''] before:absolute ${
        msg.role === "user"
            ? "bg-blue-500 text-white rounded-t-lg rounded-bl-lg bubble-user before:border-t-transparent before:border-b-transparent before:border-l-blue-500"
            : "bg-gray-300 rounded-t-lg rounded-br-lg dark:bg-gray-700 text-black dark:text-white bubble-assistant before:border-r-[10px] before:border-t-transparent before:border-b-transparent before:border-r-gray-300 dark:before:border-r-gray-700"
    }`;

    if (!isLoading) {
        bubble.textContent = extractMessageText(msg);
    }

    wrapper.appendChild(bubble);
    return wrapper;
};

const renderAssistantMessage = (msg, { isNew = false } = {}) => {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const wrapInFlex = (element) => {
        const wrapper = document.createElement("div");
        wrapper.className = "w-full flex justify-start mb-2";
        wrapper.appendChild(element);
        return wrapper;
    };

    if (!isNew) {
        // Mensaje guardado → mostrar directamente sin animación
        const el = createMessageElement(msg);
        container.appendChild(wrapInFlex(el));
        container.scrollTop = container.scrollHeight;
        return;
    }

    // Mensaje nuevo → mostrar animación de typing
    const typingEl = createTypingIndicator();
    container.appendChild(wrapInFlex(typingEl));
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        const finalEl = createMessageElement(msg, false);
        finalEl.textContent = "";

        typingEl.parentElement.replaceWith(wrapInFlex(finalEl)); // Reemplaza el contenedor entero

        const fullText = extractMessageText(msg);
        let i = 0;

        const typingInterval = setInterval(() => {
            finalEl.textContent += fullText.charAt(i);
            i++;
            container.scrollTop = container.scrollHeight;
            if (i >= fullText.length) clearInterval(typingInterval);
        }, 20);
    }, 800);
};

const renderSingleMessage = (msg, container) => {
    if (!container) return;

    if (msg.role === "assistant") {
        // Mensaje antiguo → no animado
        const staticRender = false;
        renderAssistantMessage(msg, { isNew: staticRender });
    } else {
        const userEl = createMessageElement(msg, false);
        container.appendChild(userEl);
        container.scrollTop = container.scrollHeight;
    }
};

const renderAssistantResponse = (msg) => {
    // Mensaje nuevo (respuesta del assistant)
    renderAssistantMessage(msg, { isNew: true });
};

const renderNewUserMessage = (msg) => {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "w-full flex justify-end mb-2";

    const bubble = document.createElement("div");
    bubble.className = "max-w-xl px-4 py-2 rounded-t-lg rounded-bl-lg whitespace-pre-wrap bg-blue-500 text-white";
    bubble.textContent = typeof msg === "string" ? msg : msg.content?.[0]?.text?.value || "";

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
};

const renderMessagesFromThread = (threadId) => {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;
    container.innerHTML = "";

    const messages = LocalStorageService.getMessages(threadId);
    messages.forEach((msg) => {
        renderSingleMessage(msg, container);
    });
};

