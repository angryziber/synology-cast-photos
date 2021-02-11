import {BaseContent} from './content.js'
import config from './config.js'

export function Photos() {
  BaseContent.call(this)
  const self = this

  let content = document.getElementById('photo')
  const map = document.getElementById('map')
  const nextImg = document.querySelector('link[rel=preload]')
  let nextTimer, fadeOutTimer, meta, nextMeta, loading, displayedUrl
  let mode, supports4k

  self.state.mode = config.mode
  self.state.interval = config.interval
  self.state.style = 'contain'
  self.state.photos = true
  self.state.videos = false
  self.state.map = false

  const modes = {
    // loads images as-is, without server-side processing (good for older NAS with slow CPU)
    img: {
      init() {
        content.outerHTML = '<img id="photo">'
        content = document.getElementById('photo')
        content.onload = () => loadNextAfter(self.state.interval)
      },
      renderPhoto(url) {
        content.src = self.baseUrl + config.photoUrlPrefix + url
      },
      preloadNext(url) {
        nextImg.href = self.baseUrl + config.photoUrlPrefix + url
      },
      applyMeta(meta) {
        const imgRatio = content.naturalWidth / content.naturalHeight
        let horizontal = imgRatio >= 1.33

        if (navigator.userAgent.includes('CrKey/1.3') /* Chromecast 1st gen */) {
          switch (meta.orientation) {
            case '3': content.style.transform = 'rotate(180deg)'; break
            case '6': content.style.transform = 'scale(' + (1 / imgRatio) + ') rotate(90deg)'; horizontal = false; break
            case '8': content.style.transform = 'scale(' + (1 / imgRatio) + ') rotate(-90deg)'; horizontal = false; break
            default: content.style.transform = 'none'
          }
        }

        if (self.state.style === 'cover' && horizontal) {
          const screenRatio = innerWidth / innerHeight
          const verticalScale = 100 * screenRatio / imgRatio * 0.9
          content.style.objectFit = verticalScale > 100 ? '100% ' + verticalScale + '%' : 'cover'
        }
        else content.style.objectFit = 'contain'
      },
    },
    // supports photos with 4K/UHD resolution on Google Cast
    video: {
      init() {
        content.outerHTML = '<video id="photo"></video>'
        content = document.getElementById('photo')
        content.oncanplaythrough = playVideo
        content.onended = () => isVideo(content.src) ? self.next() : loadNextAfter(self.state.interval)
      },
      renderPhoto(url) {
        if (isVideo(url))
          content.src = self.baseUrl + config.videoUrlPrefix + url
        else
          content.src = self.baseUrl + config.photoVideoUrlPrefix + url + this.renderStyle()
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
    content.onerror = photoLoadingFailed
    if (document.documentElement.requestFullscreen)
      content.addEventListener('click', () => document.documentElement.requestFullscreen())
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
    if (self.urls.length) self.loadCurrent()
  }

  self.changeState = function(key, value) {
    self.state[key] = value
    if (key == 'photos' || key == 'videos') {
      self.listUrls = []
      if (self.state.photos) self.listUrls.push(config.listUrl)
      if (self.state.videos) self.listUrls.push(config.videoListUrl)
      self.loadUrlsAndShow(self.state.path, self.state.random)
    }
  }

  self.changeStyle = function(s) {
    self.state.style = s
    content.style.objectFit = s
    self.loadCurrent()
  }

  self.pause = function() {
    if (isVideo(content.src)) {
      if (content.paused) playVideo()
      else content.pause()
    }
    else if (nextTimer) {
      clearTimeout(fadeOutTimer)
      clearTimeout(nextTimer)
      nextTimer = null
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
    if (key == 'photos' || key == 'videos') self.changeState(key, true)
    else if (key == 'map') {
      map.style.display = 'block'
      updateMap()
    }
  }

  self.hide = function(key) {
    if (key == 'photos' || key == 'videos') self.changeState(key, false)
    else if (key == 'map') {
      map.style.display = 'none'
      self.state.map = false
    }
  }

  function updateMap() {
    self.state.map = true
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
      if (self.state.map) updateMap()
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
    loadNextAfter(self.state.interval / 4)
  }

  function loadNextAfter(sec) {
    loading = false
    clearTimeout(fadeOutTimer)
    clearTimeout(nextTimer)
    fadeOutAfter(sec)
    nextTimer = setTimeout(self.next, sec * 1000)
  }

  function fadeIn() {
    document.body.classList.remove('fade-out')
  }

  function fadeOut() {
    document.body.classList.add('fade-out')
  }

  function fadeOutAfter(sec) {
    if (sec > 2) fadeOutTimer = setTimeout(fadeOut, (sec - 1) * 1000)
  }

  function isVideo(url) {
    return url.toLowerCase().endsWith('.mp4')
  }

  function playVideo() {
    fadeIn()
    const promise = content.play()
    if (promise) promise.then(() => fadeOutAfter(content.duration), e => {
      console.error(e)
      if (!content.muted) {
        content.muted = true
        playVideo()
      }
    })
  }
}
