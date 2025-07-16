      # Gossin - College Community Chat Platform

## Overview
Gossin is a real-time chat platform designed specifically for college students to share experiences, opinions, and engage in meaningful conversations. The platform features multiple specialized chat rooms, each serving a unique purpose while maintaining user privacy and fostering a safe community environment.

## Features

### 🌟 Specialized Chat Rooms
- **Gossip Room**: Share and discuss campus news and events
- **Confession Room**: Anonymous space for sharing personal thoughts
- **Opinion Room**: Platform for sharing experiences and perspectives

### 💫 Core Functionality
- Real-time messaging with Socket.IO
- Interactive comment system
- User authentication and security
- Typing indicators
- Message history
- Mobile-responsive design

### 🔒 Security Features
- JWT-based authentication
- Secure password handling
- Protected routes
- Cross-Origin Resource Sharing (CORS) protection

## Technical Stack

### Frontend
- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript
- Socket.IO Client
- Font Awesome Icons
- Google Fonts

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
Website/
├── frontend/
│   ├── homepage.htm
│   ├── about.htm
│   ├── login.htm
│   ├── signup.htm
│   ├── Gossip.htm
│   ├── Confession.htm
│   └── Opinion.htm
├── backend/
│   ├── server.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   ├── Comment.js
│   │   └── Report.js
│   ├── controllers/
│   │   └── authController.js
│   └── routes/
│       └── reportRoutes.js
└── README.md
```

## Setup Instructions

1. **Prerequisites**
   - Node.js (v14 or higher)
   - MongoDB (v4.4 or higher)
   - Modern web browser

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]

   # Navigate to backend directory
   cd Website/backend

   # Install dependencies
   npm install

   # Start MongoDB service
   mongod

   # Start the server
   node server.js
   ```

3. **Frontend Setup**
   - Open the frontend files using a live server
   - Default port: 5500

4. **Environment Variables**
   Create a `.env` file in the backend directory with:
   ```
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/userAuth
   JWT_SECRET=your_jwt_secret
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup`: User registration
- `POST /api/auth/login`: User login
- `GET /api/auth/verify`: Token verification

### Messages and Comments
- `POST /api/comments`: Add a comment
- Socket events for real-time messaging

## Socket.IO Events

### Client Events
- `joinRoom`: Join a specific chat room
- `chatMessage`: Send a new message
- `typing`: Indicate user is typing

### Server Events
- `message`: Broadcast new messages
- `previousMessages`: Send chat history
- `userTyping`: Broadcast typing status
- `newComment`: Broadcast new comments

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Socket.IO team for real-time functionality
- MongoDB team for the database system
- The open-source community for various tools and libraries

---
Built with ❤️ for college students

## Comprehensive Documentation

### Project Overview

Gossin is a specialized chat platform designed for college students, featuring themed chat rooms and anonymous posting capabilities.

### Features

- Themed chat rooms for different college topics
- Anonymous posting option
- Real-time messaging using Socket.IO
- User authentication and authorization
- Responsive design for mobile and desktop
- Terms & Conditions and Privacy Policy implementation

### Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Real-time Communication: Socket.IO

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Start the development server:
```bash
npm start
```

### Contributing

Feel free to submit issues and enhancement requests.

### License

[MIT](LICENSE)
