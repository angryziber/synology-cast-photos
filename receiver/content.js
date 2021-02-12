import config from './config.js'

export function BaseContent() {
  const self = this
  self.urls = []
  self.index = 0
  self.meta = document.getElementById('meta')
  self.status = document.getElementById('status')
  self.baseUrl = ''
  self.listUrls = [config.listUrl]

  const title = document.getElementById('title')
  if (location.host != 'keks.ee') title.textContent += ': ' + location.host

  self.state = {
    url: location.href,
    path: '',
    random: true
  }

  setTimeout(function checkLanForQuickerDownloads() {
    if (!config.lanBaseUrl) return
    const start = Date.now()
    fetch(config.lanBaseUrl + config.lanCheckUrl).then(res => {
      if (res.ok) {
        self.baseUrl = config.lanBaseUrl
        console.log(config.lanBaseUrl + ' is accessible, took ' + (Date.now() - start) + 'ms')
      }
      else throw res.status
    }).catch(e => console.log(config.lanBaseUrl + ' is not accessible, took ' + (Date.now() - start) + 'ms: ' + e))
  })

  self.loadUrls = async function(path) {
    let urls = []
    for (let url of self.listUrls) {
      const res = await fetch(self.baseUrl + url + encodeURIComponent(path))
      if (!res.ok) {
        self.title('Error: ' + res.status + ' ' + res.statusText)
        return
      }
      urls = urls.concat((await res.text()).trim().split('\n'))
    }
    return urls
  }

  self.loadUrlsAndShow = async function(path, random = true) {
    self.state.path = path
    self.urls = await self.loadUrls(path)
    self.urlsRandom = self.urlsSequential = null
    if (random) self.random(); else self.sequential()
    self.title((random ? 'Random: ' : 'Sequential: ') + path)
    self.index = 1
    self.loadCurrent()
  }

  self.currentUrl = function() {
    return self.urls[self.index - 1]
  }

  self.nextUrl = function() {
    return self.urls[self.index]
  }

  self.random = function() {
    self.state.random = true
    updateIndex(self.currentUrl(), self.urlsRandom || (self.urlsRandom = shuffle(self.urls.slice())))
  }

  self.sequential = function() {
    self.state.random = false
    updateIndex(self.currentUrl(), self.urlsSequential || (self.urlsSequential = self.urls.slice().sort()))
  }

  self.title = function(text) {
    title.textContent = text
  }

  function updateIndex(currentUrl, newUrls) {
    if (currentUrl) self.index = newUrls.indexOf(currentUrl) + 1
    self.urls = newUrls
    if (self.status) self.status.textContent = self.index + '/' + self.urls.length
  }

  let debounce

  self.prev = function(by) {
    self.index -= parseInt(by || 1)
    if (self.index <= 0) self.index = self.urls.length
    clearTimeout(debounce)
    debounce = setTimeout(self.loadCurrent, 100)
  }

  self.next = function(by) {
    self.index += parseInt(by || 1)
    if (self.index > self.urls.length) self.index = 1
    clearTimeout(debounce)
    debounce = setTimeout(self.loadCurrent, 100)
  }
}

function randomInt(max) {
  if (window.crypto) {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  }
  else return Math.floor(Math.random() * max)
}

function shuffle(o) {
  for (let j, x, i = o.length; i; j = randomInt(i), x = o[--i], o[i] = o[j], o[j] = x);
  return o
}
