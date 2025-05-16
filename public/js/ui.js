const UI = {
    peers: new Map(),
    
    initialize() {
        this.container = document.getElementById('peers-container');
        this.setupDropZone();
        this.setupLocalAvatar();
    },

    setupLocalAvatar() {
        const localAvatar = this.createPeerAvatar({
            id: NetworkManager.localPeerId,
            isLocal: true
        });
        this.container.appendChild(localAvatar);
    },

    createPeerAvatar({ id, isLocal = false }) {
        const avatar = document.createElement('div');
        avatar.className = `peer-avatar ${isLocal ? 'local' : ''}`;
        avatar.id = `peer-${id}`;

        // Create avatar image using first letter of peer ID
        const image = document.createElement('div');
        image.className = 'avatar-image';
        image.textContent = id.slice(0, 1).toUpperCase();
        avatar.appendChild(image);

        // Add status indicator
        const status = document.createElement('div');
        status.className = 'status-indicator online';
        avatar.appendChild(status);

        if (!isLocal) {
            // Setup drop zone for file sharing
            this.setupPeerDropZone(avatar, id);
            
            // Add click handler for file selection
            avatar.addEventListener('click', () => {
                this.handlePeerClick(id);
            });
        }

        this.peers.set(id, avatar);
        return avatar;
    },

    setupDropZone() {
        const dropZone = document.body;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.body.classList.add('dragging');
        });

        dropZone.addEventListener('dragleave', () => {
            document.body.classList.remove('dragging');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.body.classList.remove('dragging');
        });
    },

    setupPeerDropZone(avatar, peerId) {
        avatar.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatar.classList.add('drop-target');
        });

        avatar.addEventListener('dragleave', () => {
            avatar.classList.remove('drop-target');
        });

        avatar.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatar.classList.remove('drop-target');

            const files = Array.from(e.dataTransfer.files);
            await this.handleFileShare(files, peerId);
        });
    },

    async handleFileShare(files, targetPeerId) {
        for (const file of files) {
            try {
                await FileManager.sendFile(file, targetPeerId);
                this.showNotification('File sent successfully', 'success');
            } catch (error) {
                console.error('Error sending file:', error);
                this.showNotification('Failed to send file', 'error');
            }
        }
    },

    handlePeerClick(peerId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            await this.handleFileShare(files, peerId);
        };
        
        input.click();
    },

    addPeer(peerId) {
        if (!this.peers.has(peerId)) {
            const avatar = this.createPeerAvatar({ id: peerId });
            this.container.appendChild(avatar);
            this.showNotification('New peer joined', 'info');
        }
    },

    removePeer(peerId) {
        const avatar = this.peers.get(peerId);
        if (avatar) {
            avatar.remove();
            this.peers.delete(peerId);
            this.showNotification('Peer disconnected', 'info');
        }
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    showIncomingFileRequest({ fileName, fileSize, senderId }) {
        const notification = document.createElement('div');
        notification.className = 'file-request';
        
        notification.innerHTML = `
            <div class="file-info">
                <span>${fileName}</span>
                <span>${this.formatFileSize(fileSize)}</span>
            </div>
            <div class="actions">
                <button class="accept">Accept</button>
                <button class="reject">Reject</button>
            </div>
        `;

        const accept = notification.querySelector('.accept');
        const reject = notification.querySelector('.reject');

        accept.onclick = () => {
            FileManager.acceptFile(senderId);
            notification.remove();
        };

        reject.onclick = () => {
            FileManager.rejectFile(senderId);
            notification.remove();
        };

        document.body.appendChild(notification);
    },

    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    },

    updateTransferProgress(peerId, progress) {
        const avatar = this.peers.get(peerId);
        if (avatar) {
            const progressBar = avatar.querySelector('.progress-bar') || 
                this.createProgressBar(avatar);
            
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                setTimeout(() => progressBar.remove(), 1000);
            }
        }
    },

    createProgressBar(avatar) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        avatar.appendChild(progressBar);
        return progressBar;
    }
};

// Export for use in other modules
window.UI = UI; 