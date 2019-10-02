var photos = (function(self) {
  BaseContent(self);

  var nextImg = $('link[rel=preload]')[0];
  var $title = $('#title');
  var $status = $('#status');
  var $meta = $('#meta');
  var timer, nextMeta, loading, displayedUrl;
  var somePhotosLoaded = false;
  var style = 'contain';
  var photo, mode, supports4k;

  var modes = {
    img: {
      init: function() {
        photo = $('body').prepend('<img id="photo">').find('#photo')[0];
        photo.onload = function() {loadNextPhotoAfter(self.interval)};
        nextImg.as = 'image';
      },
      renderPhoto: function(url) {
        photo.src = self.lanBaseUrl + self.photoUrlPrefix + url;
      },
      preloadNext: function(url) {
        nextImg.href = self.lanBaseUrl + self.photoUrlPrefix + url;
      },
      applyMeta: function(meta) {
        var imgRatio = photo.naturalWidth / photo.naturalHeight;
        var horizontal = imgRatio >= 1.33;
        var metaCss = {transform: 'none'};
        switch (meta.orientation) {
          case '3': metaCss.transform = 'rotate(180deg)'; break;
          case '6': metaCss.transform = 'scale(' + (1 / imgRatio) + ') rotate(90deg)'; horizontal = false; break;
          case '8': metaCss.transform = 'scale(' + (1 / imgRatio) + ') rotate(-90deg)'; horizontal = false; break;
        }
        var screenRatio = innerWidth / innerHeight;
        if (style === 'cover' && horizontal) {
          var verticalScale = 100 * screenRatio / imgRatio * 0.9;
          metaCss.objectFit = verticalScale > 100 ? '100% ' + verticalScale + '%' : 'cover';
        }
        else metaCss.objectFit = 'contain';
        $(photo).css(metaCss);
      },
    },
    video: {
      init: function() {
        photo = $('body').prepend('<video id="photo" muted autoplay></video>').find('#photo')[0];
        photo.onplay = function() {loadNextPhotoAfter(self.interval)};
        nextImg.as = 'video';
      },
      renderPhoto: function(url) {
        photo.src = self.lanBaseUrl + self.photoVideoUrlPrefix + url + this.videoStyle();
      },
      preloadNext: function(url) {
        nextImg.href = self.photoVideoUrlPrefix + url + this.videoStyle() + '&preload=true';
      },
      videoStyle: function() {return innerWidth/innerHeight == 16/9 && style == 'contain' ? '&style=fill' : ''},
      applyMeta: function() {}
    }
  };

  self.init = function() {
    mode = modes[self.mode];
    mode.init();
    photo.onerror = photoLoadingFailed;
    if (document.documentElement.requestFullscreen)
      photo.addEventListener('click', function() {document.documentElement.requestFullscreen()});
  };

  Object.defineProperty(self, 'supports4k', {
    get: function() {
      return supports4k;
    },
    set: function(val) {
      supports4k = val;
      self.mode = supports4k ? 'video' : 'img';
      self.init();
    }
  });

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

  self.changeMode = function(m) {
    $(photo).remove();
    self.mode = m;
    self.init();
    self.loadCurrent();
  };

  self.changeStyle = function(s) {
    style = s;
    photo.style.objectFit = s;
    self.loadCurrent();
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

  function loadMeta(url) {
    return $.get(self.metaUrlPrefix + url);
  }

  self.loadCurrent = function() {
    var url = self.currentUrl();
    loading = true;
    $status.text('Loading ' + self.index + '/' + self.urls.length);

    function metaLoaded(meta) {
      updateStatus(meta);
      mode.applyMeta(meta);
    }

    if (nextMeta) metaLoaded(nextMeta);
    else loadMeta(url).then(metaLoaded);

    mode.renderPhoto(url);

    setTimeout(self.preloadNext, 500);
  };

  self.preloadNext = function() {
    var nextUrl = self.nextUrl();
    mode.preloadNext(nextUrl);
    nextMeta = undefined;
    loadMeta(nextUrl).then(function(data) {
      nextMeta = data;
    });
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