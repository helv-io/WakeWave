const wakeWordSpan = document.getElementById('wake-word')
const recordButton = document.getElementById('record-button')
const playerContainer = document.getElementById('player-container')
const audioPlayer = document.getElementById('audio-player')
const submitButton = document.getElementById('submit-button')
const logo = document.getElementById('logoObject')
let logoText

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
  logoText = logo.getSVGDocument().getElementById('text')
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (err) {
    console.error('Microphone permission error:', err)
  }
})

recordButton.addEventListener('mousedown', startRecording)
recordButton.addEventListener('touchstart', startRecording)
recordButton.addEventListener('mouseup', stopRecording)
recordButton.addEventListener('touchend', stopRecording)

submitButton.addEventListener('click', async () => {
  if (!currentRecording) {
    return
  }
  logoText.textContent = 'Sending...'
  const formData = new FormData()
  formData.append('audio', currentRecording)
  try {
    const response = await fetch('/upload', { method: 'POST', body: formData })
    const data = await response.json()
    if (data.status === 'success') {
      logoText.textContent = 'Thanks!'
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#4C2F99', '#00D1FF', '#FF2A7D']
      })
    } else {
      logoText.textContent = `Error: ${data.message}`
    }
  } catch (err) {
    logoText.textContent = 'Error sending sample'
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
    logoText.textContent = 'No microphone access. Please allow microphone permission.'
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
  logoText.textContent = 'Recording...'
  recordButton.style.backgroundColor = 'red'
  recordButton.innerText = 'Recording...'
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
      logoText.textContent = 'Preview'
      recordButton.style.backgroundColor = ''
      recordButton.innerText = 'Hold to record'
    }
  }
}