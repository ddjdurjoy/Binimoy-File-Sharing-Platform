# Binimoy - P2P File Sharing Web Application

Binimoy is a peer-to-peer file sharing web application that allows users to share files directly between browsers using WebRTC technology. The application provides a simple and intuitive interface for creating rooms, sharing files, and managing transfers.

## Features

- **Room Creation & Management**
  - Create private rooms for file sharing
  - Share room access via QR code or URL
  - Real-time peer connection status
  - Room member count tracking

- **File Sharing**
  - Drag & drop file upload
  - Multiple file selection
  - Progress tracking for file transfers
  - Direct peer-to-peer file transfer using WebRTC
  - Automatic file download option

- **User Interface**
  - Clean and modern design
  - Responsive layout
  - Visual feedback for file transfers
  - Easy-to-use room sharing system

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd binimoy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Usage

1. **Creating a Room**
   - Click the plus (+) icon in the top-right corner
   - Share the generated QR code or URL with others

2. **Joining a Room**
   - Scan the QR code or visit the shared URL
   - Wait for the connection to establish

3. **Sharing Files**
   - Drag and drop files into the upload area
   - Or click the upload area to select files
   - Monitor transfer progress in real-time
   - Download received files by clicking the download button

## Technical Details

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js with Express
- Real-time Communication: Socket.IO
- P2P Connection: WebRTC
- QR Code Generation: qrcode.js

## Security

- All file transfers are peer-to-peer and do not pass through the server
- Room IDs are randomly generated UUIDs
- STUN servers are used for NAT traversal
- No files are stored on the server

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 