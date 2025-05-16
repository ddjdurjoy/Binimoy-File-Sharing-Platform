const NetworkManager = {
    peers: new Map(),
    localPeerId: null,

    async initialize() {
        this.localPeerId = crypto.randomUUID();
        
        // Setup WebRTC configuration with STUN servers
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        // Setup local network discovery
        await this.setupLocalDiscovery();
    },

    async setupLocalDiscovery() {
        try {
            // Get local IP addresses
            const ips = await this.getLocalIPs();
            
            // Create a room for local network
            socket.emit('create-local-room', {
                ips,
                peerId: this.localPeerId
            });
        } catch (error) {
            console.error('Local discovery setup failed:', error);
        }
    },

    async getLocalIPs() {
        const ips = new Set();
        
        try {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            
            rtc.onicecandidate = (event) => {
                if (event.candidate) {
                    const { address } = event.candidate;
                    if (address && !address.includes(':') && !address.includes('0.0.0.0')) {
                        ips.add(address);
                    }
                }
            };

            await rtc.createOffer();
            await rtc.setLocalDescription();
            
            // Wait for ICE gathering to complete
            await new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
            
            rtc.close();
        } catch (error) {
            console.error('Error getting local IPs:', error);
        }

        return Array.from(ips);
    },

    createPeerConnection(targetPeerId) {
        const peerConnection = new RTCPeerConnection(this.config);
        
        // Setup data channel
        const dataChannel = peerConnection.createDataChannel('fileTransfer');
        this.setupDataChannel(dataChannel);
        
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('relay-ice', {
                    candidate: event.candidate,
                    targetPeerId
                });
            }
        };

        this.peers.set(targetPeerId, {
            connection: peerConnection,
            dataChannel
        });

        return peerConnection;
    },

    setupDataChannel(dataChannel) {
        dataChannel.onopen = () => {
            console.log('Data channel opened');
        };

        dataChannel.onmessage = (event) => {
            this.handleDataChannelMessage(event.data);
        };

        dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };

        dataChannel.onclose = () => {
            console.log('Data channel closed');
        };
    },

    async handleDataChannelMessage(data) {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case 'file-info':
                    UI.showIncomingFileRequest(message);
                    break;
                case 'file-data':
                    await FileManager.receiveFileChunk(message);
                    break;
            }
        } catch (error) {
            console.error('Error handling data channel message:', error);
        }
    },

    disconnectPeer(peerId) {
        const peer = this.peers.get(peerId);
        if (peer) {
            if (peer.connection) peer.connection.close();
            if (peer.dataChannel) peer.dataChannel.close();
            this.peers.delete(peerId);
        }
    },

    // Clean up all connections
    cleanup() {
        for (const peerId of this.peers.keys()) {
            this.disconnectPeer(peerId);
        }
    }
};

// Export for use in other modules
window.NetworkManager = NetworkManager; 