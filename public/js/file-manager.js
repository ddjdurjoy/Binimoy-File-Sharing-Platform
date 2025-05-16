const FileManager = {
    // Constants
    CHUNK_SIZE: 16384, // 16KB chunks
    activeTransfers: new Map(),

    async sendFile(file, targetPeerId) {
        const transferId = crypto.randomUUID();
        const peer = NetworkManager.peers.get(targetPeerId);
        
        if (!peer || !peer.dataChannel) {
            throw new Error('Peer connection not established');
        }

        // Send file info first
        const fileInfo = {
            type: 'file-info',
            transferId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
        };

        peer.dataChannel.send(JSON.stringify(fileInfo));

        // Wait for acceptance
        const accepted = await this.waitForAcceptance(transferId, targetPeerId);
        if (!accepted) {
            throw new Error('File transfer rejected');
        }

        // Start file transfer
        this.activeTransfers.set(transferId, {
            file,
            targetPeerId,
            progress: 0,
            startTime: Date.now()
        });

        await this.sendFileChunks(file, transferId, targetPeerId);
    },

    async waitForAcceptance(transferId, peerId) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(false), 30000); // 30s timeout
            
            const handler = (event) => {
                const response = JSON.parse(event.data);
                if (response.type === 'file-response' && response.transferId === transferId) {
                    clearTimeout(timeout);
                    resolve(response.accepted);
                }
            };

            const peer = NetworkManager.peers.get(peerId);
            peer.dataChannel.addEventListener('message', handler, { once: true });
        });
    },

    async sendFileChunks(file, transferId, targetPeerId) {
        const peer = NetworkManager.peers.get(targetPeerId);
        const reader = new FileReader();
        let offset = 0;

        while (offset < file.size) {
            const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
            const buffer = await this.readChunkAsArrayBuffer(chunk, reader);

            const message = {
                type: 'file-chunk',
                transferId,
                chunk: buffer,
                offset
            };

            // Wait for the data channel to be ready to send
            await this.waitForDataChannelBufferLow(peer.dataChannel);
            peer.dataChannel.send(JSON.stringify(message));

            offset += chunk.size;
            this.updateProgress(transferId, offset / file.size * 100);
        }

        // Send transfer complete message
        peer.dataChannel.send(JSON.stringify({
            type: 'transfer-complete',
            transferId
        }));

        this.activeTransfers.delete(transferId);
    },

    readChunkAsArrayBuffer(chunk, reader) {
        return new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(chunk);
        });
    },

    waitForDataChannelBufferLow(dataChannel) {
        if (dataChannel.bufferedAmount <= dataChannel.bufferedAmountLowThreshold) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            dataChannel.onbufferedamountlow = () => {
                dataChannel.onbufferedamountlow = null;
                resolve();
            };
        });
    },

    updateProgress(transferId, progress) {
        const transfer = this.activeTransfers.get(transferId);
        if (transfer) {
            transfer.progress = progress;
            UI.updateTransferProgress(transfer.targetPeerId, progress);
        }
    },

    // Receiving files
    async receiveFileChunk(message) {
        const { transferId, chunk, offset } = message;
        let transfer = this.activeTransfers.get(transferId);

        if (!transfer) {
            transfer = {
                chunks: [],
                receivedSize: 0,
                fileSize: message.fileSize,
                fileName: message.fileName,
                progress: 0
            };
            this.activeTransfers.set(transferId, transfer);
        }

        // Store chunk
        transfer.chunks[offset / this.CHUNK_SIZE] = chunk;
        transfer.receivedSize += chunk.byteLength;
        
        // Update progress
        const progress = (transfer.receivedSize / transfer.fileSize) * 100;
        this.updateProgress(transferId, progress);

        // Check if transfer is complete
        if (transfer.receivedSize === transfer.fileSize) {
            await this.completeFileTransfer(transferId);
        }
    },

    async completeFileTransfer(transferId) {
        const transfer = this.activeTransfers.get(transferId);
        if (!transfer) return;

        // Combine chunks
        const blob = new Blob(transfer.chunks, { type: transfer.mimeType });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = transfer.fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);

        this.activeTransfers.delete(transferId);
    },

    acceptFile(senderId) {
        const peer = NetworkManager.peers.get(senderId);
        if (peer && peer.dataChannel) {
            peer.dataChannel.send(JSON.stringify({
                type: 'file-response',
                accepted: true
            }));
        }
    },

    rejectFile(senderId) {
        const peer = NetworkManager.peers.get(senderId);
        if (peer && peer.dataChannel) {
            peer.dataChannel.send(JSON.stringify({
                type: 'file-response',
                accepted: false
            }));
        }
    }
};

// Export for use in other modules
window.FileManager = FileManager; 