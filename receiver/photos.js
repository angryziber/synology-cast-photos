var photos = (function(self) {
  var urls = [], index = 0;
  var nextImg = new Image();
  var $title = $('#title');
  var $status = $('#status');
  var $meta = $('#meta');
  var timer, meta, loading;
  var canvas = $('canvas')[0];

  self.loadPhotoUrls = function(dir, random) {
    self.title('Loading photos from ' + dir);

    $.get(self.photoListUrl, {dir: dir}).then(
      function (data) {
        urls = data.trim().split('\n');
        if (random) shuffle(urls); else urls.sort();
        self.title((random ? 'Random: ' : 'Sequential: ') + dir);
        $status.text(urls.length);
        index = 1;
        loadCurrent();
      },
      function (xhr, status, text) {
        self.title('Error: ' + text);
      }
    );
  };

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

  self.title = function(title) {
    $title.text(title);
    receiver.broadcast(title);
  };

  window.onresize = function() {
    resetCanvas(canvas);
    if (nextImg.width) renderPhoto(nextImg);
  };

  function loadCurrent() {
    var url = urls[index - 1];

    var nextImgPromise = $.Deferred();
    nextImg.onload = function() {nextImgPromise.resolve(this)};
    nextImg.onerror = nextImgPromise.reject;
    nextImg.src = self.photoUrlPrefix + url;
    meta = null;

    var metaPromise = $.get(self.metaUrlPrefix + url, function (data) {
      meta = data;
    });
    loading = true;
    $status.text('Loading ' + index + '/' + urls.length);

    $.when(nextImgPromise, metaPromise).then(photoLoaded, photoLoadingFailed);
  }

  function photoLoaded(img) {
    $status.text('Rendering ' + index + '/' + urls.length);

    setTimeout(function() {
      renderPhoto(img);
      updateStatus(img.src);
      loadNextPhotoAfter(self.interval);
    }, 0);
  }

  function resetCanvas(canvas) {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
  }

  function renderPhoto(img) {
    resetCanvas(canvas);

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

    var offsetX = -canvas.width / 2 + (canvas.width - scaledWidth) / 2;
    var offsetY = -canvas.height / 2 + (canvas.height - scaledHeight) / 2;

    var canvasCtx = canvas.getContext('2d');
    canvasCtx.translate(canvas.width / 2, canvas.height / 2);

    switch (meta.orientation) {
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

    canvasCtx.drawImage(img, Math.round(offsetX), Math.round(offsetY), Math.round(scaledWidth), Math.round(scaledHeight));
  }

  function updateStatus(url) {
    self.title(decodeURI(url.substring(url.indexOf('=') + 1, url.lastIndexOf('/'))));
    $status.text(index + '/' + urls.length);
    $meta.html((meta.date || '') + '<br>' + (meta.focal ? meta.focal.replace('.0', '') : '') +
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

  function random(max) {
    if (window.crypto) {
      var array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % max;
    }
    else return Math.floor(Math.random() * max);
  }

  function shuffle(o) {
    for (var j, x, i = o.length; i; j = random(i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  return self;
}(photos || {}));