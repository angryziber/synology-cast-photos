var photos = (function(self) {
  var photos = [], index = 0;
  var nextImg = new Image();
  var $title = $('#title');
  var $status = $('#status');
  var $meta = $('#meta');
  var timer, meta, loading;
  var canvas = $('canvas')[0];
  var canvasCtx = canvas.getContext('2d');

  window.onresize = function () {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    if (nextImg.width) renderPhoto();
  };
  onresize();

  if (navigator.userAgent.indexOf('CrKey') >= 0) {
    // Running under Chromecast - receive commands from Chromecast senders
    var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    var castReceiverConfig = new cast.receiver.CastReceiverManager.Config();
    castReceiverConfig.maxInactivity = 60000;
    var messageBus = castReceiverManager.getCastMessageBus('urn:x-cast:message');
    messageBus.onMessage = function (e) {
      onCommand(e.data);
    };
    castReceiverManager.start(castReceiverConfig);
  }
  else {
    // Running as standalone web page - take commands from location hash
    window.onhashchange = function () {
      if (location.hash) onCommand(location.hash.substring(1));
    };
    onhashchange();

    function commandPrompt() {
      var command = prompt('Photo dir/command', location.hash ? location.hash.substring(1) : '');
      if (command) location.hash = '#' + command;
    }

    window.onkeydown = function (e) {
      switch (e.which) {
        case 37:
        case 38:
          onCommand('prev');
          break;
        case 33:
          onCommand('prev:10');
          break;
        case 39:
        case 40:
          onCommand('next');
          break;
        case 34:
          onCommand('next:10');
          break;
        case 27:
          commandPrompt();
      }
    };

    window.onHammerLoaded = function () {
      var hammer = new Hammer($('body')[0]);
      hammer.on('swiperight', function () {
        onCommand('prev');
      });
      hammer.on('swipeleft', function () {
        onCommand('next');
      });
      hammer.on('press', function () {
        commandPrompt();
      });
    };

    document.write('<script src="//cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min.js" onload="onHammerLoaded()"></scr' + 'ipt>');
  }

  function broadcast(message) {
    if (messageBus) messageBus.broadcast(message);
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

  function loadNext() {
    if (loading || !photos.length) return;
    if (index == photos.length) index = 0;
    index++;
    loadCurrent();
  }

  function loadCurrent() {
    var url = photos[index - 1];

    var nextImgPromise = $.Deferred();
    nextImg.onload = nextImgPromise.resolve;
    nextImg.onerror = nextImgPromise.reject;
    nextImg.src = self.photoUrlPrefix + url;
    meta = null;

    var metaPromise = $.get(self.metaUrlPrefix + url, function (data) {
      meta = data;
    });
    loading = true;
    $status.text('Loading ' + index + '/' + photos.length);

    $.when(nextImgPromise, metaPromise).then(photoLoaded, photoLoadingFailed);
  }

  function photoLoaded(img) {
    $status.text('Rendering ' + index + '/' + photos.length);

    setTimeout(function () {
      renderPhoto(img);
      updateStatus(img.src);
      loadNextPhotoAfter(self.interval);
    }, 0);
  }

  function renderPhoto() {
    var canvasRatio = canvas.width / canvas.height;
    var imgRatio = nextImg.width / nextImg.height;
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

    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
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

    canvasCtx.drawImage(nextImg, Math.round(offsetX), Math.round(offsetY), Math.round(scaledWidth), Math.round(scaledHeight));
  }

  function updateStatus(url) {
    $title.text(decodeURI(url.substring(url.indexOf('=') + 1, url.lastIndexOf('/'))));
    $status.text(index + '/' + photos.length);
    broadcast($title.text());
    $meta.html((meta.date || '') + '<br>' + (meta.exposure || '') + (meta.fnumber ? ', F' + eval(meta.fnumber) : ''));
  }

  function photoLoadingFailed() {
    $status.text(index + '/' + photos.length + ': failed');
    loadNextPhotoAfter(self.interval / 4);
  }

  function loadNextPhotoAfter(timeout) {
    loading = false;
    if (timer) clearTimeout(timer);
    timer = setTimeout(loadNext, timeout);
  }

  function loadPhotos(dir, random) {
    $title.text('Loading photos from ' + dir);

    $.ajax({
      url: self.photoListUrl, data: {dir: dir},
      success: function (data) {
        photos = data.trim().split('\n');
        if (random) shuffle(photos); else photos.sort();
        index = 0;
        $title.text((random ? 'Random: ' : 'Sequential: ') + dir);
        broadcast($title.text());
        $status.text(photos.length);
        loadNext();
      },
      error: function () {
        $title.text('Error: ' + arguments);
      }
    });
  }

  function onCommand(command) {
    var separatorPos = command.indexOf(':');
    if (separatorPos == -1) separatorPos = command.length;
    var cmd = command.substring(0, separatorPos);
    var arg = command.substring(separatorPos + 1);
    var title = command;

    if (cmd == 'rnd') {
      loadPhotos(arg, true);
    }
    else if (cmd == 'seq') {
      loadPhotos(arg, false);
    }
    else if (cmd == 'interval') {
      self.interval = parseInt(arg) * 1000;
      title = 'Interval: ' + arg + 's';
    }
    else if (cmd == 'prev') {
      index -= parseInt(arg || 1);
      if (index <= 0) index = photos.length;
      setTimeout(loadCurrent, 0);
    }
    else if (cmd == 'next') {
      index += parseInt(arg || 1);
      if (index > photos.length) index = 1;
      setTimeout(loadCurrent, 0);
    }
    else if (cmd == 'audio') {
      if (arg == 'prev') audio.prev();
      else if (arg == 'next') audio.next();
      else if (arg == 'stop') audio.stop();
      else {
        arg = arg.split('#');
        audio.addToPlaylist(arg[0], arg[1]);
        title = 'Added: ' + arg[1];
      }
    }
    else {
      loadPhotos(cmd, true);
    }

    $title.text(title);
    broadcast(title);
  }

  return self;
}(photos || {}));