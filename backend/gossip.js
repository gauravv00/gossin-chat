const socket = io('/gossip');

// Receive and display initial messages
socket.on('initMessages', (messages) => {
    messages.forEach((msg) => displayMessage(msg));
});

// Listen for new messages
socket.on('newMessage', (msg) => {
    displayMessage(msg);
});

// Send a new message
const sendButton = document.getElementById('send-button');
const chatInput = document.getElementById('chat-input');

sendButton.addEventListener('click', () => {
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    const messageData = {
        username: '@dynamicUser', // Replace with dynamic username logic
        message: messageText,
    };

    socket.emit('sendMessage', messageData); // Send to server
    chatInput.value = ''; // Clear the input
});

// Helper function to display messages
function displayMessage({ username, message, timestamp }) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user');

    const formattedTime = new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    messageElement.innerHTML = `
        <div class="message-content">
            <span class="username">${username}</span>
            <p class="text">${message}</p>
            <span class="timestamp">${formattedTime}</span>
        </div>
    `;
    chatContainer.appendChild(messageElement);

    // Scroll to the bottom of the chat
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
