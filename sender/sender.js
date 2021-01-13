function Sender(config, chromecast) {
  const self = this
  const input = document.querySelector('[name=prefix]')
  const suggestions = document.querySelector('datalist#paths')
  const random = document.querySelector('[name=random]')
  const cover = document.querySelector('[name=cover]')
  const interval = document.querySelector('[name=interval]')
  const status = document.getElementById('status')

  let accessToken = self.accessToken || localStorage['accessToken']
  if (!accessToken) {
    accessToken = prompt('Access Token (defined in backend config)')
    if (accessToken) localStorage['accessToken'] = accessToken
  }

  const year = new Date().getFullYear()
  const years = Array(10).fill(0).map((_, i) => year - i)

  let suggestedValues = []
  suggest(years)

  function suggest(values) {
    suggestedValues = values
    suggestions.innerHTML = values.map(v => `<option value="${v}">`).join('\n')
  }

  let debounce
  input.addEventListener('keydown', e => {
    if (e.code === 'Enter') self.sendPhotoDir()
    else {
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        if (!input.value) {
          if (suggestedValues !== years) suggest(years)
        } else {
          if (suggestedValues.includes(input.value)) return
          fetch(`${config.photoDirsSuggestUrl}?accessToken=${accessToken}&dir=${input.value}`).then(r => r.text()).then(data => {
            suggest(data.trim().split('\n'))
          })
        }
      }, 300)
    }
  })

  chromecast.onMessage = function(ns, text) {
    const parts = text.split('|')
    if (parts.length == 1) status.textContent = text
    else status.innerHTML = '<a href="' + parts[1] + '">' + parts[0] + '</a>'
  }

  function sendCommand(cmd) {
    chromecast.message(cmd)
    status.textContent = cmd
  }

  self.sendPhotoDir = function() {
    sendCommand((random.checked ? 'rnd:' : 'seq:') + input.value)
  }

  random.addEventListener('click', () => {
    sendCommand(random.checked ? 'rnd' : 'seq')
  })

  cover.addEventListener('click', () => {
    sendCommand(cover.checked ? 'style:cover' : 'style:contain')
  })

  interval.addEventListener('change', () => sendCommand('interval:' + interval.value))

  document.getElementById('prev').addEventListener('click', () => sendCommand('prev'))

  document.getElementById('next').addEventListener('click', () => sendCommand('next'))

  document.getElementById('prev-more').addEventListener('click', () => sendCommand('prev:10'))

  document.getElementById('next-more').addEventListener('click', () => sendCommand('next:10'))

  document.getElementById('pause').addEventListener('click', () => sendCommand('pause'))

  document.getElementById('photos').addEventListener('click', () => {
    sendCommand('photos:' + input.value)
    return false
  })

  document.getElementById('videos').addEventListener('click', () => {
    sendCommand('videos:' + input.value)
    return false
  })

  document.body.addEventListener('keydown', e => {
    if (e.target.tagName == 'INPUT') return

    const command = keyboard.toCommand(e.which)
    if (command) {
      e.preventDefault()
      sendCommand(command)
    }
  })
}
