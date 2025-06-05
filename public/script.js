const wakeWordSpan = document.getElementById('wake-word')
const recordButton = document.getElementById('record-button')
const statusP = document.getElementById('status')

fetch('/api/config')
  .then(res => res.json())
  .then(data => wakeWordSpan.textContent = data.wakeWord)

// Global stream variable
let recorder
let stream

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

async function startRecording(event) {
  event.preventDefault()
  if (!stream) {
    statusP.textContent = 'No microphone access. Please allow microphone permission.'
    return
  }
  recorder = new MediaRecorder(stream)
  recorder.start()
  statusP.textContent = 'Recording...'
  recordButton.style.backgroundColor = 'red'
}

function stopRecording(event) {
  event.preventDefault()
  if (recorder && recorder.state === 'recording') {
    recorder.stop()
    recorder.ondataavailable = async (e) => {
      const blob = e.data
      statusP.textContent = 'Sending...'
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      try {
        const response = await fetch('/upload', { method: 'POST', body: formData })
        const data = await response.json()
        if (data.status === 'success') {
          statusP.textContent = 'Sample collected! Want to do it again?'
          // Trigger confetti effect
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
      }
      recordButton.style.backgroundColor = ''
    }
  }
}