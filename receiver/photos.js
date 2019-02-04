var photos = (function(self) {
  BaseContent(self);

  var nextImg = $('link[rel=preload]')[0];
  var $title = $('#title');
  var $status = $('#status');
  var $meta = $('#meta');
  var timer, meta, loading, displayedUrl;
  var somePhotosLoaded = false;
  var style = innerWidth/innerHeight == 16/9 ? 'contain' : 'cover';

  var photo = $('#photo')[0];
  photo.onplay = () => loadNextPhotoAfter(self.interval);
  photo.onerror = photoLoadingFailed;
  photo.addEventListener('click', () => document.documentElement.requestFullscreen());

  var modes = {
    photo: {
      // TODO
    },
    video: {
      renderPhoto: function(url) {
        photo.src = self.lanBaseUrl + self.photoVideoUrlPrefix + url;
      },
      preloadNext: function() {
        nextImg.href = self.photoVideoUrlPrefix + self.nextUrl() + `&style=${style}&preload=true`;
      },
      changeStyle: function(s) {
        photo.style.objectFit = s;
      }
    }
  };

  var mode = modes.video;
  mode.changeStyle(style);

  self.loadUrls = function(dir, random) {
    self.title('Loading photos from ' + dir);

    $.get(self.photoListUrl, {dir: dir}).then(
      function (data) {
        self.urls = data.trim().split('\n');
        self.urlsRandom = self.urlsSequential = null;
        if (random) self.random(); else self.sequential();
        self.title((random ? 'Random: ' : 'Sequential: ') + dir);
        self.index = 1;
        self.loadCurrent();
      },
      function (xhr, status, text) {
        self.title('Error: ' + text);
      }
    );
  };

  self.style = function(s) {
    style = s;
    mode.changeStyle(s);
  };

  self.pause = function() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    else loadNextPhotoAfter(0);
  };

  self.mark = function(how) {
    $.post(self.markPhotoUrl, {file: displayedUrl, how: how}).then(
      function(text) {
        self.title(text);
      },
      function() {
        self.title('Failed to mark: ' + text);
      }
    );
  };

  self.title = function(title) {
    $title.text(title);
  };

  self.loadCurrent = function() {
    var url = self.currentUrl();
    meta = null;
    $.get(self.metaUrlPrefix + url).then(function(data) {
      meta = data;
      updateStatus(meta);
    });

    loading = true;
    $status.text('Loading ' + self.index + '/' + self.urls.length);

    mode.renderPhoto(url);
    setTimeout(() => mode.preloadNext(), self.interval/2);
  };

  function updateStatus(meta) {
    displayedUrl = meta.file;
    var title = displayedUrl.substring(0, displayedUrl.lastIndexOf('/')).replace(/\//g, ' / ');
    self.title(title);
    receiver.broadcast(self.index + ': ' + title + '|' + displayedUrl);
    $status.text(self.index + '/' + self.urls.length);
    $meta.html((meta.datetime || '') + '<br>' + (meta.focal ? meta.focal.replace('.0', '') : '') +
               (meta.exposure ? ', ' + meta.exposure : '') + (meta.fnumber ? ', ' + meta.fnumber : ''));
  }

  function photoLoadingFailed() {
    if (!somePhotosLoaded) {
      self.lanBaseUrl = '';
      mode.renderPhoto(self.currentUrl());
      return;
    }
    $status.text(self.index + '/' + self.urls.length + ': failed');
    loadNextPhotoAfter(self.interval / 4);
  }

  function loadNextPhotoAfter(timeout) {
    loading = false;
    somePhotosLoaded = true;
    clearTimeout(timer);
    timer = setTimeout(self.next, timeout);
  }

  return self;
}(photos || {}));