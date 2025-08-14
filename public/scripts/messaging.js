async function fetchCallsignKeys() {

    const callsign = document.getElementById("callsign");

    if(callsign.value.length > 0) {
        try {
            const response = await fetch(`/messaging/callsign?callsign=${encodeURIComponent(callsign.value)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }                
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('Callsign keys:', data);
                document.getElementById("rsa_public_key").value = data.rsa_public_key;
                callsign.style.boxShadow = "0 0 10px var(--glow-color-green)";
            } else {
                console.log('callsign not found:');
                document.getElementById("rsa_public_key").value = null;
                callsign.style.boxShadow = "0 0 10px var(--glow-color-red)"; // Indicate error with red border
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

}

function addMessage(text, type) {

    const chatContainer = document.getElementById('chat-container');
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {

    const messageInput = document.getElementById("message-input");
    const rsaPublicKey = document.getElementById("rsa_public_key");
    const destinationElement = document.getElementById("callsign");
    const sourceElement = document.getElementById("source_id");

    const message = messageInput.value;
    const publicKey = rsaPublicKey.value;
    const sourceId = sourceElement.value;
    const destinationId = destinationElement.value;

    if (message.length > 0) {

        try
        {
            const encryptedMessage = await encryptMessage(publicKey, message);

            const response = await fetch('/messaging/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ source_id: sourceId, destination_id: destinationId, message: encryptedMessage })
            });

            const data = await response.json();

            if (data.success) {
                addMessage(message, 'outbound');

                console.log('Message sent successfully:', data);
                messageInput.value = ''; // Clear input after sending
            } else {
                console.log('Error sending message:', data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
}

async function wireControls() {

    const account_email = document.getElementById("source_id");
    const privateKey = await getPrivateKey(account_email.value);
    document.getElementById("rsa_private_key").value = privateKey;

    const callsign = document.getElementById("callsign");
    callsign.addEventListener("input", fetchCallsignKeys);

    const sendButton = document.getElementById("send-button");
    sendButton.addEventListener("click", sendMessage);

}

async function checkForRecords() {
  try {

    const destinationElement = document.getElementById("callsign");
    const sourceElement = document.getElementById("source_id");
    const privateKey = document.getElementById("rsa_private_key").value;    
    
    const sourceId = sourceElement.value;
    const destinationId = destinationElement.value;

    const response = await fetch(`/messaging/getmessages?source_id=${destinationId}&destination_id=${sourceId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Failed');

    const data = await response.json();

    if (data.success) {
        data.data.forEach(message => {

            decryptMessage(privateKey, message.message).then(decryptedMessage => {
                addMessage(decryptedMessage, 'inbound');
            
            destroyMessage(message.message_id);

            });
        });

        console.log('New record for you at:', data[0].timestamp);
    }
  } catch (error) {
        
    console.error('Error checking for records:', error);
  }
}

async function destroyMessage(messageId) {
    try {
        const response = await fetch(`/messaging/destroy?message_id=${messageId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('Message destroyed successfully');
        } else {
            console.log('Error destroying message:', data);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Poll every 5 seconds
setInterval(checkForRecords, 5000);


wireControls();