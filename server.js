const express = require('express');
const app = express();
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const rooms = new Map();

// Export the app for Vercel
module.exports = app;

// Only create server if we're not in Vercel's serverless environment
if (process.env.NODE_ENV !== 'production') {
    const http = require('http').createServer(app);
    const io = new Server(http, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    setupSocketIO(io);

    const PORT = process.env.PORT || 3000;
    http.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} else {
    // For Vercel serverless environment
    const httpServer = require('http').createServer();
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        path: '/socket.io'
    });

    setupSocketIO(io);
}

function setupSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('create-room', () => {
            const roomId = uuidv4();
            if (!rooms.has(roomId)) {
                rooms.set(roomId, { users: new Set([socket.id]) });
            }
            socket.join(roomId);
            socket.emit('room-created', { roomId });
        });

        socket.on('join-room', (roomId) => {
            const room = rooms.get(roomId);
            if (room) {
                room.users.add(socket.id);
                socket.join(roomId);
                socket.emit('room-joined', { roomId });
                socket.to(roomId).emit('user-joined', { userId: socket.id });
            } else {
                socket.emit('error', { message: 'Room not found' });
            }
        });

        socket.on('signal', ({ userId, signal }) => {
            io.to(userId).emit('signal', { userId: socket.id, signal });
        });

        socket.on('disconnect', () => {
            rooms.forEach((room, roomId) => {
                if (room.users.has(socket.id)) {
                    room.users.delete(socket.id);
                    if (room.users.size === 0) {
                        rooms.delete(roomId);
                    } else {
                        socket.to(roomId).emit('user-left', { userId: socket.id });
                    }
                }
            });
            console.log('A user disconnected');
        });
    });
} 