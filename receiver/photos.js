var photos = (function(self) {
  BaseContent(self)

  var photo = document.getElementById('photo')
  var map = document.getElementById('map')
  var nextImg = document.querySelector('link[rel=preload]')
  var timer, meta, nextMeta, loading, displayedUrl, showingMap
  var style = 'contain'
  var mode, supports4k

  var modes = {
    img: {
      init: function() {
        photo.outerHTML = '<img id="photo">'
        photo = document.getElementById('photo')
        photo.onload = function() {loadNextPhotoAfter(self.interval)}
      },
      renderPhoto: function(url) {
        photo.src = self.baseUrl + self.photoUrlPrefix + url
      },
      preloadNext: function(url) {
        nextImg.href = self.baseUrl + self.photoUrlPrefix + url
      },
      applyMeta: function(meta) {
        var imgRatio = photo.naturalWidth / photo.naturalHeight
        var horizontal = imgRatio >= 1.33

        if (navigator.userAgent.includes('CrKey/1.3') /* Chromecast 1st gen */) {
          switch (meta.orientation) {
            case '3': photo.style.transform = 'rotate(180deg)'; break
            case '6': photo.style.transform = 'scale(' + (1 / imgRatio) + ') rotate(90deg)'; horizontal = false; break
            case '8': photo.style.transform = 'scale(' + (1 / imgRatio) + ') rotate(-90deg)'; horizontal = false; break
            default: photo.style.transform = 'none'
          }
        }

        if (style === 'cover' && horizontal) {
          var screenRatio = innerWidth / innerHeight
          var verticalScale = 100 * screenRatio / imgRatio * 0.9
          photo.style.objectFit = verticalScale > 100 ? '100% ' + verticalScale + '%' : 'cover'
        }
        else photo.style.objectFit = 'contain'
      },
    },
    video: {
      init: function() {
        photo.outerHTML = '<video id="photo" muted autoplay></video>'
        photo = document.getElementById('photo')
        photo.onplay = function() {loadNextPhotoAfter(self.interval)}
      },
      renderPhoto: function(url) {
        photo.src = self.baseUrl + self.photoVideoUrlPrefix + url + this.videoStyle()
      },
      preloadNext: function(url) {
        nextImg.href = self.photoVideoUrlPrefix + url + this.videoStyle() + '&preload=true'
      },
      videoStyle: function() {
        return (supports4k ? '&w=3840&h=2160' : '&w=' + innerWidth * devicePixelRatio + '&h=' + innerHeight * devicePixelRatio) +
               (innerWidth/innerHeight == 16/9 && style == 'contain' ? '&style=fill' : '')
      },
      applyMeta: function() {}
    }
  }

  self.init = function() {
    mode = modes[self.mode]
    mode.init()
    photo.onerror = photoLoadingFailed
    if (document.documentElement.requestFullscreen)
      photo.addEventListener('click', function() {document.documentElement.requestFullscreen()})
  }

  Object.defineProperty(self, 'supports4k', {
    get: function() {
      return supports4k
    },
    set: function(val) {
      supports4k = val
      self.mode = supports4k ? 'video' : 'img'
      self.init()
    }
  })

  self.changeMode = function(m) {
    self.mode = m
    self.init()
    self.loadCurrent()
  }

  self.changeStyle = function(s) {
    style = s
    photo.style.objectFit = s
    self.loadCurrent()
  }

  self.pause = function() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    else loadNextPhotoAfter(0)
  }

  self.mark = function(how) {
    fetch(self.markPhotoUrl, {method: 'POST', body: JSON.stringify({file: displayedUrl, how: how})}).then(
      text => self.title(text),
      e => self.title('Failed to mark: ' + e)
    )
  }

  self.show = function(id) {
    if (id == 'map') {
      map.style.display = 'block'
      updateMap()
    }
  }

  self.hide = function(id) {
    if (id == 'map') {
      map.style.display = 'none'
      showingMap = false
    }
  }

  function updateMap() {
    showingMap = true
    map.src = 'https://maps.googleapis.com/maps/api/staticmap?markers=' + meta.latitude + ',' + meta.longitude +
      '&zoom=9&size=500x300&maptype=terrain&key=' + self.googleMapsApiKey
  }

  function loadMeta(url) {
    return fetch(self.metaUrlPrefix + url).then(r => r.json())
  }

  var preloadTimer

  self.loadCurrent = function() {
    var url = self.currentUrl()
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
    var nextUrl = self.nextUrl()
    mode.preloadNext(nextUrl)
    nextMeta = undefined
    loadMeta(nextUrl).then(data => nextMeta = {url: nextUrl, data})
  }

  function updateStatus(meta) {
    displayedUrl = meta.file
    var title = displayedUrl.substring(0, displayedUrl.lastIndexOf('/')).replace(/\//g, ' / ')
    self.title(title)
    receiver.broadcast(self.index + ': ' + title + '|' + displayedUrl)
    self.status.textContent = self.index + '/' + self.urls.length
    self.meta.innerHTML = (meta.datetime || '') + '<br>' + (meta.focal ? meta.focal.replace('.0', '') : '') +
                          (meta.exposure ? ', ' + meta.exposure : '') + (meta.fnumber ? ', ' + meta.fnumber : '')
  }

  function photoLoadingFailed() {
    self.status.textContent = self.index + '/' + self.urls.length + ': failed'
    loadNextPhotoAfter(self.interval / 4)
  }

  function loadNextPhotoAfter(timeout) {
    loading = false
    clearTimeout(timer)
    timer = setTimeout(self.next, timeout)
  }

  return self
}(photos || {}))
