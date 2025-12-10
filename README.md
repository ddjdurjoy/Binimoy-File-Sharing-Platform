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

- Node.js (v16.0.0 or higher) or pnpm
- pnpm (recommended) or npm

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ddjdurjoy/Binimoy-File-Sharing-Platform.git
   cd Binimoy-File-Sharing-Platform
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Deployment

The application is deployed on Vercel as a static site. To deploy your own instance:

1. Fork the repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Vercel will automatically detect Nuxt and configure the build settings
5. The site will be built and deployed automatically

### Self-hosting with Docker

1. Clone this repo
2. Build: `docker build --tag binimoy-web --file Containerfile`
3. Run: `docker run --rm --publish 8080:443 --volume caddy-data:/data binimoy-web`

## Usage

1. **Creating a Room**
   - Visit the application URL
   - Your unique identifier (alias) is displayed at the top
   - Share the URL or QR code with others to connect

2. **Joining a Room**
   - Visit the shared URL
   - Wait for the connection to establish
   - You'll see connected peers displayed

3. **Sharing Files**
   - Click on a peer to select them
   - Select files from your device
   - Monitor transfer progress in real-time
   - Files are received directly in your browser

## Technical Stack

- **Frontend**:
  - Vue 3 with TypeScript
  - Nuxt 3 Framework
  - Tailwind CSS for styling
  - WebRTC for P2P connections
  - WebSocket for signaling
  - pako for compression

- **Deployment**:
  - Vercel for static hosting
  - Vercel Edge Network for CDN
  - Docker support for self-hosting

## Troubleshooting

If you encounter connection issues:

1. **Browser Support**
   - Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari)
   - Enable WebRTC in your browser settings
   - Allow necessary permissions when prompted

2. **Connection Issues**
   - Check your internet connection
   - Try refreshing the page
   - Clear browser cache if needed
   - Ensure no firewall is blocking WebRTC connections

3. **File Transfer Problems**
   - Keep the browser tab active during transfer
   - Both peers must remain connected until transfer completes
   - Check browser console for error messages

## Security Features

- All file transfers are peer-to-peer (P2P)
- No files are stored on the server
- Cryptographic signing for peer authentication
- PIN protection for enhanced security
- Direct encryption of file transfers
- STUN servers for NAT traversal

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## License

Apache License 2.0 - See LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/ddjdurjoy/Binimoy-File-Sharing-Platform/issues) section
2. Create a new issue with detailed information
3. Include browser console logs for technical problems
