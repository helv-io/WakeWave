import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Initialize Express app
const app = express()

// Set up recording directory and wake word directory
const recordingDir = './recordings'
const wakeWord = process.env.WAKE_WORD || 'Lancelot'
const wakeWordDir = path.join(recordingDir, wakeWord)
fs.mkdirSync(wakeWordDir, { recursive: true })

// Configure Multer to save files to wakeWordDir with unique names and original extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, wakeWordDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${uuidv4()}${ext}`
    cb(null, uniqueName)
  }
})
const upload = multer({ storage })

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Endpoint to return configuration data
app.get('/api/config', (req, res) => {
  res.json({ wakeWord: wakeWord })
})

// Endpoint to handle audio file uploads
app.post('/upload', upload.single('audio'), (req, res) => {
  if (!req.file) {
    console.log('No file uploaded')
    return res.json({ status: 'error', message: 'No file uploaded' })
  }
  console.log(`File uploaded: ${req.file.filename}`)
  res.json({ status: 'success' })
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on port ${port}`))