function BaseContent(config) {
  const self = this
  self.urls = []
  self.index = 0
  self.meta = document.getElementById('meta')
  self.status = document.getElementById('status')
  self.supports4k = undefined
  self.baseUrl = ''
  var title = document.getElementById('title')

  setTimeout(function checkLanForQuickerDownloads() {
    var start = Date.now()
    fetch(config.lanBaseUrl + config.lanCheckUrl).then(res => {
      if (res.ok) {
        self.baseUrl = config.lanBaseUrl
        console.log(config.lanBaseUrl + ' is accessible, took ' + (Date.now() - start) + 'ms')
      }
      else throw res.status
    }, e => {
      console.log(config.lanBaseUrl + ' is not accessible, took ' + (Date.now() - start) + 'ms: ' + e)
    })
  }, 0)

  self.loadUrls = function(dir, random) {
    function onUrlsLoaded(result) {
      self.urls = result.trim().split('\n')
      self.urlsRandom = self.urlsSequential = null
      if (random) self.random(); else self.sequential()
      self.title((random ? 'Random: ' : 'Sequential: ') + dir)
      self.index = 1
      self.loadCurrent()
    }

    fetch(self.baseUrl + config.listUrl + '?dir=' + encodeURIComponent(dir)).then(res => {
      if (!res.ok) throw new Error(res.status)
      return res.text()
    }).then(onUrlsLoaded, e => self.title(e))
  }

  self.currentUrl = function() {
    return self.urls[self.index - 1]
  }

  self.nextUrl = function() {
    return self.urls[self.index]
  }

  self.random = function() {
    updateIndex(self.currentUrl(), self.urlsRandom || (self.urlsRandom = shuffle(self.urls.slice())))
  }

  self.sequential = function() {
    updateIndex(self.currentUrl(), self.urlsSequential || (self.urlsSequential = self.urls.slice().sort()))
  }

  self.title = function(text) {
    title.textContent = text
  }

  function updateIndex(currentUrl, newUrls) {
    if (currentUrl) self.index = newUrls.indexOf(currentUrl) + 1
    self.urls = newUrls
    if (self.status)
      self.status.textContent = self.index + '/' + self.urls.length
  }

  var debounce

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
    var array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  }
  else return Math.floor(Math.random() * max)
}

function shuffle(o) {
  for (var j, x, i = o.length; i; j = randomInt(i), x = o[--i], o[i] = o[j], o[j] = x);
  return o
}
