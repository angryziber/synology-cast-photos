function Photos(config) {
  const self = this
  self.interval = config.interval
  BaseContent.call(self, config)

  let photo = document.getElementById('photo')
  const map = document.getElementById('map')
  const nextImg = document.querySelector('link[rel=preload]')
  let timer, meta, nextMeta, loading, displayedUrl, showingMap
  let mode, supports4k

  self.state.mode = config.mode
  self.state.style = 'contain'
  self.state.photos = true
  self.state.videos = false

  const modes = {
    // loads images as-is, without server-side processing (good for older NAS with slow CPU)
    img: {
      init() {
        photo.outerHTML = '<img id="photo">'
        photo = document.getElementById('photo')
        photo.oncanplaythrough = () => photo.play()
        photo.onended = () => isVideo(photo.src) ? self.next() : loadNextAfter(self.interval)
      },
      renderPhoto(url) {
        photo.src = self.baseUrl + config.photoUrlPrefix + url
      },
      preloadNext(url) {
        nextImg.href = self.baseUrl + config.photoUrlPrefix + url
      },
      applyMeta(meta) {
        const imgRatio = photo.naturalWidth / photo.naturalHeight
        let horizontal = imgRatio >= 1.33

        if (navigator.userAgent.includes('CrKey/1.3') /* Chromecast 1st gen */) {
          switch (meta.orientation) {
            case '3': photo.style.transform = 'rotate(180deg)'; break
            case '6': photo.style.transform = 'scale(' + (1 / imgRatio) + ') rotate(90deg)'; horizontal = false; break
            case '8': photo.style.transform = 'scale(' + (1 / imgRatio) + ') rotate(-90deg)'; horizontal = false; break
            default: photo.style.transform = 'none'
          }
        }

        if (self.state.style === 'cover' && horizontal) {
          const screenRatio = innerWidth / innerHeight
          const verticalScale = 100 * screenRatio / imgRatio * 0.9
          photo.style.objectFit = verticalScale > 100 ? '100% ' + verticalScale + '%' : 'cover'
        }
        else photo.style.objectFit = 'contain'
      },
    },
    // supports photos with 4K/UHD resolution on Google Cast
    video: {
      init() {
        photo.outerHTML = '<video id="photo" muted autoplay></video>'
        photo = document.getElementById('photo')
        photo.onplay = () => loadNextAfter(self.interval)
      },
      renderPhoto(url) {
        if (isVideo(url))
          photo.src = self.baseUrl + config.videoUrlPrefix + url
        else
          photo.src = self.baseUrl + config.photoVideoUrlPrefix + url + this.renderStyle()
      },
      preloadNext(url) {
        if (!isVideo(url))
          nextImg.href = config.photoVideoUrlPrefix + url + this.renderStyle() + '&preload=true'
      },
      renderStyle() {
        return (supports4k ? '&w=3840&h=2160' : '&w=' + innerWidth * devicePixelRatio + '&h=' + innerHeight * devicePixelRatio) +
               (innerWidth/innerHeight == 16/9 && self.state.style == 'contain' ? '&style=fill' : '')
      },
      applyMeta() {}
    }
  }

  self.init = function() {
    mode = modes[self.state.mode]
    mode.init()
    photo.onerror = photoLoadingFailed
    if (document.documentElement.requestFullscreen)
      photo.addEventListener('click', () => document.documentElement.requestFullscreen())
  }

  Object.defineProperty(self, 'supports4k', {
    get: () => supports4k,
    set(val) {
      supports4k = val
      self.changeMode(supports4k ? 'video' : 'img')
    }
  })

  self.changeMode = function(mode) {
    self.state.mode = mode
    self.init()
    self.loadCurrent()
  }

  self.updateState = function(key, value) {
    self.state[key] = value
    if (key == 'photos' || key == 'videos') {
      self.listUrl = []
      if (self.state.photos) self.listUrl.push(config.listUrl)
      if (self.state.videos) self.listUrl.push(config.videoListUrl)
      self.loadUrlsAndShow(self.state.dir, self.state.random)
    }
  }

  self.changeStyle = function(s) {
    self.state.style = s
    photo.style.objectFit = s
    self.loadCurrent()
  }

  self.pause = function() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    else loadNextAfter(0)
  }

  self.mark = function(how) {
    fetch(config.markPhotoUrl, {method: 'POST', body: JSON.stringify({file: displayedUrl, how: how})}).then(r => {
      if (r.ok) return r.text()
      else self.title('Failed to mark: ' + r.status + ' ' + r.statusText)
    }).then(text => self.title(text))
  }

  self.show = function(key) {
    if (key == 'photos' || key == 'videos') self.updateState(key, true)
    else if (key == 'map') {
      map.style.display = 'block'
      updateMap()
    }
  }

  self.hide = function(key) {
    if (key == 'photos' || key == 'videos') self.updateState(key, true)
    else if (key == 'map') {
      map.style.display = 'none'
      showingMap = false
    }
  }

  function updateMap() {
    showingMap = true
    map.src = 'https://maps.googleapis.com/maps/api/staticmap?markers=' + meta.latitude + ',' + meta.longitude +
      '&zoom=9&size=500x300&maptype=terrain&key=' + config.googleMapsApiKey
  }

  async function loadMeta(url) {
    if (isVideo(url)) return {file: url, datetime: url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))}
    return fetch(config.metaUrlPrefix + url).then(r => r.json())
  }

  let preloadTimer

  self.loadCurrent = function() {
    const url = self.currentUrl()
    loading = true
    self.status.textContent = 'Loading ' + self.index + '/' + self.urls.length

    function metaLoaded(data) {
      meta = data
      updateStatus(meta)
      mode.applyMeta(meta)
      if (showingMap) updateMap()
    }

    if (nextMeta && nextMeta.url == url) metaLoaded(nextMeta.data)
    else loadMeta(url).then(metaLoaded)

    mode.renderPhoto(url)

    clearTimeout(preloadTimer)
    preloadTimer = setTimeout(self.preloadNext, 500)
  }

  self.preloadNext = function() {
    const nextUrl = self.nextUrl()
    mode.preloadNext(nextUrl)
    nextMeta = undefined
    loadMeta(nextUrl).then(data => nextMeta = {url: nextUrl, data})
  }

  function updateStatus(meta) {
    displayedUrl = meta.file
    const title = displayedUrl.substring(0, displayedUrl.lastIndexOf('/')).replace(/\//g, ' / ')
    self.title(title)
    receiver.broadcast(self.index + ': ' + title + '|' + displayedUrl)
    self.status.textContent = self.index + '/' + self.urls.length
    self.meta.innerHTML = (meta.datetime || '') + '<br>' + (meta.focal ? meta.focal.replace('.0', '') : '') +
                          (meta.exposure ? ', ' + meta.exposure : '') + (meta.fnumber ? ', ' + meta.fnumber : '')
  }

  function photoLoadingFailed() {
    self.status.textContent = self.index + '/' + self.urls.length + ': failed'
    loadNextAfter(self.interval / 4)
  }

  function loadNextAfter(timeout) {
    loading = false
    clearTimeout(timer)
    timer = setTimeout(self.next, timeout)
  }

  function isVideo(url) {
    return url.toLowerCase().endsWith('.mp4')
  }
}
