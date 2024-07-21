document.addEventListener('DOMContentLoaded', () => {
    const chatbotIconUrl = window.chatbotConfig?.iconUrl || 'images/8ball_texture.png';
    const chatbotIcon = document.createElement('div');
    chatbotIcon.className = 'chatbot-icon';
    chatbotIcon.innerHTML = `<img src="${chatbotIconUrl}" alt="Chatbot Icon">`;

    document.body.appendChild(chatbotIcon);

    const chatbotWindow = document.createElement('div');
    chatbotWindow.className = 'chatbot-window';
    chatbotWindow.innerHTML = `
        <div class="chatbot-header">
            <h4>Chat with us!</h4>
            <button class="close-chatbot">&times;</button>
        </div>
        <div class="chatbot-messages"></div>
        <div class="chatbot-input">
            <input type="text" placeholder="Type a message...">
            <button class="send-chatbot">Send</button>
        </div>
    `;
    document.body.appendChild(chatbotWindow);

    const chatbotMessages = chatbotWindow.querySelector('.chatbot-messages');
    const chatbotInput = chatbotWindow.querySelector('.chatbot-input input');
    const sendChatbot = chatbotWindow.querySelector('.send-chatbot');
    const closeChatbot = chatbotWindow.querySelector('.close-chatbot');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';

    // Show chatbot window
    chatbotIcon.addEventListener('click', async () => {
        chatbotWindow.style.display = 'flex';
        await uploadPDF(); // Automatically upload the PDF when the chatbot icon is clicked
    });

    // Close chatbot window
    closeChatbot.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
    });

    // Send message
    sendChatbot.addEventListener('click', async () => {
        const message = chatbotInput.value;
        if (message.trim() !== '') {
            addMessageToChat('You', message);
            chatbotInput.value = '';

            // Add typing indicator
            chatbotMessages.appendChild(typingIndicator);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

            // Send query to the API
            try {
                const response = await fetch('http://154.38.168.42:8001/api/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: 'gre8intelligence_session',
                        query: message
                    })
                });
                const result = await response.json();
                removeTypingIndicator();
                addMessageToChat('GRE8I', result.answer || result.error);
            } catch (error) {
                removeTypingIndicator();
                addMessageToChat('GRE8I', 'Sorry I am not available right now, please try again later');
            }
        }
    });

    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        if (typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }
    }

    // Function to upload PDF
    async function uploadPDF() {
        try {
            const response = await fetch('https://boazleleina.com/gre8i/images/gre8.pdf');
            const fileBlob = await response.blob();
            const file = new File([fileBlob], 'gre8.pdf', { type: 'application/pdf' });

            const formData = new FormData();
            formData.append('sessionId', 'gre8intelligence_session');
            formData.append('pdf', file);

            const uploadResponse = await fetch('http://154.38.168.42:8001/api/pdf', {
                method: 'POST',
                body: formData
            });

            const result = await uploadResponse.json();
            if (result.error) {
                addMessageToChat('GRE8I', result.error);
            } else {
                addMessageToChat('GRE8I', 'Welcome, how may I help you today?😎');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            addMessageToChat('GRE8I', 'Sorry I can\'t seem to reach you😢');
        }
    }

    // Call uploadPDF on page load (Optional, in case you want to upload immediately on load)
    // uploadPDF();
});
