/**
 * Servicio para interactuar con la API de Dapta
 */
export const DaptaService = {
    async createChat(chat_id, message) {
        try {
            const response = await fetch('https://api.dapta.ai/api/openworks-172-349-5/consumed_api_alexie', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'x-api-key': 'Z1veq-35d85cd0-608a-47ad-bd6e-acd32b7179a6-a',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chat_id,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`Dapta API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Dapta Response:', data);
            return data;

        } catch (error) {
            console.error('❌ Error sending message to Dapta:', error.message);
            return null;
        }
    }
}