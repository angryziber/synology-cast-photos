function Videos(self) {
  BaseContent(self)

  var video = document.getElementsByTagName('video')[0]

  var videoUrlPrefix = self.baseUrl + self.videoUrlPrefix
  var someVideosPlayed = false

  setInterval(() => {
    if (video.currentTime >= video.duration - 1.5)
      document.body.classList.add('fade-out')
  }, 1000)

  video.addEventListener('ended', function() {
    self.next()
  })

  video.addEventListener('error', function() {
    console.error(video.error)
    self.status.textContent = video.error.message
    if (!someVideosPlayed) videoUrlPrefix = self.videoUrlPrefix
    self.next()
  })

  video.addEventListener('canplaythrough', function() {
    self.status.textContent = self.index + '/' + self.urls.length
    someVideosPlayed = true
    play()
  })

  document.body.addEventListener('click', function() {
    if (video.muted) video.muted = false
    video.requestFullscreen()
    if (!video.paused) play()
  })

  self.loadCurrent = function() {
    var url = self.currentUrl()
    self.status.textContent = 'Loading ' + self.index + '/' + self.urls.length
    video.setAttribute('src', videoUrlPrefix + url)
    video.pause()
    self.title(url.substring(0, url.lastIndexOf('/')).replace(/\//g, ' / '))
    self.meta.textContent = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
  }

  self.pause = function() {
    if (video.paused)
      play()
    else
      video.pause()
  }

  function play() {
    document.body.classList.remove('fade-out')
    var promise = video.play()
    if (promise) promise.catch((e) => {
      console.error(e)
      if (!video.muted) {
        video.muted = true
        play()
      }
    })
  }

  return self
}
