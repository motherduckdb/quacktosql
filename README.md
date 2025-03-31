# Quack2SQL

The world's first duck-based SQL query generator! Quack2SQL is a web application that converts duck sounds ("quacks") into powerful SQL queries directly in your browser, with all processing happening locally.

## Features

- Record duck sounds using your microphone with an intuitive interface
- Real-time audio visualization and transcription
- Local processing - no data leaves your device
- Automatic conversion of quack sounds into SQL queries
- Beautiful, modern UI with responsive design
- Progress tracking with the Quackometer to measure your quacking proficiency

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quack2sql.git
   cd quack2sql
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How to Use

1. Open the application in your browser
2. Allow microphone access when prompted
3. Wait for the model to download (approximately 200MB, processed locally)
4. Click the "RECORD" button to start quacking
5. Make your best duck sounds ("quack quack quack")
6. Watch as your quacks are transcribed and converted to SQL in real-time
7. Click "STOP" when finished
8. View your generated SQL query in the SQL Terminal section

## Technologies Used

- Next.js & React
- Tailwind CSS
- Web Audio API
- WebAssembly for local audio processing
- Transformers.js for in-browser ML model execution

## Privacy

All processing happens entirely in your browser. No audio data, transcriptions, or generated SQL queries are sent to any server.

## License

MIT

## Acknowledgments

- The open-source AI community for making local ML execution possible
- Next.js team for the excellent framework
- All the ducks who inspired this project
