const wakeWordSpan = document.getElementById('wake-word')
const recordButton = document.getElementById('record-button')
const statusP = document.getElementById('status')
const playerContainer = document.getElementById('player-container')
const audioPlayer = document.getElementById('audio-player')
const submitButton = document.getElementById('submit-button')

fetch('/api/config')
  .then(res => res.json())
  .then(data => wakeWordSpan.textContent = data.wakeWord)

// Global stream variable
let recorder
let stream
let currentRecording = null
let currentAudioUrl = null

// Request microphone permission on page load
window.addEventListener('load', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    statusP.textContent = 'Microphone permission granted!'
  } catch (err) {
    statusP.textContent = 'Microphone permission denied. Please allow microphone access to record.'
    console.error('Microphone permission error:', err)
  }
})

recordButton.addEventListener('mousedown', startRecording)
recordButton.addEventListener('touchstart', startRecording)
recordButton.addEventListener('mouseup', stopRecording)
recordButton.addEventListener('touchend', stopRecording)

submitButton.addEventListener('click', async () => {
  if (!currentRecording) {
    statusP.textContent = 'No recording to submit.'
    return
  }
  statusP.textContent = 'Sending...'
  const formData = new FormData()
  formData.append('audio', currentRecording, 'recording.webm')
  try {
    const response = await fetch('/upload', { method: 'POST', body: formData })
    const data = await response.json()
    if (data.status === 'success') {
      statusP.textContent = 'Sample collected! Want to do it again?'
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#4C2F99', '#00D1FF', '#FF2A7D']
      })
    } else {
      statusP.textContent = `Error: ${data.message}`
    }
  } catch (err) {
    statusP.textContent = 'Error sending sample'
  } finally {
    audioPlayer.pause()
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl)
      currentAudioUrl = null
    }
    currentRecording = null
    playerContainer.style.display = 'none'
    submitButton.style.display = 'none'
  }
})

async function startRecording(event) {
  event.preventDefault()
  if (!stream) {
    statusP.textContent = 'No microphone access. Please allow microphone permission.'
    return
  }
  audioPlayer.pause()
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl)
    currentAudioUrl = null
  }
  currentRecording = null
  playerContainer.style.display = 'none'
  submitButton.style.display = 'none'
  recorder = new MediaRecorder(stream)
  recorder.start()
  statusP.textContent = 'Recording...'
  recordButton.style.backgroundColor = 'red'
}

function stopRecording(event) {
  event.preventDefault()
  if (recorder && recorder.state === 'recording') {
    recorder.stop()
    recorder.ondataavailable = (e) => {
      currentRecording = e.data
      currentAudioUrl = URL.createObjectURL(currentRecording)
      audioPlayer.src = currentAudioUrl
      playerContainer.style.display = 'block'
      submitButton.style.display = 'block'
      statusP.textContent = 'Recording stopped. Preview and submit.'
      recordButton.style.backgroundColor = ''
    }
  }
}