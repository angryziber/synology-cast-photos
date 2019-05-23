var photos = (function(self) {
  BaseContent(self);

  var nextImg = $('link[rel=preload]')[0];
  var $title = $('#title');
  var $status = $('#status');
  var $meta = $('#meta');
  var timer, meta, loading, displayedUrl;
  var somePhotosLoaded = false;
  var style = 'contain';
  var photo;

  var modes = {
    img: {
      init: function() {
        photo = $('body').prepend('<img id="photo">').find('#photo')[0];
        photo.onload = function() {loadNextPhotoAfter(self.interval)}
      },
      renderPhoto: function(url) {
        photo.src = self.lanBaseUrl + self.photoUrlPrefix + url;
      },
      preloadNext: function() {
        nextImg.href = self.lanBaseUrl + self.photoUrlPrefix + self.nextUrl();
      },
      metaLoaded: function(meta) {
        var imgRatio = photo.width/photo.height;
        var horizontal = imgRatio >= 1.33;
        switch (meta.orientation) {
          case '3': photo.style.transform = 'rotate(180deg)'; break;
          case '6': photo.style.transform = 'scale(' + 1/imgRatio + ') rotate(90deg)'; horizontal = false; break;
          case '8': photo.style.transform = 'scale(' + 1/imgRatio + ') rotate(-90deg)'; horizontal = false; break;
          default:  photo.style.transform = 'none';
        }
        var screenRatio = innerWidth/innerHeight;
        if (style === 'cover' && horizontal) {
          var verticalScale = 100 * screenRatio / imgRatio * 0.9;
          photo.style.objectFit = verticalScale > 100 ? '100% ' + verticalScale + '%' : 'cover';
        }
        else photo.style.objectFit = 'contain';
      }
    },
    video: {
      init: function() {
        photo = $('body').prepend('<video id="photo" muted autoplay></video>').find('#photo')[0];
        photo.onplay = function() {loadNextPhotoAfter(self.interval)}
      },
      renderPhoto: function(url) {
        photo.src = self.lanBaseUrl + self.photoVideoUrlPrefix + url + this.videoStyle();
      },
      preloadNext: function() {
        nextImg.href = self.photoVideoUrlPrefix + self.nextUrl() + this.videoStyle() + '&preload=true';
      },
      videoStyle: function() {return innerWidth/innerHeight == 16/9 && style == 'contain' ? '&style=fill' : ''},
      metaLoaded: function() {}
    }
  };

  var mode = modes[self.mode];
  mode.init();

  photo.onerror = photoLoadingFailed;
  if (document.documentElement.requestFullscreen)
    photo.addEventListener('click', function() {document.documentElement.requestFullscreen()});

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
    photo.style.objectFit = s;
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
    $.get(self.metaUrlPrefix + url).then(function(data) {
      meta = data;
      updateStatus(meta);
      mode.metaLoaded(meta);
    });

    loading = true;
    $status.text('Loading ' + self.index + '/' + self.urls.length);

    mode.renderPhoto(url);
    setTimeout(function() {mode.preloadNext()}, self.interval/2);
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