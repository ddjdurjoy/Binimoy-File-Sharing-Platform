class P2PFileSharing {
    constructor() {
        console.log('Initializing P2P File Sharing...');
        
        // Setup UI elements first
        this.setupUIElements();
        
        // Initialize socket with the correct URL
        try {
            console.log('Connecting to server...');
            const isProduction = window.location.hostname !== 'localhost';
            const socketURL = isProduction 
                ? window.location.origin
                : 'http://localhost:3000';
            
            console.log('Socket URL:', socketURL);
            
            // Initialize Socket.IO with proper configuration
            this.socket = io(socketURL, {
                path: '/socket.io/',
                transports: ['polling', 'websocket'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 60000,
                autoConnect: false,
                forceNew: true,
                withCredentials: true,
                upgrade: true,
                rememberUpgrade: true,
                secure: true,
                rejectUnauthorized: false
            });

            // Setup event listeners before connecting
            this.setupSocketListeners();
            this.setupFileHandlers();

            // Now connect with retry logic
            this.connectWithRetry();
            
        } catch (error) {
            console.error('Error initializing socket:', error);
            alert('Failed to initialize connection. Please refresh the page.');
        }

        this.peers = new Map();
        this.currentRoom = null;
        
        // Setup remaining listeners
        this.setupEventListeners();
    }

    setupUIElements() {
        console.log('Setting up UI elements...');
        
        // Get all necessary DOM elements
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.closeModalBtn = document.getElementById('closeModal');
        this.roomModal = document.getElementById('roomModal');
        this.roomInfo = document.getElementById('roomInfo');
        this.peerCount = document.getElementById('peerCount');
        this.fileInput = document.getElementById('fileInput');
        this.filesList = document.getElementById('filesList');
        this.uploadBox = document.querySelector('.upload-box');
        this.roomUrl = document.getElementById('roomUrl');
        this.copyUrlBtn = document.getElementById('copyUrl');
        this.qrCodeElement = document.getElementById('qrCode');
        this.fileUploadArea = document.getElementById('fileUploadArea');

        // Log which elements were found
        const elements = {
            createRoomBtn: !!this.createRoomBtn,
            closeModalBtn: !!this.closeModalBtn,
            roomModal: !!this.roomModal,
            roomInfo: !!this.roomInfo,
            peerCount: !!this.peerCount,
            fileInput: !!this.fileInput,
            filesList: !!this.filesList,
            uploadBox: !!this.uploadBox,
            roomUrl: !!this.roomUrl,
            copyUrlBtn: !!this.copyUrlBtn,
            qrCodeElement: !!this.qrCodeElement,
            fileUploadArea: !!this.fileUploadArea
        };
        console.log('UI Elements found:', elements);

        // Initially disable the create room button
        if (this.createRoomBtn) {
            this.createRoomBtn.disabled = true;
            this.createRoomBtn.style.opacity = '0.5';
        }

        // Setup basic UI event listeners
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.createRoomBtn) {
            this.createRoomBtn.addEventListener('click', () => this.createRoom());
        }

        if (this.copyUrlBtn && this.roomUrl) {
            this.copyUrlBtn.addEventListener('click', () => {
                this.roomUrl.select();
                document.execCommand('copy');
            });
        }

        // Setup modal close on outside click
        if (this.roomModal) {
            this.roomModal.addEventListener('click', (e) => {
                if (e.target === this.roomModal) {
                    this.closeModal();
                }
            });
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Create room button click handler
        if (this.createRoomBtn) {
            this.createRoomBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Create room button clicked');
                this.createRoom();
            };
        }
        
        // Close modal button click handler
        if (this.closeModalBtn) {
            this.closeModalBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Close modal button clicked');
                this.closeModal();
            };
        }

        // Add ESC key handler for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.roomModal && !this.roomModal.classList.contains('hidden')) {
                this.closeModal();
            }
        });

        // Click outside modal to close
        if (this.roomModal) {
            this.roomModal.addEventListener('click', (e) => {
                if (e.target === this.roomModal) {
                    this.closeModal();
                }
            });
        }

        // Rest of your existing event listeners...
    }

    createRoom() {
        console.log('Creating room...');
        if (!this.socket) {
            console.error('Socket not initialized');
            alert('Connection not established. Please refresh the page.');
            return;
        }

        if (!this.socket.connected) {
            console.error('Socket not connected');
            alert('Not connected to server. Please check your internet connection.');
            return;
        }

        this.socket.emit('create-room');
    }

    showRoomInfo(roomId) {
        console.log('Showing room info for:', roomId);
        
        if (!this.roomModal || !this.roomUrl || !this.qrCodeElement) {
            console.error('Required modal elements not found:', {
                modal: !!this.roomModal,
                url: !!this.roomUrl,
                qr: !!this.qrCodeElement
            });
            return;
        }

        const roomUrl = `${window.location.origin}?room=${roomId}`;
        this.roomUrl.value = roomUrl;
        
        if (this.roomInfo) {
            this.roomInfo.classList.remove('hidden');
        }
        
        // Show modal
        this.roomModal.classList.remove('hidden');
        this.roomModal.style.display = 'flex';
        
        // Generate QR code
        try {
            this.qrCodeElement.innerHTML = '';
            new QRCode(this.qrCodeElement, {
                text: roomUrl,
                width: 200,
                height: 200
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    closeModal() {
        console.log('Closing modal');
        if (this.roomModal) {
            this.roomModal.classList.add('hidden');
            setTimeout(() => {
                this.roomModal.style.display = 'none';
            }, 300); // Match the CSS transition duration
        }
    }

    setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Successfully connected to server', {
                id: this.socket.id,
                transport: this.socket.io.engine.transport.name,
                protocol: this.socket.io.engine.protocol
            });
            
            if (this.createRoomBtn) {
                this.createRoomBtn.disabled = false;
                this.createRoomBtn.style.opacity = '1';
            }
            
            // Clear any previous error messages
            const errorElement = document.getElementById('connectionError');
            if (errorElement) {
                errorElement.remove();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error details:', {
                message: error.message,
                type: error.type,
                description: error.description,
                transport: this.socket.io?.engine?.transport?.name,
                protocol: this.socket.io?.engine?.protocol,
                readyState: this.socket.io?.engine?.transport?.ws?.readyState,
                url: this.socket.io?.uri
            });

            if (this.createRoomBtn) {
                this.createRoomBtn.disabled = true;
                this.createRoomBtn.style.opacity = '0.5';
            }

            // Show error message to user
            this.showConnectionError('Connection error. Retrying...');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showConnectionError('An error occurred. Please refresh the page.');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', {
                reason,
                wasConnected: this.socket.connected,
                transport: this.socket.io?.engine?.transport?.name
            });
            
            if (this.createRoomBtn) {
                this.createRoomBtn.disabled = true;
                this.createRoomBtn.style.opacity = '0.5';
            }

            if (reason === 'io server disconnect') {
                // Server initiated disconnect, attempt reconnection
                this.socket.connect();
            }

            this.showConnectionError('Disconnected from server. Attempting to reconnect...');
        });

        // Room events
        this.socket.on('room-created', ({ roomId }) => {
            this.currentRoom = roomId;
            this.showRoomInfo(roomId);
        });

        this.socket.on('room-joined', ({ roomId }) => {
            this.currentRoom = roomId;
            this.roomInfo.classList.remove('hidden');
        });

        this.socket.on('user-joined', ({ userId }) => {
            this.initializePeerConnection(userId);
            this.updatePeerCount();
        });

        this.socket.on('user-left', ({ userId }) => {
            if (this.peers.has(userId)) {
                this.peers.get(userId).connection.close();
                this.peers.delete(userId);
            }
            this.updatePeerCount();
        });

        this.socket.on('signal', ({ userId, signal }) => {
            if (!this.peers.has(userId)) {
                this.initializePeerConnection(userId);
            }
            const peer = this.peers.get(userId);
            this.handleSignal(peer, signal);
        });

        // Add transport error logging
        this.socket.io.engine.on('transport_error', (error) => {
            console.error('Transport error:', {
                type: error.type,
                message: error.message,
                description: error.description,
                transport: this.socket.io.engine.transport.name
            });
        });

        // Log successful transport changes
        this.socket.io.engine.on('upgrade', (transport) => {
            console.log('Transport upgraded:', transport.name);
        });

        this.socket.io.engine.on('downgrade', (transport) => {
            console.log('Transport downgraded:', transport.name);
        });
    }

    copyRoomUrl() {
        this.roomUrl.select();
        document.execCommand('copy');
    }

    updatePeerCount() {
        this.peerCount.textContent = this.peers.size;
    }

    initializePeerConnection(userId) {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ]
        });

        const peer = {
            connection: peerConnection,
            dataChannel: null
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('signal', {
                    userId,
                    signal: event.candidate
                });
            }
        };

        peerConnection.ondatachannel = (event) => {
            peer.dataChannel = event.channel;
            this.setupDataChannel(peer.dataChannel);
        };

        if (!this.peers.has(userId)) {
            peer.dataChannel = peerConnection.createDataChannel('fileTransfer');
            this.setupDataChannel(peer.dataChannel);

            peerConnection.createOffer()
                .then(offer => peerConnection.setLocalDescription(offer))
                .then(() => {
                    this.socket.emit('signal', {
                        userId,
                        signal: peerConnection.localDescription
                    });
                });
        }

        this.peers.set(userId, peer);
    }

    setupDataChannel(dataChannel) {
        let receiveBuffer = [];
        let receivedSize = 0;
        let fileInfo = null;

        dataChannel.onmessage = (event) => {
            const data = event.data;
            if (typeof data === 'string') {
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.type === 'request_files') {
                        const fileItems = document.querySelectorAll('.file-item');
                        fileItems.forEach(item => {
                            const downloadBtn = item.querySelector('.download-btn');
                            if (downloadBtn) {
                                const url = downloadBtn.href;
                                fetch(url)
                                    .then(response => response.blob())
                                    .then(blob => {
                                        const fileName = downloadBtn.download;
                                        const file = new File([blob], fileName);
                                        this.sendFile(file, dataChannel);
                                    });
                            }
                        });
                    } else {
                        fileInfo = parsedData;
                        receiveBuffer = [];
                        receivedSize = 0;
                        this.addFileToList(fileInfo.name, 'Receiving...', true);
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            } else {
                receiveBuffer.push(data);
                receivedSize += data.byteLength;
                
                const progress = (receivedSize / fileInfo.size) * 100;
                this.updateFileProgress(fileInfo.name, progress);

                if (receivedSize === fileInfo.size) {
                    const file = new Blob(receiveBuffer);
                    this.updateFileItem(fileInfo.name, file);
                    receiveBuffer = [];
                    receivedSize = 0;
                    fileInfo = null;
                }
            }
        };
    }

    handleFiles(files) {
        files.forEach(file => {
            console.log('Processing file:', file.name);
            this.addFileToList(file.name, 'Preparing...');
            
            if (this.currentRoom) {
                this.sendFile(file);
            } else {
                console.log('No active room to send files');
                this.updateFileStatus(file.name, 'No active room');
            }
        });
    }

    async sendFile(file, specificChannel = null) {
        const fileInfo = {
            name: file.name,
            type: file.type,
            size: file.size
        };

        const sendToChannel = (channel) => {
            if (channel && channel.readyState === 'open') {
                channel.send(JSON.stringify(fileInfo));
            }
        };

        if (specificChannel) {
            sendToChannel(specificChannel);
        } else {
            this.peers.forEach(peer => {
                sendToChannel(peer.dataChannel);
            });
        }

        const chunkSize = 16384;
        const fileReader = new FileReader();
        let offset = 0;

        fileReader.onload = (e) => {
            const sendData = (channel) => {
                if (channel && channel.readyState === 'open') {
                    channel.send(e.target.result);
                }
            };

            if (specificChannel) {
                sendData(specificChannel);
            } else {
                this.peers.forEach(peer => {
                    sendData(peer.dataChannel);
                });
            }

            offset += e.target.result.byteLength;
            const progress = (offset / file.size) * 100;
            this.updateFileProgress(file.name, progress);

            if (offset < file.size) {
                readSlice(offset);
            } else {
                this.updateFileItem(file.name, file);
            }
        };

        const readSlice = (o) => {
            const slice = file.slice(o, o + chunkSize);
            fileReader.readAsArrayBuffer(slice);
        };

        readSlice(0);
    }

    addFileToList(name, status, showProgress = false) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.id = `file-${name}`;
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = name;
        
        const fileStatus = document.createElement('span');
        fileStatus.className = 'file-status';
        fileStatus.textContent = status;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '❌';
        deleteBtn.onclick = () => this.deleteFile(name);
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileStatus);
        fileItem.appendChild(fileInfo);
        
        if (showProgress) {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            fileItem.appendChild(progressBar);
        }
        
        fileItem.appendChild(deleteBtn);
        this.filesList.appendChild(fileItem);
    }

    updateFileProgress(fileName, progress) {
        const fileItem = document.getElementById(`file-${fileName}`);
        if (fileItem) {
            const progressBar = fileItem.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
    }

    updateFileItem(fileName, file) {
        const fileItem = document.getElementById(`file-${fileName}`);
        if (fileItem) {
            const downloadUrl = URL.createObjectURL(file);
            const fileInfo = fileItem.querySelector('.file-info');
            if (fileInfo) {
                fileInfo.innerHTML = `
                    <div class="file-name">${fileName}</div>
                    <a href="${downloadUrl}" download="${fileName}" class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </a>
                `;
            }
        }
    }

    deleteFile(fileName) {
        const fileItem = document.getElementById(`file-${fileName}`);
        if (fileItem) {
            fileItem.remove();
        }
    }

    async handleSignal(peer, signal) {
        try {
            if (signal.type === 'offer') {
                await peer.connection.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peer.connection.createAnswer();
                await peer.connection.setLocalDescription(answer);
                this.socket.emit('signal', {
                    userId: peer.id,
                    signal: peer.connection.localDescription
                });
            } else if (signal.type === 'answer') {
                await peer.connection.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                await peer.connection.addIceCandidate(new RTCIceCandidate(signal));
            }
        } catch (error) {
            console.error('Error handling signal:', error);
        }
    }

    setupFileHandlers() {
        if (!this.fileInput || !this.uploadBox || !this.fileUploadArea) {
            console.error('File handling elements not found');
            return;
        }

        // File input change handler
        this.fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                this.handleFiles(Array.from(files));
            }
        });

        // Drag and drop handlers
        this.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadBox.style.borderColor = '#3498db';
            this.uploadBox.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        });

        this.fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadBox.style.borderColor = '#3498db';
            this.uploadBox.style.backgroundColor = 'transparent';
        });

        this.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.uploadBox.style.borderColor = '#3498db';
            this.uploadBox.style.backgroundColor = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                this.handleFiles(Array.from(files));
            }
        });

        // Click to upload
        this.uploadBox.addEventListener('click', () => {
            this.fileInput.click();
        });
    }

    updateFileStatus(fileName, status) {
        const fileItem = document.getElementById(`file-${fileName}`);
        if (fileItem) {
            const fileInfo = fileItem.querySelector('.file-info');
            if (fileInfo) {
                fileInfo.textContent = status;
            }
        }
    }

    connectWithRetry() {
        let retryCount = 0;
        const maxRetries = 5;
        
        const tryConnect = () => {
            console.log(`Attempting to connect (attempt ${retryCount + 1}/${maxRetries})...`);
            
            this.socket.connect();
            
            this.socket.once('connect_error', (error) => {
                console.error('Connection error:', {
                    message: error.message,
                    type: error.type,
                    description: error.description
                });
                
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log(`Retrying in ${2000 * retryCount}ms...`);
                    setTimeout(tryConnect, 2000 * retryCount);
                } else {
                    console.error('Max retries reached. Please refresh the page.');
                    alert('Failed to connect to server. Please check your internet connection and try refreshing the page.');
                }
            });
        };
        
        tryConnect();
    }

    showConnectionError(message) {
        let errorElement = document.getElementById('connectionError');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'connectionError';
            errorElement.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #ff4444;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 1000;
                text-align: center;
                font-size: 14px;
            `;
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    try {
        window.app = new P2PFileSharing();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}); 