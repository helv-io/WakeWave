# WakeWave

**WakeWave** is a web application designed to collect audio samples for training wake word detection models. It provides a simple, mobile-friendly interface for users to record their voice saying a specified wake word (e.g., "Lancelot"). The recorded audio is automatically processed and saved in a standardized WAV format (mono, 16kHz, 16-bit PCM) for use in model training.

## Features
- **Mobile-friendly interface**: Optimized for use on smartphones and tablets.
- **Web app installation**: Can be installed on iOS and Android home screens for quick access.
- **Simple recording**: Single-button interface with tap or hold functionality to record audio.
- **Server-side audio processing**: Converts recordings to a standardized WAV format with peak amplitude normalization.
- **Docker support**: Easily deployable in a Docker container for consistent environments.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js, TypeScript
- **Audio Processing**: FFmpeg
- **File Uploads**: Multer
- **Containerization**: Docker (Alpine Linux)

## Installation and Setup

### Prerequisites
- **Node.js and npm** installed on your machine.
- **Docker** installed (optional, for containerized deployment).

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wakewave.git
   ```
2. Navigate to the project directory:
   ```bash
   cd wakewave
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the TypeScript code:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. Open your browser and navigate to `http://localhost:3000`.

### Running in Docker
1. Build the Docker image:
   ```bash
   docker build -t wakewave .
   ```
2. Run the container, mounting a host directory for data persistence:
   ```bash
   docker run -p 3000:3000 -v /path/to/host/data:/app/data wakewave
   ```
3. Access the app at `http://localhost:3000`.

## Usage
1. Open the web app in your browser.
2. The current wake word will be displayed (default is "Lancelot").
3. To record:
   - **Tap**: Tap the record button to start recording, say the wake word, then tap again to stop.
   - **Hold**: Hold the record button while saying the wake word, release to stop recording.
4. The recorded audio will be automatically submitted to the server.
5. The server processes the audio and saves it as a WAV file in the specified data directory.

To configure the wake word, set the `WAKE_WORD` environment variable when running the server:
```bash
WAKE_WORD="YourWakeWord" npm start
```

## Contributing
Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.