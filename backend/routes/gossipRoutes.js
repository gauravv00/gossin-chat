const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Assuming you have a Mongoose model for messages

// Route to fetch all gossip messages
router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 }); // Sorted by creation time
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Route to save a new gossip message
router.post('/messages', async (req, res) => {
    const { username, message } = req.body;

    if (!username || !message) {
        return res.status(400).json({ error: 'Username and message are required' });
    }

    try {
        const newMessage = new Message({ username, message });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

module.exports = router;
