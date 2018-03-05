function Videos(config) {
  BaseContent(this);
  var self = Object.assign(this, config);

  var title = document.getElementById('title');
  var video = document.getElementsByTagName('video')[0];

  video.addEventListener('canplaythrough', function () {
    video.play();
  });

  function loadVideo() {
    var url = self.currentUrl();
    video.setAttribute('src', config.videoUrlPrefix + url);
    video.pause();
    self.title(url.substring(0, url.lastIndexOf('/')).replace('/', ' / '));
  }

  video.addEventListener('ended', self.next);

  self.title = function(text) {
    title.textContent = text;
  };

  self.prev = function(by) {
    self.index -= parseInt(by || 1);
    if (self.index <= 0) self.index = self.urls.length;
    loadVideo();
  };

  self.next = function(by) {
    self.index += parseInt(by || 1);
    if (self.index > self.urls.length) self.index = 1;
    loadVideo();
  };

  self.pause = function() {
    if (video.paused)
      video.play();
    else
      video.pause();
  };

  self.loadUrls = function(dir, random) {
    fetch(config.videoListUrl + '?dir=' + dir).then(res => {
      if (res.ok) return res.text();
      else throw new Error(res.status);
    }).then(result => {
      self.urls = result.split('\n');
      self.urlsRandom = self.urlsSequential = null;
      if (random) self.random(); else self.sequential();
      self.index = 1;
      loadVideo();
    });
  };
}
