function Videos(config) {
  BaseContent(this);
  var self = Object.assign(this, config);

  var title = document.getElementById('title');
  var status = document.getElementById('status');
  var video = document.getElementsByTagName('video')[0];

  video.addEventListener('ended', function() {
    self.next();
  });
  video.addEventListener('canplaythrough', function () {
    status.textContent = self.index + '/' + self.urls.length;
    video.play();
  });

  self.loadCurrent = function() {
    var url = self.currentUrl();
    status.textContent = 'Loading ' + self.index + '/' + self.urls.length;
    video.setAttribute('src', config.videoUrlPrefix + url);
    video.pause();
    self.title(url.substring(0, url.lastIndexOf('/')).replace('/', ' / '));
  };

  self.title = function(text) {
    title.textContent = text;
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
      self.loadCurrent();
    });
  };
}
