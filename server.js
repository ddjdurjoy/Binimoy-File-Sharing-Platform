const express = require('express');
const app = express();
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// Enable CORS with specific configuration
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

// Add specific CORS headers for Socket.IO
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.static('public'));

// Debug endpoint to check server status
app.get('/debug', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        socketIOPath: '/socket.io/',
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'OPTIONS'],
            credentials: true
        },
        vercel: {
            region: process.env.VERCEL_REGION || 'unknown',
            env: process.env.VERCEL_ENV || 'unknown'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const rooms = new Map();

const server = require('http').createServer(app);

// Configure Socket.IO
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 10000
});

// Store connected peers
const peers = new Map();
const localNetworks = new Map(); // Map to store peers by local network

function setupSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('Peer connected:', socket.id);

        // Handle peer registration with local IP
        socket.on('register-peer', ({ localIPs, publicIP }) => {
            const peerId = socket.id;
            peers.set(peerId, {
                socket,
                localIPs,
                publicIP,
                connectedTo: new Set()
            });

            // Group peers by public IP (same local network)
            if (publicIP) {
                if (!localNetworks.has(publicIP)) {
                    localNetworks.set(publicIP, new Set());
                }
                localNetworks.get(publicIP).add(peerId);

                // Notify existing peers in the same network
                const networkPeers = Array.from(localNetworks.get(publicIP));
                networkPeers.forEach(existingPeerId => {
                    if (existingPeerId !== peerId) {
                        // Notify both peers about each other
                        io.to(existingPeerId).emit('peer-discovered', {
                            peerId,
                            isLocal: true
                        });
                        socket.emit('peer-discovered', {
                            peerId: existingPeerId,
                            isLocal: true
                        });
                    }
                });
            }
        });

        // Handle WebRTC signaling
        socket.on('signal', ({ targetId, signal }) => {
            const peer = peers.get(socket.id);
            const targetPeer = peers.get(targetId);

            if (peer && targetPeer) {
                io.to(targetId).emit('signal', {
                    peerId: socket.id,
                    signal,
                    isLocal: areInSameNetwork(peer, targetPeer)
                });
            }
        });

        // Handle connection established
        socket.on('connection-established', ({ targetId }) => {
            const peer = peers.get(socket.id);
            const targetPeer = peers.get(targetId);

            if (peer && targetPeer) {
                peer.connectedTo.add(targetId);
                targetPeer.connectedTo.add(socket.id);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            const peer = peers.get(socket.id);
            if (peer) {
                // Remove from local network group
                if (peer.publicIP && localNetworks.has(peer.publicIP)) {
                    localNetworks.get(peer.publicIP).delete(socket.id);
                    if (localNetworks.get(peer.publicIP).size === 0) {
                        localNetworks.delete(peer.publicIP);
                    }
                }

                // Notify connected peers
                peer.connectedTo.forEach(targetId => {
                    const targetPeer = peers.get(targetId);
                    if (targetPeer) {
                        targetPeer.connectedTo.delete(socket.id);
                        io.to(targetId).emit('peer-disconnected', { peerId: socket.id });
                    }
                });

                peers.delete(socket.id);
            }
        });

        // Handle external network peer discovery
        socket.on('discover-external', () => {
            const peer = peers.get(socket.id);
            if (peer) {
                // Generate a unique room for external discovery
                const roomId = uuidv4();
                socket.join(roomId);
                socket.emit('external-room-created', { roomId });
            }
        });

        // Handle joining external room
        socket.on('join-external-room', ({ roomId }) => {
            const peer = peers.get(socket.id);
            if (peer) {
                const room = io.sockets.adapter.rooms.get(roomId);
                if (room) {
                    socket.join(roomId);
                    // Notify all peers in the room
                    socket.to(roomId).emit('peer-discovered', {
                        peerId: socket.id,
                        isLocal: false
                    });
                    
                    // Send existing peers to the new peer
                    room.forEach(existingPeerId => {
                        if (existingPeerId !== socket.id) {
                            socket.emit('peer-discovered', {
                                peerId: existingPeerId,
                                isLocal: false
                            });
                        }
                    });
                } else {
                    socket.emit('error', { message: 'Room not found' });
                }
            }
        });
    });
}

// Helper function to check if two peers are in the same network
function areInSameNetwork(peer1, peer2) {
    return peer1.publicIP && peer1.publicIP === peer2.publicIP;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

setupSocketIO(io);

// Export for Vercel serverless function
module.exports = server; 