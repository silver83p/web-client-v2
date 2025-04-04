# Liberdus Secure Texting

A transparent, end-to-end encrypted web-based messaging application that prioritizes user privacy and security.

## Overview

Liberdus is a secure texting web application that implements end-to-end encryption to ensure your conversations remain private. Unlike many messaging platforms, Liberdus is fully transparent - users can inspect the actual code running on their device through our About page.

## Features

- End-to-end encryption for all messages
- Web-based interface accessible from any modern browser
- No frameworks - pure HTML, JavaScript, and CSS for complete transparency
- Self-contained application with viewable source code
- Open-source and community-driven development

## Demo

Try out the application at [liberdus.com/test](https://liberdus.com/test)

## Development Setup

### Prerequisites

- Git
- A local HTTP server (such as Python's `http.server`, Node.js `http-server`, or any other of your choice)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/Liberdus/liberdus
   cd liberdus
   ```

2. Clone the proxy server repository:
   ```
   git clone https://github.com/Liberdus/liberdus-proxy
   ```

3. Start a local HTTP server in the cloned repository folder:
   
   Using Python:
   ```
   python -m http.server
   ```
   
   Or using Node.js http-server:
   ```
   npx http-server
   ```

4. Run the proxy server:
   ```
   cd liberdus-proxy
   # Follow the setup instructions in the proxy server README
   ```

5. Access the application in your browser at `http://localhost:8000` (or whichever port your HTTP server is using)

## Architecture

The application consists of two main components:

1. **Web Client**: Pure HTML, JS, and CSS files that run in the browser and handle the encryption/decryption of messages
2. **Proxy Server**: Manages message routing and delivery without ever having access to the unencrypted content

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/my-new-feature`
7. Submit a pull request

## Security

Security is our top priority. If you discover any security vulnerabilities, please report them responsibly by emailing security@liberdus.com instead of creating a public issue.

## License

[Add your license information here]

## Contact

[Add contact information or community links here]
