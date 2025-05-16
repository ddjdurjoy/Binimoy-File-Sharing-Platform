class P2PFileSharing {
    constructor() {
        this.socket = io({
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5
        });
        this.peers = new Map();
        this.currentRoom = null;
        this.setupSocketListeners();
        this.setupUIElements();
        this.setupEventListeners();

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.createRoomBtn.disabled = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.createRoomBtn.disabled = true;
        });
    }

    setupUIElements() {
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

        if (this.createRoomBtn) {
            this.createRoomBtn.disabled = true;
        }
    }

    setupEventListeners() {
        if (this.createRoomBtn) {
            this.createRoomBtn.addEventListener('click', this.createRoom.bind(this));
        }
        
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', this.closeModal.bind(this));
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        if (this.copyUrlBtn) {
            this.copyUrlBtn.addEventListener('click', this.copyRoomUrl.bind(this));
        }
        
        if (this.uploadBox) {
            this.uploadBox.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.uploadBox.style.borderColor = '#2ecc71';
            });

            this.uploadBox.addEventListener('dragleave', () => {
                this.uploadBox.style.borderColor = '#3498db';
            });

            this.uploadBox.addEventListener('drop', (e) => {
                e.preventDefault();
                this.uploadBox.style.borderColor = '#3498db';
                const files = e.dataTransfer.files;
                this.handleFiles(files);
            });

            this.uploadBox.addEventListener('click', () => {
                if (this.fileInput) {
                    this.fileInput.click();
                }
            });
        }

        window.addEventListener('load', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const roomId = urlParams.get('room');
            if (roomId) {
                console.log('Joining room:', roomId);
                this.socket.emit('join-room', roomId);
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('room-created', ({ roomId }) => {
            this.currentRoom = roomId;
            this.showRoomInfo(roomId);
        });

        this.socket.on('room-joined', ({ roomId }) => {
            this.currentRoom = roomId;
            this.roomInfo.classList.remove('hidden');
            this.peers.forEach((peer, userId) => {
                if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
                    peer.dataChannel.send(JSON.stringify({ type: 'request_files' }));
                }
            });
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
            if (signal.type === 'offer') {
                peer.connection.setRemoteDescription(new RTCSessionDescription(signal))
                    .then(() => peer.connection.createAnswer())
                    .then(answer => peer.connection.setLocalDescription(answer))
                    .then(() => {
                        this.socket.emit('signal', {
                            userId,
                            signal: peer.connection.localDescription
                        });
                    });
            } else if (signal.type === 'answer') {
                peer.connection.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                peer.connection.addIceCandidate(new RTCIceCandidate(signal));
            }
        });
    }

    createRoom() {
        console.log('Creating room...');
        if (this.socket.connected) {
            this.socket.emit('create-room');
        } else {
            console.error('Socket not connected');
            alert('Unable to create room. Please try again.');
        }
    }

    showRoomInfo(roomId) {
        const roomUrl = `${window.location.origin}?room=${roomId}`;
        this.roomUrl.value = roomUrl;
        this.roomInfo.classList.remove('hidden');
        this.roomModal.classList.remove('hidden');
        
        this.qrCodeElement.innerHTML = '';
        new QRCode(this.qrCodeElement, {
            text: roomUrl,
            width: 200,
            height: 200
        });
    }

    closeModal() {
        this.roomModal.classList.add('hidden');
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

    handleFileSelect(event) {
        const files = event.target.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            this.addFileToList(file.name, 'Sending...', true);
            this.sendFile(file);
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing P2P File Sharing...');
    window.app = new P2PFileSharing();
}); 