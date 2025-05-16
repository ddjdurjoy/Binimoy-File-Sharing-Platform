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
        origin: ["https://binimoyweb.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
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
        console.log('A user connected:', socket.id);

        // Handle room creation
        socket.on('create-room', () => {
            const roomId = uuidv4();
            console.log('Creating room:', roomId);
            
            if (!rooms.has(roomId)) {
                rooms.set(roomId, { 
                    users: new Set([socket.id]),
                    files: [],
                    createdAt: Date.now()
                });
                socket.join(roomId);
                socket.emit('room-created', { 
                    roomId,
                    userId: socket.id 
                });
                console.log(`Room ${roomId} created by ${socket.id}`);
            }
        });

        // Handle room joining
        socket.on('join-room', (roomId) => {
            console.log(`User ${socket.id} attempting to join room ${roomId}`);
            
            const room = rooms.get(roomId);
            if (room) {
                room.users.add(socket.id);
                socket.join(roomId);
                
                // Send room state to the new user
                socket.emit('room-joined', { 
                    roomId,
                    userId: socket.id,
                    files: room.files,
                    users: Array.from(room.users)
                });

                // Notify other users in the room
                socket.to(roomId).emit('user-joined', { 
                    userId: socket.id,
                    userCount: room.users.size
                });
                
                console.log(`User ${socket.id} joined room ${roomId}`);
            } else {
                console.log(`Room ${roomId} not found`);
                socket.emit('error', { 
                    message: 'Room not found or has expired',
                    code: 'ROOM_NOT_FOUND'
                });
            }
        });

        // Handle file sharing
        socket.on('file-shared', ({ roomId, fileInfo }) => {
            console.log(`File shared in room ${roomId}:`, fileInfo.name);
            
            const room = rooms.get(roomId);
            if (room && room.users.has(socket.id)) {
                const fileData = {
                    ...fileInfo,
                    sharedBy: socket.id,
                    timestamp: Date.now(),
                    id: uuidv4()
                };
                
                room.files.push(fileData);
                
                // Broadcast to all users in the room
                io.to(roomId).emit('new-file', fileData);
            }
        });

        // Handle WebRTC signaling
        socket.on('signal', ({ userId, signal }) => {
            io.to(userId).emit('signal', { 
                userId: socket.id, 
                signal 
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            
            rooms.forEach((room, roomId) => {
                if (room.users.has(socket.id)) {
                    room.users.delete(socket.id);
                    
                    if (room.users.size === 0) {
                        console.log(`Removing empty room ${roomId}`);
                        rooms.delete(roomId);
                    } else {
                        socket.to(roomId).emit('user-left', { 
                            userId: socket.id,
                            userCount: room.users.size
                        });
                    }
                }
            });
        });
    });

    // Clean up old rooms periodically
    setInterval(() => {
        const now = Date.now();
        rooms.forEach((room, roomId) => {
            if (now - room.createdAt > 24 * 60 * 60 * 1000) { // 24 hours
                rooms.delete(roomId);
            }
        });
    }, 60 * 60 * 1000); // Check every hour
}

// Export the server instance for Vercel
module.exports = server; 
module.exports = server; 