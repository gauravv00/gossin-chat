const Message = require('../models/Message');

module.exports = function(io) {
    const gossipNamespace = io.of('/gossip');

    gossipNamespace.on('connection', async (socket) => {
        console.log('User connected to gossip:', socket.id);

        try {
            // Load last 50 messages when user connects
            const messages = await Message.find()
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            // Send existing messages to newly connected client
            socket.emit('loadMessages', messages.reverse());
        } catch (error) {
            console.error('Error loading messages:', error);
        }

        socket.on('chatMessage', async (messageData) => {
            try {
                // Save message to database
                const newMessage = new Message({
                    username: messageData.username,
                    message: messageData.text,
                    createdAt: new Date()
                });
                await newMessage.save();

                // Broadcast message to all clients
                gossipNamespace.emit('message', {
                    username: messageData.username,
                    text: messageData.text,
                    timestamp: messageData.timestamp,
                    _id: newMessage._id
                });
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from gossip:', socket.id);
        });
    });
};
