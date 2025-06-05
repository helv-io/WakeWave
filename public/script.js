const wakeWordSpan = document.getElementById('wake-word')
const recordButton = document.getElementById('record-button')
const statusP = document.getElementById('status')

fetch('/api/config')
  .then(res => res.json())
  .then(data => wakeWordSpan.textContent = data.wakeWord)

let recorder
let stream

recordButton.addEventListener('mousedown', startRecording)
recordButton.addEventListener('touchstart', startRecording)
recordButton.addEventListener('mouseup', stopRecording)
recordButton.addEventListener('touchend', stopRecording)

async function startRecording(event) {
  event.preventDefault()
  if (!stream) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      statusP.textContent = 'Microphone permission denied'
      return
    }
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
      console.log(e)
      const blob = e.data
      statusP.textContent = 'Sending...'
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      console.log(formData)
      try {
        const response = await fetch('/upload', { method: 'POST', body: formData })
        const data = await response.json()
        statusP.textContent = data.status === 'success' ? 'Sample collected' : `Error: ${data.message}`
      } catch (err) {
        statusP.textContent = 'Error sending sample'
      }
      recordButton.style.backgroundColor = ''
    }
  }
}