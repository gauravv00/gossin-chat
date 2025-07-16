const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { verifyToken } = require('./middleware/authMiddleware');
const Report = require('./models/Report');
const Message = require('./models/Message');
const Comment = require('./models/Comment');
const reportRoutes = require('./routes/reportRoutes');
const authController = require('./controllers/authController');
const User = require('./models/User');
require('dotenv').config();
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount the report routes
app.use('/api/reports', reportRoutes);

// Update Socket.io CORS configuration
const io = new Server(server, {
    cors: {
        origin: 'http://127.0.0.1:5500',  // Your frontend origin
        credentials: true,
        methods: ["GET", "POST"]
    }
});

const JWT_SECRET = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGODB_URI;
const dbName = 'userAuth';

// Update MongoDB connection
mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const db = mongoose.connection;

// Add this to handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists using Mongoose model
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user using Mongoose model
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            { 
                id: user._id,
                username: user.username,
                email: user.email 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/api/auth/login', authController.login);

// Update the verify endpoint
app.get('/api/auth/verify', verifyToken, (req, res) => {
    try {
        // User is already verified by verifyToken middleware
        res.json({ 
            verified: true,
            user: {
                id: req.user.id,
                username: req.user.username
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Comments endpoint
app.post('/api/comments', async (req, res) => {
    try {
        const { messageId, comment, username, room } = req.body;
        
        const newComment = new Comment({
            messageId,
            comment,
            username,
            room,  // Save the room information
            createdAt: new Date()
        });

        const savedComment = await newComment.save();

        // Emit the new comment to specific room only
        io.to(room).emit('newComment', {
            messageId,
            comment,
            username,
            room,
            timestamp: savedComment.createdAt.toLocaleTimeString()
        });

        res.status(201).json({
            id: savedComment._id,
            username: savedComment.username,
            text: savedComment.comment,
            timestamp: savedComment.createdAt
        });
    } catch (error) {
        console.error('Error saving comment:', error);
        res.status(500).json({ error: 'Failed to save comment' });
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', async (room) => {
        console.log(`Client joining room: ${room}`);
        socket.join(room);
        
        try {
            // Load messages with their comments for specific room
            const messages = await Message.find({ room: room })
                .sort({ createdAt: -1 })
                .limit(100)
                .lean();
            
            // Load comments for all messages
            for (let message of messages) {
                const comments = await Comment.find({ messageId: message._id.toString() })
                    .sort({ createdAt: 1 })
                    .lean();
                message.comments = comments;
            }
            
            console.log(`Found ${messages.length} previous messages for room: ${room}`);
            socket.emit('previousMessages', messages.reverse());
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    });

    socket.on('chatMessage', async (data) => {
        console.log('Received message:', data);
        
        try {
            // Save message to database with room information
            const newMessage = new Message({
                username: data.username,
                message: data.text,
                room: data.room,  // Save the room information
                createdAt: new Date()
            });
            
            await newMessage.save();
            console.log('Message saved to database');

            // Broadcast message to all clients in the room
            io.to(data.room).emit('message', {
                username: data.username,
                text: data.text,
                room: data.room,
                timestamp: new Date().toLocaleTimeString(),
                _id: newMessage._id
            });
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Failed to save message' });
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.room).emit('userTyping', {
            username: data.username,
            isTyping: data.isTyping
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Update CORS settings
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Update socket.io CORS
io.engine.on("headers", (headers, req) => {
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5500";
});

// Test route to verify the endpoint is working
app.get('/api/reports/test', (req, res) => {
    res.json({ message: 'Reports endpoint is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ 
        error: 'Server error',
        details: err.message 
    });
});

// Add this before starting the server to debug route registration
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log(r.route.path)
    } else if(r.name === 'router'){
        console.log('Router:', r.regexp);
    }
});

// Your existing server startup code
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('Port is busy, retrying in 3 seconds...');
        setTimeout(() => {
            server.close();
            server.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }, 3000);
    } else {
        console.error('Server error:', err);
    }
});
module.exports = app;

// Enable CORS
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/signup/init', authController.initiateSignup);
app.post('/api/auth/signup/verify', authController.verifyAndSignup);
