function Videos(self) {
  BaseContent(self);

  var meta = document.getElementById('meta');
  var title = document.getElementById('title');
  var status = document.getElementById('status');
  var video = document.getElementsByTagName('video')[0];

  var videoUrlPrefix = self.baseUrl + self.videoUrlPrefix;
  var someVideosPlayed = false;

  setInterval(() => {
    if (video.currentTime >= video.duration - 3)
      video.classList.add('fade-out');
  }, 1500);

  video.addEventListener('ended', function() {
    video.classList.remove('fade-out');
    self.next();
  });
  
  video.addEventListener('error', function() {
    console.error(video.error);
    status.textContent = video.error.message;
    if (!someVideosPlayed) videoUrlPrefix = self.videoUrlPrefix;
    self.next();
  });
  
  video.addEventListener('canplaythrough', function() {
    status.textContent = self.index + '/' + self.urls.length;
    someVideosPlayed = true;
    play();
  });

  video.addEventListener('mouseenter', function() {
    if (!video.controls) video.controls = true;
  });
  
  video.addEventListener('click', function() {
    if (video.muted) video.muted = false;
    if (!video.controls) video.controls = true;
    video.requestFullscreen();
    if (!video.paused) play();
  });

  self.loadCurrent = function() {
    var url = self.currentUrl();
    status.textContent = 'Loading ' + self.index + '/' + self.urls.length;
    video.setAttribute('src', videoUrlPrefix + url);
    video.pause();
    self.title(url.substring(0, url.lastIndexOf('/')).replace(/\//g, ' / '));
    meta.textContent = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
  };

  self.title = function(text) {
    title.textContent = text;
  };

  self.pause = function() {
    if (video.paused)
      play();
    else
      video.pause();
  };

  function play() {
    var promise = video.play();
    if (promise) promise.catch((e) => {
      console.error(e);
      if (!video.muted) {
        video.muted = true;
        video.controls = true;
        play();
      }
    });
  }

  return self;
}
