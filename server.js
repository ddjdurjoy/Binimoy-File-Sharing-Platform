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

const server = require('http').createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    path: '/socket.io'
});

setupSocketIO(io);

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
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

// Export the server instance for Vercel
module.exports = server; 