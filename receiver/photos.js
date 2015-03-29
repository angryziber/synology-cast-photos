var photos = (function(self) {
  var urls = [], index = 0;
  var nextImg = new Image();
  var $title = $('#title');
  var $status = $('#status');
  var $meta = $('#meta');
  var timer, meta, loading;
  var canvas = $('canvas')[0];
  var canvasCtx = canvas.getContext('2d');

  $(window).on('resize', function () {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    if (nextImg.width) renderPhoto(nextImg);
  }).trigger('resize');

  if (navigator.userAgent.indexOf('CrKey') >= 0)
    initAsReceiver(); // running under Chromecast - receive commands from Chromecast senders
  else
    initAsStandalone(); // running as standalone web page - take commands from location hash

  function initAsReceiver() {
    var receiverManager = cast.receiver.CastReceiverManager.getInstance();

    self.messageBus = receiverManager.getCastMessageBus(self.namespace);
    self.messageBus.onMessage = function(e) {
      onCommand(e.data);
    };

    var config = new cast.receiver.CastReceiverManager.Config();
    config.maxInactivity = 60000;
    receiverManager.start(config);
  }

  function initAsStandalone() {
    window.onhashchange = function() {
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

    document.write('<script src="//cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min.js" onload="onHammerLoaded()"></script>');
  }

  function broadcast(message) {
    if (self.messageBus) self.messageBus.broadcast(message);
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

  function loadPhotoUrls(dir, random) {
    $title.text('Loading photos from ' + dir);

    $.get(self.photoListUrl, {dir: dir}).then(
      function (data) {
        urls = data.trim().split('\n');
        if (random) shuffle(urls); else urls.sort();
        index = 0;
        $title.text((random ? 'Random: ' : 'Sequential: ') + dir);
        broadcast($title.text());
        $status.text(urls.length);
        loadNext();
      },
      function (xhr, status, text) {
        $title.text('Error: ' + text);
      }
    );
  }

  function loadNext() {
    if (loading || !urls.length) return;
    if (index == urls.length) index = 0;
    index++;
    loadCurrent();
  }

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

  function renderPhoto(img) {
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

    canvasCtx.drawImage(img, Math.round(offsetX), Math.round(offsetY), Math.round(scaledWidth), Math.round(scaledHeight));
  }

  function updateStatus(url) {
    $title.text(decodeURI(url.substring(url.indexOf('=') + 1, url.lastIndexOf('/'))));
    $status.text(index + '/' + urls.length);
    broadcast($title.text());
    $meta.html((meta.date || '') + '<br>' + (meta.exposure || '') + (meta.fnumber ? ', F' + eval(meta.fnumber) : ''));
  }

  function photoLoadingFailed() {
    $status.text(index + '/' + urls.length + ': failed');
    loadNextPhotoAfter(self.interval / 4);
  }

  function loadNextPhotoAfter(timeout) {
    loading = false;
    if (timer) clearTimeout(timer);
    timer = setTimeout(loadNext, timeout);
  }

  function onCommand(command) {
    var separatorPos = command.indexOf(':');
    if (separatorPos == -1) separatorPos = command.length;
    var cmd = command.substring(0, separatorPos);
    var arg = command.substring(separatorPos + 1);
    var title = command;

    if (cmd == 'rnd') {
      loadPhotoUrls(arg, true);
    }
    else if (cmd == 'seq') {
      loadPhotoUrls(arg, false);
    }
    else if (cmd == 'interval') {
      self.interval = parseInt(arg) * 1000;
      title = 'Interval: ' + arg + 's';
    }
    else if (cmd == 'prev') {
      index -= parseInt(arg || 1);
      if (index <= 0) index = urls.length;
      setTimeout(loadCurrent, 0);
    }
    else if (cmd == 'next') {
      index += parseInt(arg || 1);
      if (index > urls.length) index = 1;
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
      loadPhotoUrls(cmd, true);
    }

    $title.text(title);
    broadcast(title);
  }

  return self;
}(photos || {}));