const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            addMessage(text, 'outbound');
            messageInput.value = '';
            setTimeout(() => {
                addMessage('This is a simulated reply.', 'inbound');
            }, 1000);
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // Initial messages
    addMessage('Welcome to AEGIS Messaging!', 'inbound');
    addMessage('Ready to send a message.', 'outbound');