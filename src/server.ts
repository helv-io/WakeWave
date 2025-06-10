import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'
import { Readable } from 'stream'

// Initialize Express app
const app = express()

// Set up recording directory and wake word directory
const recordingDir = './recordings'
const wakeWord = process.env.WAKE_WORD || 'Lancelot'
const wakeWordDir = path.join(recordingDir, wakeWord)
fs.mkdirSync(wakeWordDir, { recursive: true })

// Configure Multer to use memory storage
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Function to convert audio buffer to WAV with specific settings
const convertToWav = (inputBuffer: Buffer, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create a readable stream from the buffer
    const inputStream = new Readable()
    inputStream.push(inputBuffer)
    inputStream.push(null) // End of stream

    ffmpeg(inputStream)
      .audioCodec('pcm_s16le') // 16-bit PCM little-endian
      .audioChannels(1)        // Mono
      .audioFrequency(16000)   // 16 kHz sample rate
      .format('wav')           // WAV format (16 bits per sample by default with pcm_s16le)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath)
  })
}

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Endpoint to return configuration data
app.get('/api/config', (req, res) => {
  res.json({ wakeWord: wakeWord })
})

// Endpoint to handle audio file uploads and convert to WAV
app.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    console.log('No file uploaded')
    return res.json({ status: 'error', message: 'No file uploaded' })
  }

  const inputBuffer = req.file.buffer
  const outputFilename = `${uuidv4()}.wav`
  const outputPath = path.join(wakeWordDir, outputFilename)

  try {
    await convertToWav(inputBuffer, outputPath)
    console.log(`File converted and saved: ${outputFilename}`)
    res.json({ status: 'success' })
  } catch (err) {
    console.error('Error converting file:', err)
    res.json({ status: 'error', message: 'Error converting file' })
  }
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`))