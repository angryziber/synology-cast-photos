function Videos(config) {
  BaseContent(this);
  var self = Object.assign(this, config);

  var title = document.getElementById('title');
  var status = document.getElementById('status');
  var video = document.getElementsByTagName('video')[0];

  var videoUrlPrefix = config.localVideoUrlPrefix;
  var someVideosPlayed = false;

  video.addEventListener('ended', () => self.next());
  video.addEventListener('error', () => {
    console.error(video.error);
    status.textContent = video.error.message;
    if (!someVideosPlayed) videoUrlPrefix = config.videoUrlPrefix;
    self.next();
  });
  video.addEventListener('canplaythrough', () => {
    status.textContent = self.index + '/' + self.urls.length;
    someVideosPlayed = true;
    play();
  });

  video.addEventListener('mouseenter', () => {
    if (!video.controls) video.controls = true;
  });
  video.addEventListener('click', () => {
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

  self.loadUrls = function(dir, random) {
    fetch(config.videoListUrl + '?dir=' + encodeURIComponent(dir)).then(res => {
      if (res.ok) return res.text();
      else throw new Error(res.status);
    }).then(result => {
      self.urls = result.split('\n');
      self.urlsRandom = self.urlsSequential = null;
      if (random) self.random(); else self.sequential();
      self.index = 1;
      self.loadCurrent();
    });
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
}
