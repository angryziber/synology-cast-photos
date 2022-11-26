import config from './config.js'
import {Chromecast} from './chromecast.js'
import {keyboard} from '../receiver/keyboard.js'

export function Sender(chromecast = new Chromecast(config.castAppId)) {
  const self = this
  const path = document.querySelector('[name=path]')
  const suggestions = document.querySelector('datalist#paths')
  const random = document.querySelector('[name=random]')
  const photos = document.getElementById('photos')
  const videos = document.getElementById('videos')
  const mode = document.querySelector('[name=mode]')
  const cover = document.querySelector('[name=cover]')
  const map = document.querySelector('[name=map]')
  const interval = document.querySelector('[name=interval]')
  const status = document.getElementById('status')

  let accessToken = localStorage['accessToken']
  if (!accessToken)
    localStorage['accessToken'] = accessToken = prompt('Access Token for listing of media files (defined in backend config)')

  const year = new Date().getFullYear()
  const years = Array(10).fill(0).map((_, i) => (year - i).toFixed())

  let suggestedValues = []
  suggest(years)

  function suggest(values) {
    suggestedValues = values
    suggestions.innerHTML = values.map(v => `<option value="${v}">`).join('\n')
  }

  let debounce
  path.addEventListener('keydown', e => {
    if (e.code === 'Enter') self.sendPhotoDir()
    else {
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        const plusPos = path.value.lastIndexOf('+') + 1
        const prefix = path.value.substring(0, plusPos)
        const dir = path.value.substring(plusPos)
        if (!dir) {
          if (suggestedValues !== years) suggest(years)
        } else {
          if (suggestedValues.some(v => v.includes(dir))) return
          fetch(`${config.photoDirsSuggestUrl}?accessToken=${accessToken}&dir=${dir}`).then(r => r.text()).then(data => {
            suggest(data.trim().split('\n').sort((a, b) => a.localeCompare(b)).map(s => prefix + s))
          })
        }
      }, 300)
    }
  })

  chromecast.onMessage = function(ns, message) {
    if (message.startsWith('state:')) {
      const state = JSON.parse(message.substring('state:'.length))
      if (state.path) path.value = state.path
      random.checked = state.random
      photos.checked = state.photos
      videos.checked = state.videos
      mode.checked = state.mode == 'video'
      cover.checked = state.style == 'contain'
      map.checked = state.map
      interval.value = state.interval
      return
    }
    const parts = message.split('|')
    if (parts.length == 1) status.textContent = message
    else status.innerHTML = '<a href="' + parts[1] + '">' + parts[0] + '</a>'
  }

  function sendCommand(cmd) {
    chromecast.message(cmd)
    status.textContent = cmd
  }

  self.sendPhotoDir = function() {
    sendCommand((random.checked ? 'rnd:' : 'seq:') + path.value)
  }

  random.addEventListener('change', () => sendCommand(random.checked ? 'rnd' : 'seq'))
  photos.addEventListener('change', e => sendCommand((e.target.checked ? 'show' : 'hide') + ':photos'))
  videos.addEventListener('change', e => sendCommand((e.target.checked ? 'show' : 'hide') + ':videos'))

  mode.addEventListener('change', e => sendCommand((e.target.checked ? 'video' : 'img')))
  cover.addEventListener('click', () => sendCommand(cover.checked ? 'style:cover' : 'style:contain'))
  map.addEventListener('change', e => sendCommand((e.target.checked ? 'show' : 'hide') + ':map'))

  interval.addEventListener('change', () => sendCommand('interval:' + interval.value))
  document.getElementById('prev').addEventListener('click', () => sendCommand('prev'))
  document.getElementById('next').addEventListener('click', () => sendCommand('next'))
  document.getElementById('prev-more').addEventListener('click', () => sendCommand('prev:10'))
  document.getElementById('next-more').addEventListener('click', () => sendCommand('next:10'))
  document.getElementById('pause').addEventListener('click', () => sendCommand('pause'))

  document.body.addEventListener('keydown', e => {
    if (e.target.tagName == 'INPUT') return

    const command = keyboard.toCommand(e.code)
    if (command) {
      e.preventDefault()
      sendCommand(command)
    }
  })
}
