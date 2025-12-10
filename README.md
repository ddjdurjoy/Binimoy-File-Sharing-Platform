<<<<<<< HEAD
# Binimoy - P2P File Sharing Web Application

Binimoy is a peer-to-peer file sharing web application that allows users to share files directly between browsers using WebRTC technology. The application provides a simple and intuitive interface for creating rooms, sharing files, and managing transfers.

🌐 **Live Demo**: [https://binimoyweb.vercel.app](https://binimoyweb.vercel.app)

## Features

- **Room Creation & Management**
  - Create private rooms for file sharing
  - Share room access via QR code or URL
  - Real-time peer connection status
  - Room member count tracking
  - Automatic room cleanup after 24 hours

- **File Sharing**
  - Drag & drop file upload
  - Multiple file selection
  - Progress tracking for file transfers
  - Direct peer-to-peer file transfer using WebRTC
  - Support for large files (up to 100MB)
  - Real-time transfer status updates

- **User Interface**
  - Clean and modern design
  - Responsive layout for mobile and desktop
  - Visual feedback for connection status
  - Easy-to-use room sharing system
  - Error notifications and status messages

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ddjdurjoy/Binimoy-File-Sharing-Platform.git
   cd Binimoy-File-Sharing-Platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Fork the repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Configure the following settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `public`
   - Install Command: `npm install`

## Usage

1. **Creating a Room**
   - Visit the application URL
   - Click the plus (+) icon in the top-right corner
   - Share the generated QR code or URL with others

2. **Joining a Room**
   - Scan the QR code or visit the shared URL
   - Wait for the connection to establish
   - You'll see the number of connected peers update

3. **Sharing Files**
   - Drag and drop files into the upload area
   - Or click the upload area to select files
   - Monitor transfer progress in real-time
   - Download received files by clicking the download button

## Technical Stack

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - Socket.IO Client
  - WebRTC for P2P connections
  - QR Code generation using qrcode.js

- **Backend**:
  - Node.js with Express
  - Socket.IO for signaling
  - UUID for room management
  - CORS for cross-origin support

- **Deployment**:
  - Vercel for hosting
  - Vercel Serverless Functions
  - Vercel Edge Network

## Troubleshooting

If you encounter connection issues:

1. **Browser Support**
   - Ensure you're using a modern browser (Chrome, Firefox, Edge)
   - Enable WebRTC in your browser settings
   - Allow necessary permissions when prompted

2. **Connection Issues**
   - Check your internet connection
   - Try refreshing the page
   - Clear browser cache if needed
   - Ensure no firewall is blocking WebSocket connections

3. **File Transfer Problems**
   - Maximum file size is 100MB
   - Keep the browser tab active during transfer
   - Both peers must remain connected until transfer completes

## Security Features

- All file transfers are peer-to-peer (P2P)
- No files are stored on the server
- Room IDs are randomly generated UUIDs
- Rooms expire after 24 hours
- STUN/TURN servers for NAT traversal
- Secure WebSocket connections

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/ddjdurjoy/Binimoy-File-Sharing-Platform/issues) section
2. Create a new issue with detailed information
3. Include browser console logs for technical problems 
=======
# LocalSend Web App

A web app integrating WebRTC and WebSockets to share files with other LocalSend peers (browsers, or native versions).

Live: https://web.localsend.org

## Setup

Make sure to install [pnpm](https://pnpm.io).

```bash
npm install -g pnpm
```

Get dependencies

```bash
pnpm install
```

Start the development server

```bash
pnpm run dev
```

## Deployment

Generates the static website in the `dist` directory.

```bash
pnpm run generate
```

### Self-hosting

1. Clone this repo
2. Build: `docker build --tag localsend-web --file Containerfile`
3. Run: `docker run --rm --publish 8080:443 --volume caddy-data:/data localsend-web`

## Contributing

### Adding a new language

1. Add new JSON file in `i18n/locales/` directory.
2. Add the new language in `nuxt.config.ts`.
>>>>>>> 24c69991613fb0210156398f434675629999e73a
