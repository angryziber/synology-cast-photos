var photos = (function(self) {
  var random = true;
  var urls = [], index = 0;
  var urlsRandom, urlsSequential;
  var nextImg = new Image();
  var $title = $('#title');
  var $status = $('#status');
  var $meta = $('#meta');
  var timer, meta, loading, displayedUrl;
  var canvas = $('canvas')[0];

  self.loadPhotoUrls = function(dir, random) {
    self.title('Loading photos from ' + dir);

    $.get(self.photoListUrl, {dir: dir}).then(
      function (data) {
        urls = data.trim().split('\n');
        urlsRandom = urlsSequential = null;
        if (random) self.random(); else self.sequential();
        self.title((random ? 'Random: ' : 'Sequential: ') + dir);
        index = 1;
        loadCurrent();
      },
      function (xhr, status, text) {
        self.title('Error: ' + text);
      }
    );
  };

  function currentUrl() {
    return urls[index - 1];
  }

  self.random = function() {
    updateIndex(currentUrl(), urlsRandom || (urlsRandom = shuffle(urls.slice())));
    random = true;
  };

  self.sequential = function() {
    updateIndex(currentUrl(), urlsSequential || (urlsSequential = urls.slice().sort()));
    random = false;
  };

  function updateIndex(currentUrl, newUrls) {
    if (currentUrl) index = newUrls.indexOf(currentUrl) + 1;
    urls = newUrls;
    $status.text(index + '/' + urls.length);
  }

  self.prev = function(by) {
    index -= parseInt(by || 1);
    if (index <= 0) index = urls.length;
    setTimeout(loadCurrent, 0);
  };

  self.next = function(by) {
    index += parseInt(by || 1);
    if (index > urls.length) index = 1;
    setTimeout(loadCurrent, 0);
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
    receiver.broadcast(title);
  };

  window.onresize = function() {
    if (nextImg.width) renderPhoto(nextImg, meta);
  };

  function loadCurrent() {
    var url = currentUrl();

    var nextImgPromise = $.Deferred();
    nextImg.onload = function() {nextImgPromise.resolve(this)};
    nextImg.onerror = nextImgPromise.reject;
    nextImg.src = self.photoUrlPrefix + url;
    meta = null;

    var metaPromise = $.get(self.metaUrlPrefix + url).then(function(data) {
      return meta = data;
    });
    loading = true;
    $status.text('Loading ' + index + '/' + urls.length);

    $.when(nextImgPromise, metaPromise).then(photoLoaded, photoLoadingFailed);
  }

  function photoLoaded(img, meta) {
    $status.text('Rendering ' + index + '/' + urls.length);

    setTimeout(function() {
      renderPhoto(img, meta);
      updateStatus(meta);
      loadNextPhotoAfter(self.interval);
    }, 0);
  }

  function resetCanvas(canvas) {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
  }

  function renderPhoto(img, meta) {
    resetCanvas(canvas);
    var src = downscaleByFactorsOf2(img);

    var canvasRatio = canvas.width / canvas.height;
    var imgRatio = img.width / img.height;
    var scaledWidth, scaledHeight, verticalScale;

    if (canvasRatio > imgRatio) {
      scaledHeight = canvas.height;
      scaledWidth = imgRatio * scaledHeight;
      verticalScale = 1 / imgRatio;
    }
    else {
      scaledWidth = canvas.width;
      scaledHeight = scaledWidth / imgRatio;
      verticalScale = imgRatio;
    }

    var canvasCtx = canvas.getContext('2d');
    translateAndRotate(canvasCtx, meta && meta.orientation, verticalScale);

    canvasCtx.drawImage(src.img, 0, 0, src.width, src.height, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
    if (src.img.getContext) src.img.width = src.img.height = 0;
  }

  function downscaleByFactorsOf2(img) {
    var src = {img: img, width: img.width, height: img.height};
    var steps = Math.ceil(Math.log(img.width / canvas.width) / Math.log(2));
    if (steps > 1) {
      var oc = document.createElement('canvas'), octx = oc.getContext('2d');
      oc.width = src.width / 2;
      oc.height = src.height / 2;
      for (var step = 1; step < steps; step++) {
        octx.drawImage(src.img, 0, 0, src.width /= 2, src.height /= 2);
        src.img = oc;
      }
    }
    return src;
  }

  function translateAndRotate(canvasCtx, orientation, verticalScale) {
    canvasCtx.translate(canvas.width / 2, canvas.height / 2);

    switch (orientation) {
      case '3':
        canvasCtx.rotate(Math.PI);
        break;
      case '6':
        canvasCtx.scale(verticalScale, verticalScale);
        canvasCtx.rotate(Math.PI / 2);
        break;
      case '8':
        canvasCtx.scale(verticalScale, verticalScale);
        canvasCtx.rotate(-Math.PI / 2);
        break;
    }
  }

  function updateStatus(meta) {
    displayedUrl = meta.file;
    var title = displayedUrl.substring(0, displayedUrl.lastIndexOf('/'));
    self.title(title.replace(/\//g, ' / '));
    $status.text(index + '/' + urls.length);
    $meta.html((meta.datetime || '') + '<br>' + (meta.focal ? meta.focal.replace('.0', '') : '') +
               (meta.exposure ? ', ' + meta.exposure : '') + (meta.fnumber ? ', ' + meta.fnumber : ''));
  }

  function photoLoadingFailed() {
    $status.text(index + '/' + urls.length + ': failed');
    loadNextPhotoAfter(self.interval / 4);
  }

  function loadNextPhotoAfter(timeout) {
    loading = false;
    if (timer) clearTimeout(timer);
    timer = setTimeout(self.next, timeout);
  }

  function randomInt(max) {
    if (window.crypto) {
      var array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % max;
    }
    else return Math.floor(Math.random() * max);
  }

  function shuffle(o) {
    for (var j, x, i = o.length; i; j = randomInt(i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  return self;
}(photos || {}));