function Videos(config) {
  var self = Object.assign(this, config);

  var urls, index = 0;
  var title = document.getElementById('title');

  var video = document.getElementsByTagName('video')[0];

  video.addEventListener('canplaythrough', function () {
    video.play();
  });

  function loadVideo() {
    var url = urls[index];
    video.setAttribute('src', config.videoUrlPrefix + url);
    video.pause();
    self.title(url.substring(0, url.lastIndexOf('/')).replace('/', ' / '));
  }

  video.addEventListener('ended', self.next);

  self.title = function(text) {
    title.textContent = text;
  };

  self.prev = function(by) {
    index -= parseInt(by || 1);
    if (index <= 0) index = urls.length;
    loadVideo();
  };

  self.next = function(by) {
    index += parseInt(by || 1);
    if (index > urls.length) index = 1;
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
      urls = result.split('\n');
      if (random) shuffle(urls);
      loadVideo();
    });
  };
}
